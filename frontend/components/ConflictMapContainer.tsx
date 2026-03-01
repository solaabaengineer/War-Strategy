"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

/**
 * Dynamically import Leaflet map to avoid SSR issues
 */
const DynamicMap = dynamic(() => import("./ConflictMap"), {
  loading: () => <div className="w-full h-96 bg-military-light rounded-lg flex items-center justify-center">Loading map...</div>,
  ssr: false,
});

interface Conflict {
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  intensity: number;
  deathToll: number;
  eventCount: number;
  lastUpdate: string;
  sources: string[];
}

/**
 * Conflict map container component
 */
export function ConflictMapContainer() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const response = await fetch("/api/v1/conflicts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch conflicts: ${response.statusText}`);
        }

        const data = await response.json();
        setConflicts(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load conflicts"
        );
        // Mock data for demo
        setConflicts([
          {
            country: "Ukraine",
            region: "Eastern Europe",
            latitude: 50.2,
            longitude: 28.6,
            intensity: 85,
            deathToll: 8000,
            eventCount: 150,
            lastUpdate: new Date().toISOString(),
            sources: ["ACLED"],
          },
          {
            country: "Syria",
            region: "Middle East",
            latitude: 34.8,
            longitude: 38.8,
            intensity: 72,
            deathToll: 45000,
            eventCount: 120,
            lastUpdate: new Date().toISOString(),
            sources: ["ACLED"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      <DynamicMap conflicts={conflicts} />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-military-light p-4 rounded-lg border border-military-olive">
          <p className="text-military-gold font-semibold text-sm">Active Zones</p>
          <p className="text-2xl font-bold text-white">{conflicts.length}</p>
        </div>
        <div className="bg-military-light p-4 rounded-lg border border-military-olive">
          <p className="text-military-gold font-semibold text-sm">Avg Intensity</p>
          <p className="text-2xl font-bold text-white">
            {conflicts.length > 0
              ? Math.round(
                  conflicts.reduce((sum, c) => sum + c.intensity, 0) /
                    conflicts.length
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
