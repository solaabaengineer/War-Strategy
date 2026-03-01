import { ConflictMapContainer } from "@/components/ConflictMapContainer";
import { BalanceSheetVisualization } from "@/components/BalanceSheetVisualization";

/**
 * Home page
 */
export default function Home() {
  return (
    <div className="space-y-12 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white">
          War Strategy
        </h1>
        <div className="h-1 w-24 bg-military-red mx-auto"></div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          The first memecoin with a <span className="text-military-red font-bold">real balance sheet</span>.
          <br />
          Backed by commodities from active conflict zones, powered by Solana.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <button className="px-8 py-3 bg-military-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Buy $WSTR
          </button>
          <button className="px-8 py-3 border border-military-gold text-military-gold rounded-lg font-semibold hover:bg-military-gold hover:text-military-dark transition-colors">
            Read Whitepaper
          </button>
        </div>
      </section>

      {/* Active Conflicts Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Military Conflict Monitor
            </h2>
            <p className="text-gray-400">
              Real-time tracking of active conflicts and their key resources
            </p>
          </div>
          <ConflictMapContainer />
        </div>
      </section>

      {/* Treasury Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Treasury Balance Sheet
            </h2>
            <p className="text-gray-400">
              Complete transparency of all resource holdings and valuations
            </p>
          </div>
          <BalanceSheetVisualization />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-military-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-military-olive rounded-lg p-6 space-y-4 hover:border-military-red transition-colors">
              <div className="w-12 h-12 bg-military-red rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Real Commodity Backing
              </h3>
              <p className="text-gray-400">
                Every transaction fee purchases actual commodities on spot markets, creating tangible treasury backing for $WSTR.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-military-olive rounded-lg p-6 space-y-4 hover:border-military-green transition-colors">
              <div className="w-12 h-12 bg-military-green rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Conflict Detection AI
              </h3>
              <p className="text-gray-400">
                Automated monitoring of ACLED and GDELT APIs identifies active conflicts and prioritizes resource acquisition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-military-olive rounded-lg p-6 space-y-4 hover:border-military-gold transition-colors">
              <div className="w-12 h-12 bg-military-gold rounded-lg flex items-center justify-center">
                <span className="text-2xl">⛓️</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                On-Chain Transparency
              </h3>
              <p className="text-gray-400">
                All purchases recorded on Solana blockchain with full auditable history and proof of holdings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Tokenomics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-military-light p-8 rounded-lg border border-military-olive">
            <h3 className="text-xl font-bold text-military-gold mb-4">
              Supply Distribution
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex justify-between">
                <span>Total Supply</span>
                <span className="font-bold text-white">1,000,000,000</span>
              </li>
              <li className="flex justify-between">
                <span>Fair Launch</span>
                <span className="font-bold text-white">100%</span>
              </li>
              <li className="flex justify-between">
                <span>Dev / Team</span>
                <span className="font-bold text-white">0%</span>
              </li>
              <li className="flex justify-between">
                <span>Pre-sale</span>
                <span className="font-bold text-white">0%</span>
              </li>
            </ul>
          </div>

          <div className="bg-military-light p-8 rounded-lg border border-military-olive">
            <h3 className="text-xl font-bold text-military-gold mb-4">
              Fee Distribution
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex justify-between">
                <span>Creator Fee</span>
                <span className="font-bold text-white">1%</span>
              </li>
              <li className="flex justify-between">
                <span>→ Resource Purchases</span>
                <span className="font-bold text-military-red">80%</span>
              </li>
              <li className="flex justify-between">
                <span>→ Operations</span>
                <span className="font-bold text-military-gold">20%</span>
              </li>
              <li className="flex justify-between border-t border-military-olive pt-3 mt-3">
                <span>Auto-Burn Trigger</span>
                <span className="font-bold text-white">&gt;200% Backing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-military-red/10 border border-military-red py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
          <h2 className="text-3xl font-bold text-white">Ready to Join?</h2>
          <p className="text-gray-300">
            $WSTR launches on Pump.fun with 100% fair launch. Every transaction
            backs the treasury with real commodities.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-military-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Buy on Pump.fun
            </button>
            <button className="px-8 py-3 border border-military-gold text-military-gold rounded-lg font-semibold hover:bg-military-gold/10 transition-colors">
              View Chart
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
