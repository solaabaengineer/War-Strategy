import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

import { ConflictDetector } from "./services/conflictDetector";
import { ResourceMapper } from "./services/resourceMapper";
import { PumpFunFeeListener } from "./services/pumpFunListener";
import { SpotBuyer } from "./services/spotBuyer";
import { createApp } from "./api/server";

/**
 * Initialize and start the War Strategy backend server
 */
async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    // Validate required environment variables
    const requiredEnvVars = [
      "SOLANA_RPC_URL",
      "DATABASE_URL",
      "PORT",
      "WSTR_TOKEN_MINT",
      "CREATOR_ADDRESS",
      "TREASURY_PDA",
      "PROGRAM_ID",
      "METALS_API_KEY",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    const rpcUrl = process.env.SOLANA_RPC_URL!;
    const port = parseInt(process.env.PORT || "3000", 10);
    const wstrTokenMint = process.env.WSTR_TOKEN_MINT!;
    const creatorAddress = process.env.CREATOR_ADDRESS!;
    const treasuryPdaStr = process.env.TREASURY_PDA!;
    const programIdStr = process.env.PROGRAM_ID!;
    const metalsApiKey = process.env.METALS_API_KEY!;

    console.log("[Backend] Initializing War Strategy backend...");

    // Initialize Solana connection
    const connection = new Connection(rpcUrl, "confirmed");
    const treasuryPda = new PublicKey(treasuryPdaStr);
    const programId = new PublicKey(programIdStr);

    // Load anchor program IDL
    const idlPath = path.join(
      process.cwd(),
      process.env.IDL_PATH || "./idl/wstr_treasury.json"
    );
    let idl: any;
    if (fs.existsSync(idlPath)) {
      idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
    } else {
      console.warn(`[Backend] IDL file not found at ${idlPath}, using mock IDL`);
      idl = {
        version: "0.1.0",
        name: "wstr_treasury",
        accounts: [],
        instructions: [],
      };
    }

    // Create a dummy provider for now (in production use actual keypair)
    const provider = new anchor.AnchorProvider(
      connection,
      {} as any,
      anchor.AnchorProvider.defaultOptions()
    );
    anchor.setProvider(provider);

    const program = new anchor.Program(idl, programId, provider);

    // Initialize services
    console.log("[Backend] Initializing services...");
    const conflictDetector = new ConflictDetector();
    const resourceMapper = new ResourceMapper();
    const feeListener = new PumpFunFeeListener(rpcUrl, prisma);
    const spotBuyer = new SpotBuyer(metalsApiKey, prisma, program, treasuryPda);

    // Create Express app
    const app = createApp(
      prisma,
      conflictDetector,
      resourceMapper,
      feeListener,
      spotBuyer
    );

    // Start server
    app.listen(port, () => {
      console.log(`[Backend] War Strategy backend listening on port ${port}`);
      console.log(`[Backend] RPC: ${rpcUrl}`);
      console.log(`[Backend] WSTR Token: ${wstrTokenMint}`);
      console.log(
        `[Backend] API available at http://localhost:${port}/api/v1`
      );
    });

    // Start background services
    console.log("[Backend] Starting background services...");

    // Conflict detection (every 6 hours)
    setInterval(async () => {
      try {
        const conflicts = await conflictDetector.detectConflicts();
        console.log(`[Backend] Conflict detection: found ${conflicts.length} active zones`);

        // Sync to database
        for (const conflict of conflicts) {
          await prisma.conflict.upsert({
            where: { country: conflict.country },
            create: {
              country: conflict.country,
              region: conflict.region,
              latitude: conflict.latitude,
              longitude: conflict.longitude,
              intensity: conflict.intensity,
              deathToll: conflict.deathToll || 0,
            },
            update: {
              region: conflict.region,
              latitude: conflict.latitude,
              longitude: conflict.longitude,
              intensity: conflict.intensity,
              deathToll: conflict.deathToll || 0,
            },
          });
        }
      } catch (error) {
        console.error("[Backend] Error in conflict detection job:", error);
      }
    }, 6 * 60 * 60 * 1000);

    // Price updates (every hour)
    setInterval(async () => {
      try {
        await spotBuyer.updatePrices();
        console.log("[Backend] Updated commodity prices");
      } catch (error) {
        console.error("[Backend] Error updating prices:", error);
      }
    }, 60 * 60 * 1000);

    // Fee monitoring and processing
    (async () => {
      try {
        await feeListener.startListening(wstrTokenMint, creatorAddress);
      } catch (error) {
        console.error("[Backend] Error in fee listener:", error);
      }
    })();

    // Treasury snapshot (every 24 hours)
    setInterval(async () => {
      try {
        const totalFees = await feeListener.getTotalFeesReceived();
        const totalPurchaseValue = await spotBuyer.getTotalPurchaseValue();
        const resources = await prisma.resource.findMany();

        await prisma.treasurySnapshot.create({
          data: {
            totalUsdValue: BigInt(totalPurchaseValue),
            totalFeesReceived: BigInt(totalFees),
            resourceCount: resources.length,
          },
        });

        console.log("[Backend] Treasury snapshot recorded");
      } catch (error) {
        console.error("[Backend] Error recording treasury snapshot:", error);
      }
    }, 24 * 60 * 60 * 1000);

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("[Backend] Shutting down gracefully...");
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("[Backend] Fatal error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[Backend] Unexpected error:", error);
  process.exit(1);
});
