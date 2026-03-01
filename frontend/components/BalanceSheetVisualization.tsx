"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BalanceSheetData {
  totalValueUsd: number;
  resourceCount: number;
  resources: Array<{
    resourceType: string;
    totalQuantity: number;
    totalCostUsd: number;
    currentPrice: { price: number; unit: string } | null;
    purchaseCount: number;
  }>;
}

/**
 * Balance sheet visualization component
 */
export function BalanceSheetVisualization() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/v1/balance-sheet");
        if (!response.ok) throw new Error("Failed to fetch balance sheet");

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load balance sheet"
        );
        // Mock data for demo
        setData({
          totalValueUsd: 2500000,
          resourceCount: 6,
          resources: [
            {
              resourceType: "gold",
              totalQuantity: 100,
              totalCostUsd: 200000,
              currentPrice: { price: 2100, unit: "troy_oz" },
              purchaseCount: 3,
            },
            {
              resourceType: "oil",
              totalQuantity: 5000,
              totalCostUsd: 400000,
              currentPrice: { price: 85, unit: "barrel" },
              purchaseCount: 2,
            },
            {
              resourceType: "copper",
              totalQuantity: 50000,
              totalCostUsd: 210000,
              currentPrice: { price: 4.2, unit: "pound" },
              purchaseCount: 1,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="text-center p-8">Loading balance sheet...</div>;
  if (error)
    return <div className="text-red-400 p-4 bg-red-900/20 rounded">{error}</div>;
  if (!data) return null;

  // Prepare data for pie chart
  const pieData = data.resources.map((r) => ({
    name: r.resourceType,
    value: r.totalCostUsd,
  }));

  const COLORS = [
    "#dc2626",
    "#6b8e23",
    "#eab308",
    "#22c55e",
    "#0ea5e9",
    "#a855f7",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-military-light p-6 rounded-lg border border-military-olive">
          <p className="text-military-gold text-sm font-semibold">
            Total Treasury Value
          </p>
          <p className="text-3xl font-bold text-military-red mt-2">
            ${(data.totalValueUsd / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-military-light p-6 rounded-lg border border-military-olive">
          <p className="text-military-gold text-sm font-semibold">
            Resources Held
          </p>
          <p className="text-3xl font-bold text-military-green mt-2">
            {data.resourceCount}
          </p>
        </div>
        <div className="bg-military-light p-6 rounded-lg border border-military-olive">
          <p className="text-military-gold text-sm font-semibold">
            Total Purchases
          </p>
          <p className="text-3xl font-bold text-military-gold mt-2">
            {data.resources.reduce((sum, r) => sum + r.purchaseCount, 0)}
          </p>
        </div>
      </div>

      {/* Value by Resource Chart */}
      <div className="bg-military-light p-6 rounded-lg border border-military-olive">
        <h3 className="text-white font-bold mb-4">Treasury Composition</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) =>
                `${name}: $${(value / 1000).toFixed(0)}k`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings Table */}
      <div className="bg-military-light p-6 rounded-lg border border-military-olive overflow-x-auto">
        <h3 className="text-white font-bold mb-4">Holdings Details</h3>
        <table className="w-full text-sm">
          <thead className="border-b border-military-olive">
            <tr>
              <th className="text-left text-military-gold py-2">Resource</th>
              <th className="text-right text-military-gold py-2">Quantity</th>
              <th className="text-right text-military-gold py-2">
                Cost Basis
              </th>
              <th className="text-right text-military-gold py-2">
                Current Price
              </th>
              <th className="text-right text-military-gold py-2">Purchases</th>
            </tr>
          </thead>
          <tbody>
            {data.resources.map((resource, idx) => (
              <tr
                key={idx}
                className="border-b border-military-olive/50 hover:bg-military-dark transition-colors"
              >
                <td className="py-3 capitalize text-gray-200">
                  {resource.resourceType}
                </td>
                <td className="py-3 text-right text-gray-300">
                  {resource.totalQuantity.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-300">
                  ${(resource.totalCostUsd / 1000).toFixed(1)}k
                </td>
                <td className="py-3 text-right text-gray-300">
                  {resource.currentPrice
                    ? `$${resource.currentPrice.price.toFixed(2)}`
                    : "N/A"}
                </td>
                <td className="py-3 text-right text-gray-300">
                  {resource.purchaseCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
