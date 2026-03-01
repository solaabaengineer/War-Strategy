import axios, { AxiosInstance } from "axios";
import { PrismaClient } from "@prisma/client";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * Resource price from commodity API
 */
interface ResourcePrice {
  resource: string;
  price: number;
  unit: string;
  timestamp: Date;
  source: string;
}

/**
 * Spot buyer service - manages purchasing commodities and recording on-chain
 */
export class SpotBuyer {
  private priceClient: AxiosInstance;
  private prisma: PrismaClient;
  private program: anchor.Program;
  private treasuryPda: PublicKey;
  private priceCache: Map<string, ResourcePrice> = new Map();
  private lastPriceUpdate: number = 0;
  private priceUpdateIntervalMs: number = 60 * 60 * 1000; // 1 hour
  private feeThresholdLamports: number = 10000000; // 0.01 SOL minimum for purchase

  constructor(
    priceApiKey: string,
    prisma: PrismaClient,
    program: anchor.Program,
    treasuryPda: PublicKey
  ) {
    this.priceClient = axios.create({
      baseURL: "https://api.metals-api.com",
      timeout: 30000,
      params: {
        api_key: priceApiKey,
      },
    });

    this.prisma = prisma;
    this.program = program;
    this.treasuryPda = treasuryPda;
  }

  /**
   * Update commodity prices from external API
   */
  async updatePrices(): Promise<void> {
    const now = Date.now();
    if (now - this.lastPriceUpdate < this.priceUpdateIntervalMs) {
      return;
    }

    try {
      // Fetch precious metals
      const metalsResponse = await this.priceClient.get("/latest", {
        params: {
          base: "USD",
          symbols: "XAU,XAG,XPT,XPD",
        },
      });

      if (metalsResponse.data?.rates) {
        const rates = metalsResponse.data.rates;
        // Invert to get USD per troy oz
        this.priceCache.set("gold", {
          resource: "gold",
          price: 1 / rates.XAU,
          unit: "troy_oz",
          timestamp: new Date(),
          source: "metals-api",
        });
        this.priceCache.set("silver", {
          resource: "silver",
          price: 1 / rates.XAG,
          unit: "troy_oz",
          timestamp: new Date(),
          source: "metals-api",
        });
        this.priceCache.set("platinum", {
          resource: "platinum",
          price: 1 / rates.XPT,
          unit: "troy_oz",
          timestamp: new Date(),
          source: "metals-api",
        });
      }

      // Fetch energy commodities (simplified - would use dedicated API)
      await this.fetchEnergyPrices();

      this.lastPriceUpdate = now;
    } catch (error) {
      console.error("[SpotBuyer] Error updating prices:", error);
    }
  }

  /**
   * Fetch energy commodity prices
   */
  private async fetchEnergyPrices(): Promise<void> {
    try {
      // Approximate prices from public sources
      // In production, use specialized API like EIA, IEX Cloud, etc.
      this.priceCache.set("oil", {
        resource: "oil",
        price: 85, // USD per barrel (approximate)
        unit: "barrel",
        timestamp: new Date(),
        source: "public-estimate",
      });
      this.priceCache.set("natural_gas", {
        resource: "natural_gas",
        price: 3.5, // USD per MMBtu
        unit: "mmbtu",
        timestamp: new Date(),
        source: "public-estimate",
      });
      this.priceCache.set("wheat", {
        resource: "wheat",
        price: 7.2, // USD per bushel
        unit: "bushel",
        timestamp: new Date(),
        source: "public-estimate",
      });
      this.priceCache.set("copper", {
        resource: "copper",
        price: 4.2, // USD per pound
        unit: "pound",
        timestamp: new Date(),
        source: "public-estimate",
      });
    } catch (error) {
      console.error("[SpotBuyer] Error fetching energy prices:", error);
    }
  }

  /**
   * Get current price for a resource
   * 
   * @param resourceType Resource type
   * @returns Price information or null
   */
  getPrice(resourceType: string): ResourcePrice | null {
    return this.priceCache.get(resourceType.toLowerCase()) || null;
  }

  /**
   * Execute a resource purchase using accumulated fees
   * 
   * @param resourceType Resource type to purchase
   * @param availableFundsUsd Available funds in USD cents
   * @param authority Signer authority
   * @returns Purchase transaction hash
   */
  async executePurchase(
    resourceType: string,
    availableFundsUsd: number,
    authority: anchor.web3.Keypair
  ): Promise<string> {
    const price = this.getPrice(resourceType);
    if (!price) {
      throw new Error(`No price data available for ${resourceType}`);
    }

    // Calculate quantity that can be purchased
    const priceUsdCents = Math.floor(price.price * 100);
    const quantity = Math.floor(availableFundsUsd / priceUsdCents);

    if (quantity === 0) {
      throw new Error(
        `Insufficient funds to purchase ${resourceType} (need at least ${priceUsdCents} cents)`
      );
    }

    const totalCostUsd = quantity * priceUsdCents;

    try {
      // Record purchase on-chain
      const holdingPda = PublicKey.findProgramAddressSync(
        [Buffer.from("holding"), Buffer.from(resourceType)],
        this.program.programId
      )[0];

      const tx = await this.program.methods
        .recordPurchase(resourceType, new anchor.BN(quantity), new anchor.BN(priceUsdCents), new anchor.BN(totalCostUsd))
        .accounts({
          treasury: this.treasuryPda,
          holding: holdingPda,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Record in database
      await this.prisma.purchase.create({
        data: {
          resourceType,
          quantity: BigInt(quantity),
          unitPrice: BigInt(priceUsdCents),
          totalCostUsd: BigInt(totalCostUsd),
          transactionHash: tx,
          blockNumber: BigInt(0), // Will be updated on confirmation
          timestamp: new Date(),
        },
      });

      console.log(
        `[SpotBuyer] Purchased ${quantity} units of ${resourceType} for $${(totalCostUsd / 100).toFixed(2)} (tx: ${tx})`
      );

      return tx;
    } catch (error) {
      console.error(
        `[SpotBuyer] Error executing purchase for ${resourceType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if purchase should be triggered based on fee threshold
   * 
   * @param availableFees Accumulated fees in lamports
   * @returns True if purchase should be triggered
   */
  shouldTriggerPurchase(availableFees: number): boolean {
    const purchaseFunds = Math.floor(availableFees * (0.8)); // 80% of fees for purchases
    const minPurchaseAmount = 50000000; // ~$50 in SOL
    return purchaseFunds >= minPurchaseAmount;
  }

  /**
   * Get all purchase history
   * 
   * @param limit Number of records to return
   * @returns Purchase history
   */
  async getPurchaseHistory(limit: number = 100): Promise<any[]> {
    return this.prisma.purchase.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  /**
   * Get purchases by resource type
   * 
   * @param resourceType Resource type
   * @returns Purchases for the resource
   */
  async getPurchasesByResource(resourceType: string): Promise<any[]> {
    return this.prisma.purchase.findMany({
      where: { resourceType },
      orderBy: { timestamp: "desc" },
    });
  }

  /**
   * Get total value of all purchases
   * 
   * @returns Total cost in USD
   */
  async getTotalPurchaseValue(): Promise<number> {
    const result = await this.prisma.purchase.aggregate({
      _sum: {
        totalCostUsd: true,
      },
    });

    return Number(result._sum.totalCostUsd || BigInt(0));
  }
}
