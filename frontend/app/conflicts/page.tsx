"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface ConflictZone {
  country: string;
  region: string;
  intensity: number;
  deathToll: number;
  resources: string[];
  lastUpdated: string;
}

/**
 * Conflicts page showing all monitored conflict zones
 */
export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<ConflictZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium">( "all");

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const response = await fetch("/api/v1/conflicts");
        if (response.ok) {
          const data = await response.json();
          setConflicts(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching conflicts:", error);
        // Mock data
        setConflicts([
          {
            country: "Ukraine",
            region: "Eastern Europe",
            intensity: 85,
            deathToll: 8000,
            resources: ["iron_ore", "coal", "manganese"],
            lastUpdated: new Date().toISOString(),
          },
          {
            country: "Syria",
            region: "Middle East",
            intensity: 72,
            deathToll: 45000,
            resources: ["oil", "natural_gas", "phosphates"],
            lastUpdated: new Date().toISOString(),
          },
          {
            country: "Yemen",
            region: "Middle East",
            intensity: 65,
            deathToll: 150000,
            resources: ["oil", "natural_gas"],
            lastUpdated: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, []);

  const filtered = conflicts.filter((c) => {
    if (filter === "high") return c.intensity >= 70;
    if (filter === "medium") return c.intensity >= 50 && c.intensity < 70;
    return true;
  });

  /**
   * Get intensity color
   */
  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 70) return "text-military-red";
    if (intensity >= 50) return "text-orange-400";
    return "text-military-gold";
  };

  /**
   * Get intensity badge background
   */
  const getIntensityBg = (intensity: number): string => {
    if (intensity >= 70) return "bg-red-900/30 border-red-500";
    if (intensity >= 50) return "bg-orange-900/30 border-orange-500";
    return "bg-yellow-900/30 border-yellow-500";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Conflict Zones</h1>
          <p className="text-gray-400">
            Real-time monitoring of active military conflicts and their key resources
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "high", "medium"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? "bg-military-red text-white"
                  : "bg-military-light border border-military-olive text-gray-300 hover:text-military-gold"
              }`}
            >
              {f === "all" ? "All Zones" : f === "high" ? "High Intensity (70+)" : "Medium (50-70)"}
            </button>
          ))}
        </div>

        {/* Conflict Cards */}
        {loading ? (
          <div className="text-center p-8">Loading conflict data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((conflict) => (
              <div
                key={conflict.country}
                className="bg-military-light border border-military-olive rounded-lg p-6 hover:border-military-red/50 transition-colors"
              >
                {/* Country Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {conflict.country}
                    </h3>
                    <p className="text-sm text-gray-400">{conflict.region}</p>
                  </div>
                  <div className={`px-3 py-2 rounded-lg border ${getIntensityBg(conflict.intensity)}`}>
                    <p className={`text-sm font-bold ${getIntensityColor(
                      conflict.intensity
                    )}`}>
                      {conflict.intensity}
                    </p>
                    <p className="text-xs text-gray-400">Intensity</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-military-olive">
                  <div>
                    <p className="text-gray-400 text-xs">Estimated Deaths</p>
                    <p className="text-lg font-bold text-military-red">
                      {conflict.deathToll.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Last Updated</p>
                    <p className="text-sm text-military-gold">
                      {new Date(conflict.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <p className="text-gray-400 text-xs mb-2">KEY RESOURCES</p>
                  <div className="flex flex-wrap gap-2">
                    {conflict.resources.map((resource) => (
                      <span
                        key={resource}
                        className="px-2 py-1 bg-military-dark rounded text-xs text-military-gold border border-military-olive/50"
                      >
                        {resource.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center p-8 bg-military-light rounded-lg border border-military-olive">
            <p className="text-gray-400">No conflicts match the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
