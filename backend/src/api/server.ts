import express, { Express, Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import { ConflictDetector } from "./services/conflictDetector";
import { ResourceMapper } from "./services/resourceMapper";
import { PumpFunFeeListener } from "./services/pumpFunListener";
import { SpotBuyer } from "./services/spotBuyer";

/**
 * Initialize Express application with routes
 */
export function createApp(
  prisma: PrismaClient,
  conflictDetector: ConflictDetector,
  resourceMapper: ResourceMapper,
  feeListener: PumpFunFeeListener,
  spotBuyer: SpotBuyer
): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ========================================================================
  // CONFLICT ROUTES
  // ========================================================================

  /**
   * GET /conflicts - Get all active conflicts
   */
  app.get("/api/v1/conflicts", async (_req: Request, res: Response) => {
    try {
      const conflicts = await conflictDetector.detectConflicts();
      res.json({
        success: true,
        data: conflicts,
        count: conflicts.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /conflicts/:country - Get conflict details for a country
   */
  app.get("/api/v1/conflicts/:country", async (req: Request, res: Response) => {
    try {
      const { country } = req.params;
      const conflict = conflictDetector.getConflictByCountry(country);

      if (!conflict) {
        return res.status(404).json({
          success: false,
          error: `No conflict data found for ${country}`,
        });
      }

      const resources = resourceMapper.getResourcesByCountry(country);
      res.json({
        success: true,
        data: {
          ...conflict,
          resources,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /conflicts/active/:minIntensity - Get conflicts above intensity threshold
   */
  app.get(
    "/api/v1/conflicts/active/:minIntensity",
    async (req: Request, res: Response) => {
      try {
        const minIntensity = parseInt(req.params.minIntensity, 10) || 20;
        const conflicts = conflictDetector.getActiveConflicts(minIntensity);

        res.json({
          success: true,
          data: conflicts,
          count: conflicts.length,
          threshold: minIntensity,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // ========================================================================
  // RESOURCE ROUTES
  // ========================================================================

  /**
   * GET /resources/:country - Get resources for a country
   */
  app.get("/api/v1/resources/:country", async (req: Request, res: Response) => {
    try {
      const { country } = req.params;
      const resources = resourceMapper.getResourcesByCountry(country);

      res.json({
        success: true,
        country,
        resources,
        count: resources.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /resources/producers/:resourceType - Get countries producing a resource
   */
  app.get(
    "/api/v1/resources/producers/:resourceType",
    async (req: Request, res: Response) => {
      try {
        const { resourceType } = req.params;
        const producers =
          resourceMapper.getProducersByResource(resourceType);

        res.json({
          success: true,
          resourceType,
          producers,
          count: producers.length,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // ========================================================================
  // PURCHASE & BALANCE SHEET ROUTES
  // ========================================================================

  /**
   * GET /balance-sheet - Get treasury balance sheet
   */
  app.get("/api/v1/balance-sheet", async (_req: Request, res: Response) => {
    try {
      const purchases = await spotBuyer.getPurchaseHistory(1000);
      const totalValue = await spotBuyer.getTotalPurchaseValue();

      // Group by resource
      const byResource: Record<string, any> = {};
      for (const purchase of purchases) {
        if (!byResource[purchase.resourceType]) {
          byResource[purchase.resourceType] = {
            resourceType: purchase.resourceType,
            totalQuantity: 0n,
            totalCost: 0n,
            purchases: [],
          };
        }
        byResource[purchase.resourceType].totalQuantity += purchase.quantity;
        byResource[purchase.resourceType].totalCost += purchase.totalCostUsd;
        byResource[purchase.resourceType].purchases.push(purchase);
      }

      const resources = Object.values(byResource).map((r: any) => ({
        resourceType: r.resourceType,
        totalQuantity: Number(r.totalQuantity),
        totalCostUsd: Number(r.totalCost),
        averagePriceUsd: Number(r.totalCost) / Number(r.totalQuantity),
        currentPrice: spotBuyer.getPrice(r.resourceType),
        purchaseCount: r.purchases.length,
      }));

      res.json({
        success: true,
        data: {
          totalValueUsd: totalValue / 100,
          resourceCount: resources.length,
          resources,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /purchases - Get purchase history
   */
  app.get("/api/v1/purchases", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
      const purchases = await spotBuyer.getPurchaseHistory(limit);

      res.json({
        success: true,
        data: purchases,
        count: purchases.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /purchases/:resourceType - Get purchases for a resource
   */
  app.get(
    "/api/v1/purchases/:resourceType",
    async (req: Request, res: Response) => {
      try {
        const { resourceType } = req.params;
        const purchases = await spotBuyer.getPurchasesByResource(resourceType);

        res.json({
          success: true,
          resourceType,
          data: purchases,
          count: purchases.length,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // ========================================================================
  // FEES & MONITORING ROUTES
  // ========================================================================

  /**
   * GET /fees - Get fee information
   */
  app.get("/api/v1/fees", async (_req: Request, res: Response) => {
    try {
      const totalFees = await feeListener.getTotalFeesReceived();
      const unprocessedFees = await feeListener.getUnprocessedFees();

      res.json({
        success: true,
        data: {
          totalFeesLamports: totalFees,
          totalFeesSOL: totalFees / 1e9,
          unprocessedFeesCount: unprocessedFees.length,
          unprocessedFees: unprocessedFees.slice(0, 20),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /status - Get overall system status
   */
  app.get("/api/v1/status", async (_req: Request, res: Response) => {
    try {
      const conflicts = await conflictDetector.detectConflicts();
      const totalFees = await feeListener.getTotalFeesReceived();
      const totalPurchaseValue = await spotBuyer.getTotalPurchaseValue();
      const purchases = await prisma.purchase.findMany();

      res.json({
        success: true,
        data: {
          conflicts: {
            total: conflicts.length,
            active: conflicts.filter((c) => c.intensity > 50).length,
          },
          treasury: {
            feesReceivedLamports: totalFees,
            feesReceivedUSD: totalFees / 1e9 * 150, // Approximate SOL price
          },
          purchases: {
            totalCount: purchases.length,
            totalValueUSD: totalPurchaseValue / 100,
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return app;
}
