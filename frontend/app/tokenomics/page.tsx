"use client";

/**
 * Tokenomics page
 */
export default function TokenomicsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Tokenomics</h1>
          <p className="text-gray-400">
            Complete breakdown of $WSTR token distribution and fee mechanics
          </p>
        </div>

        {/* Token Supply */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Token Supply</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-military-light p-8 rounded-lg border border-military-olive">
              <p className="text-gray-400 text-sm mb-2">Total Supply</p>
              <p className="text-4xl font-bold text-white mb-2">1,000,000,000</p>
              <p className="text-gray-400 text-sm">$WSTR tokens</p>
            </div>
            <div className="bg-military-light p-8 rounded-lg border border-military-olive">
              <p className="text-gray-400 text-sm mb-2">Launch Type</p>
              <p className="text-4xl font-bold text-military-green mb-2">100%</p>
              <p className="text-gray-400 text-sm">Fair Launch on Pump.fun</p>
            </div>
          </div>
        </section>

        {/* Distribution */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Distribution</h2>
          <div className="bg-military-light p-8 rounded-lg border border-military-olive">
            <h3 className="text-lg font-bold text-white mb-6">Where Tokens Go</h3>
            <div className="space-y-4">
              {[
                { label: "Public Liquidity Pool", percentage: 100, color: "bg-military-green" },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="font-bold text-white">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-military-dark rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-military-dark rounded border border-military-gold/30">
              <p className="text-sm text-military-gold">
                No pre-sale, no team tokens, no vesting. True fair launch.
              </p>
            </div>
          </div>
        </section>

        {/* Fee Mechanism */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Fee Mechanism</h2>
          
          <div className="bg-military-light p-8 rounded-lg border border-military-olive space-y-6">
            <h3 className="text-lg font-bold text-white">Creator Fee: 1%</h3>
            
            <div className="space-y-4">
              <div className="bg-military-dark p-4 rounded border-l-4 border-military-red">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Resource Purchases</span>
                  <span className="font-bold text-military-red">80%</span>
                </div>
                <p className="text-sm text-gray-400">
                  Automatically purchases commodities on global spot markets, backing the treasury with real assets.
                </p>
              </div>

              <div className="bg-military-dark p-4 rounded border-l-4 border-military-gold">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Operations & Development</span>
                  <span className="font-bold text-military-gold">20%</span>
                </div>
                <p className="text-sm text-gray-400">
                  Funds development, infrastructure, audits, and treasury management operations.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-900/30 rounded border border-blue-500">
              <p className="text-sm text-blue-200">
                Example: $1 in trading volume = $0.01 creator fee = $0.008 to buy commodities + $0.002 to operations
              </p>
            </div>
          </div>
        </section>

        {/* Burn Mechanism */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Burn Mechanism</h2>
          
          <div className="bg-military-light p-8 rounded-lg border border-military-olive">
            <div className="mb-6 p-4 bg-military-red/20 border border-military-red rounded">
              <p className="text-military-red font-bold">
                Automatic Burn Triggered: Treasury Backing &gt; 200%
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white mb-2">How It Works</h4>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                  <li>Treasury value continuously tracked on-chain</li>
                  <li>When treasury backing ratio exceeds 200%, burn is triggered</li>
                  <li>Tokens are burned proportionally to maintain economic stability</li>
                  <li>This increases scarcity and supports token value</li>
                </ol>
              </div>

              <div className="bg-military-dark p-4 rounded border border-military-olive/50">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-military-gold">Example:</span> If treasury is worth $2M and circulating market cap is $1M, the 200%+ backing triggers a burn to rebalance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Backing Calculation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Treasury Backing Calculation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-military-light p-6 rounded-lg border border-military-olive">
              <p className="text-gray-400 text-sm mb-3">Financial Backing Ratio</p>
              <p className="text-white mb-4">
                (Treasury Asset Value in USD) / (Circulating Supply × Price)
              </p>
              <div className="bg-military-dark p-3 rounded text-sm text-military-gold font-mono">
                Treasury Value / Market Cap
              </div>
            </div>

            <div className="bg-military-light p-6 rounded-lg border border-military-olive">
              <p className="text-gray-400 text-sm mb-3">Example Scenario</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Treasury Value: $2,000,000</li>
                <li>Market Cap: $1,000,000</li>
                <li>Backing Ratio: 200%</li>
                <li className="text-military-red font-bold">→ BURN TRIGGERED</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-gold">Development Roadmap</h2>
          
          <div className="space-y-4">
            {[
              { phase: "Phase 1", time: "Q1 2026", items: ["Fair launch on Pump.fun", "Initial conflict detection", "Treasury initialization"] },
              { phase: "Phase 2", time: "Q2 2026", items: ["Automated commodity purchases", "Balance sheet transparency", "API for developers"] },
              { phase: "Phase 3", time: "Q3 2026", items: ["Physical asset warehousing", "Independent audits", "DAO governance"] },
              { phase: "Phase 4", time: "Q4 2026", items: ["Derivatives trading", "Commodity index fund", "Global expansion"] },
            ].map((item, idx) => (
              <div key={idx} className="bg-military-light p-6 rounded-lg border border-military-olive hover:border-military-red transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-military-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{item.phase}</h4>
                    <p className="text-military-gold text-sm mb-3">{item.time}</p>
                    <ul className="space-y-1">
                      {item.items.map((subitem, subidx) => (
                        <li key={subidx} className="text-gray-300 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-military-gold rounded-full"></span>
                          {subitem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risks & Disclaimers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-military-red">Risks & Disclaimers</h2>
          
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 space-y-4">
            <p className="text-red-200 font-semibold">
              This is a memecoin and carries significant risks. Please review carefully:
            </p>
            <ul className="space-y-2 text-red-200 text-sm">
              <li>• Cryptocurrency markets are highly volatile</li>
              <li>• Treasury backing is not a guarantee of token value</li>
              <li>• Political situations in conflict zones can change rapidly</li>
              <li>• Commodity prices are subject to market forces</li>
              <li>• Smart contract audits do not eliminate all risks</li>
              <li>• Historical performance is not indicative of future results</li>
            </ul>
            <p className="text-red-200 text-xs mt-4">
              War Strategy is a speculative investment. Only invest what you can afford to lose.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
