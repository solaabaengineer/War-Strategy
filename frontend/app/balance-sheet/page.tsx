"use client";

import { BalanceSheetVisualization } from "@/components/BalanceSheetVisualization";

/**
 * Balance sheet page
 */
export default function BalanceSheetPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Balance Sheet</h1>
          <p className="text-gray-400 mb-6">
            Complete transparency of all treasury holdings and valuations
          </p>
          
          {/* Verification Badge */}
          <div className="bg-military-green/20 border border-military-green rounded-lg p-4">
            <p className="text-sm text-gray-300">
              ✓ All holdings recorded on-chain with cryptographic proof. Treasury backed by
              real commodities purchased on global spot markets.
            </p>
          </div>
        </div>

        {/* Balance Sheet Visualization */}
        <BalanceSheetVisualization />

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-military-light p-6 rounded-lg border border-military-olive">
            <h3 className="text-lg font-bold text-military-gold mb-4">About This Balance Sheet</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <span>✓</span>
                <span>All purchases verified on Solana blockchain</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Real-time commodity pricing from APIs</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Monthly audits with independent verification</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Physical storage with insured warehouses</span>
              </li>
            </ul>
          </div>

          <div className="bg-military-light p-6 rounded-lg border border-military-olive">
            <h3 className="text-lg font-bold text-military-gold mb-4">Fee Recycling Mechanism</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between">
                <span className="font-semibold">Creator Fee</span>
                <span>1%</span>
              </li>
              <li className="flex justify-between p-3 bg-military-dark rounded">
                <span className="text-military-red">→ Resource Purchases</span>
                <span className="font-bold">80%</span>
              </li>
              <li className="flex justify-between p-3 bg-military-dark rounded">
                <span className="text-military-gold">→ Operations</span>
                <span className="font-bold">20%</span>
              </li>
              <li className="flex justify-between mt-3 pt-3 border-t border-military-olive">
                <span className="font-semibold">Auto-Burn Trigger</span>
                <span>&gt;200% backing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
