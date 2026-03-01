import axios, { AxiosInstance } from "axios";
import { PrismaClient } from "@prisma/client";

/**
 * Interface for Pump.fun fee transaction
 */
interface PumpFunFeeTransaction {
  signature: string;
  blockTime: number;
  amount: number;
  mint: string;
  sol_in: number;
  token_out: number;
}

/**
 * Pump.fun fee listener service
 */
export class PumpFunFeeListener {
  private rpcClient: AxiosInstance;
  private prisma: PrismaClient;
  private lastProcessedBlock: number = 0;
  private pollingIntervalMs: number = 12000; // 12 seconds
  private feeThresholdLamports: number = 1000000; // 0.001 SOL minimum
  private creatorFeeBasisPoints: number = 100; // 1% creator fee

  constructor(rpcUrl: string, prisma: PrismaClient) {
    this.rpcClient = axios.create({
      baseURL: rpcUrl,
      timeout: 30000,
    });
    this.prisma = prisma;
  }

  /**
   * Start listening for Pump.fun creator fees
   * 
   * @param wstrTokenMint WSTR token mint address
   * @param creatorAddress Creator wallet address
   */
  async startListening(wstrTokenMint: string, creatorAddress: string): Promise<void> {
    console.log(
      `[PumpFunFeeListener] Starting to monitor WSTR creator fees for token ${wstrTokenMint}`
    );

    while (true) {
      try {
        const fees = await this.pollRecent FeeTransactions(
          wstrTokenMint,
          creatorAddress
        );

        for (const fee of fees) {
          if (fee.amount >= this.feeThresholdLamports) {
            await this.processFeeTransaction(fee);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, this.pollingIntervalMs));
      } catch (error) {
        console.error("[PumpFunFeeListener] Error in polling loop:", error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Poll for recent fee transactions from Pump.fun
   * 
   * @param wstrTokenMint WSTR token mint address
   * @param creatorAddress Creator wallet address
   * @returns Array of fee transactions
   */
  private async pollRecentFeeTransactions(
    wstrTokenMint: string,
    creatorAddress: string
  ): Promise<PumpFunFeeTransaction[]> {
    try {
      // Get latest block
      const blockResponse = await this.rpcClient.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "getBlockHeight",
      });

      const currentBlock = blockResponse.data.result || 0;

      // Get signatures for address (creator receives fees here)
      const sigResponse = await this.rpcClient.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [
          creatorAddress,
          {
            limit: 50,
          },
        ],
      });

      const signatures = sigResponse.data.result || [];
      const newTransactions: PumpFunFeeTransaction[] = [];

      for (const sig of signatures) {
        if (
          sig.blockTime &&
          sig.blockTime > this.lastProcessedBlock * 1000
        ) {
          // Check if already processed
          const existing = await this.prisma.feeEvent.findUnique({
            where: { transactionHash: sig.signature },
          });

          if (!existing) {
            const txResponse = await this.rpcClient.post("", {
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: [sig.signature, "json"],
            });

            const tx = txResponse.data.result;
            if (tx && this.isFeeFromWstrToken(tx, wstrTokenMint)) {
              const amount = this.extractFeeAmount(tx);
              newTransactions.push({
                signature: sig.signature,
                blockTime: sig.blockTime,
                amount,
                mint: wstrTokenMint,
                sol_in: 0,
                token_out: 0,
              });
            }
          }
        }
      }

      this.lastProcessedBlock = Math.max(
        this.lastProcessedBlock,
        currentBlock
      );

      return newTransactions;
    } catch (error) {
      console.error("[PumpFunFeeListener] Error polling transactions:", error);
      return [];
    }
  }

  /**
   * Check if transaction contains fees from WSTR token
   * 
   * @param tx Transaction data
   * @param wstrTokenMint WSTR token mint
   * @returns True if transaction is from WSTR token
   */
  private isFeeFromWstrToken(tx: any, wstrTokenMint: string): boolean {
    if (!tx.meta || !tx.transaction) {
      return false;
    }

    // Check if transaction involves the WSTR token mint
    const accounts = tx.transaction.message?.accountKeys || [];
    return accounts.some((acc: any) =>
      acc.pubkey?.includes(wstrTokenMint.substring(0, 20))
    );
  }

  /**
   * Extract fee amount from transaction
   * 
   * @param tx Transaction data
   * @returns Fee amount in lamports
   */
  private extractFeeAmount(tx: any): number {
    const feeAmount = tx.meta?.fee || 5000;
    // Calculate 1% creator fee from transaction
    return Math.floor(feeAmount * (this.creatorFeeBasisPoints / 10000));
  }

  /**
   * Process a fee transaction and record it
   * 
   * @param fee Fee transaction
   */
  private async processFeeTransaction(fee: PumpFunFeeTransaction): Promise<void> {
    try {
      // Record fee event in database
      const feeEvent = await this.prisma.feeEvent.create({
        data: {
          amount: BigInt(fee.amount),
          transactionHash: fee.signature,
          blockNumber: BigInt(Math.floor(fee.blockTime / 1000)),
          timestamp: new Date(fee.blockTime * 1000),
        },
      });

      console.log(
        `[PumpFunFeeListener] Recorded fee event: ${fee.amount} lamports from ${fee.signature}`
      );

      // Emit event for fee received
      this.emitFeeReceived(feeEvent.amount.toString(), fee.signature);
    } catch (error) {
      if (error instanceof Error && !error.message.includes("Unique constraint failed")) {
        console.error("[PumpFunFeeListener] Error processing fee:", error);
      }
    }
  }

  /**
   * Emit fee received event
   * 
   * @param amount Fee amount in lamports
   * @param signature Transaction signature
   */
  private emitFeeReceived(amount: string, signature: string): void {
    // This would integrate with event system
    console.log(`[PumpFunFeeListener] Fee received: ${amount} lamports (${signature})`);
  }

  /**
   * Get total fees received
   * 
   * @returns Total fees in lamports
   */
  async getTotalFeesReceived(): Promise<number> {
    const result = await this.prisma.feeEvent.aggregate({
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || BigInt(0));
  }

  /**
   * Get unprocessed fees
   * 
   * @returns Unprocessed fee events
   */
  async getUnprocessedFees(): Promise<any[]> {
    return this.prisma.feeEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Mark fees as processed
   * 
   * @param feeIds Array of fee event IDs to mark as processed
   */
  async markFeesProcessed(feeIds: string[]): Promise<void> {
    await this.prisma.feeEvent.updateMany({
      where: { id: { in: feeIds } },
      data: { processed: true },
    });
  }
}
