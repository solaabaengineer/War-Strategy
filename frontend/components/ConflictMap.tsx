"use client";

import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Conflict {
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  intensity: number;
  deathToll: number;
}

interface ConflictMapProps {
  conflicts: Conflict[];
}

/**
 * Interactive conflict map using Leaflet.js
 */
export default function ConflictMap({ conflicts }: ConflictMapProps) {
  /**
   * Get color based on intensity
   */
  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 70) return "#dc2626"; // Red
    if (intensity >= 50) return "#ea580c"; // Orange
    if (intensity >= 30) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  /**
   * Get radius based on intensity
   */
  const getRadius = (intensity: number): number => {
    return Math.max(5, intensity / 10);
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      className="w-full h-96 rounded-lg border border-military-olive"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {conflicts.map((conflict, idx) => (
        <CircleMarker
          key={idx}
          center={[conflict.latitude, conflict.longitude]}
          radius={getRadius(conflict.intensity)}
          fillColor={getIntensityColor(conflict.intensity)}
          fillOpacity={0.8}
          weight={2}
          opacity={1}
          color={getIntensityColor(conflict.intensity)}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-military-gray">
                {conflict.country}
              </h3>
              <p className="text-gray-600">{conflict.region}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p>
                  <span className="font-semibold">Intensity:</span>{" "}
                  {conflict.intensity}/100
                </p>
                <p>
                  <span className="font-semibold">Deaths:</span>{" "}
                  {conflict.deathToll.toLocaleString()}
                </p>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
