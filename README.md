# War Strategy - $WSTR Token

![image - 2026-03-01T004330 260](https://github.com/user-attachments/assets/43f13afc-2c48-458b-a353-370ef432ebd5)

X: https://x.com/WarStrategyy


> The first memecoin with a real balance sheet backed by conflict zone commodities on Solana

## Overview

$WSTR is a revolutionary memecoin that combines speculative trading with a tangible treasury backing mechanism. Every transaction fee automatically purchases commodities from global markets, creating real asset backing for the token.

### Key Features

- **Real Balance Sheet**: Actual commodities (gold, oil, copper, etc.) purchased and held as treasury assets
- **Automated Conflict Detection**: AI monitors ACLED & GDELT APIs to identify active conflicts and resource-rich regions
- **On-Chain Transparency**: All purchases recorded on Solana blockchain with cryptographic proof
- **Fair Launch**: 100% fair launch on Pump.fun, no team tokens, no pre-sale
- **Sustainable Mechanics**: 1% creator fee split 80% to resources, 20% to operations

## Architecture

```
War Strategy System Architecture
│
├── On-Chain Program (Solana/Anchor)
│   ├── Treasury PDA (master account)
│   ├── Resource Holdings (per-commodity accounts)
│   └── Event Logs (purchase records)
│
├── Backend Services (Node.js/Express)
│   ├── Conflict Detector (ACLED + GDELT polling)
│   ├── Resource Mapper (country → resources)
│   ├── Fee Listener (Pump.fun transactions)
│   ├── Spot Buyer (commodity purchase automation)
│   └── Database (Prisma + PostgreSQL)
│
├── Frontend (Next.js 14)
│   ├── Interactive Conflict Map (Leaflet.js)
│   ├── Balance Sheet Visualization (Recharts)
│   ├── Token Metrics (Jupiter + DexScreener API)
│   └── Conflicts Dashboard
│
└── Documentation & Scripts
    ├── Whitepaper
    ├── Tokenomics Doc
    └── Deploy & Simulator Scripts
```

## Project Structure

```
War-Strategy/
├── on-chain/                          # Solana program
│   ├── programs/wstr-treasury/src/
│   │   └── lib.rs                    # Full Anchor program
│   ├── tests/                         # Complete TypeScript test suite
│   ├── Anchor.toml
│   └── package.json
│
├── backend/                           # Node.js/Express API
│   ├── src/services/
│   │   ├── conflictDetector.ts       # ACLED + GDELT integration
│   │   ├── resourceMapper.ts          # Country to resources mapping
│   │   ├── pumpFunListener.ts         # Fee listener
│   │   └── spotBuyer.ts               # Commodity purchase logic
│   ├── src/api/server.ts              # Express routes
│   ├── src/index.ts                   # Main entry point
│   ├── prisma/schema.prisma           # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                          # Next.js 14 Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Homepage
│   │   ├── conflicts/page.tsx
│   │   ├── balance-sheet/page.tsx
│   │   └── tokenomics/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ConflictMap.tsx            # Leaflet.js interactive map
│   │   └── BalanceSheetVisualization.tsx
│   ├── lib/api.ts
│   ├── styles/globals.css
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/
│   ├── deploy.ts                      # Deployment automation
│   └── treasury-simulator.ts          # Mechanics simulator
│
├── docs/
│   ├── WHITEPAPER.md
│   └── TOKENOMICS.md
│
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Tech Stack

- **Solana Blockchain**: Web3.js, Anchor Framework (Rust)
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Data Visualization**: Recharts, Leaflet.js
- **External APIs**: ACLED, GDELT, Metals-API, Jupiter, DexScreener

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### On-Chain
```bash
cd on-chain
npm install
anchor test
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL="https://api.devnet.solana.com"
WSTR_TOKEN_MINT="..."
CREATOR_ADDRESS="..."
TREASURY_PDA="..."
PROGRAM_ID="..."
METALS_API_KEY="..."
PORT=3000
NODE_ENV="development"
```

## API Endpoints

- `GET /api/v1/conflicts` - All active conflicts
- `GET /api/v1/conflicts/:country` - Conflict details
- `GET /api/v1/balance-sheet` - Treasury holdings
- `GET /api/v1/purchases` - Purchase history
- `GET /api/v1/status` - System status

## Tokenomics

- **Total Supply**: 1,000,000,000 $WSTR
- **Fair Launch**: 100% on Pump.fun
- **Creator Fee**: 1% (80% resources, 20% operations)
- **Burn Trigger**: Treasury backing > 200%

## Disclaimer

⚠️ This is a memecoin. Crypto markets are volatile. Only invest what you can afford to lose.

## License

MIT License

## Support

- Docs: [docs/](docs/)
- GitHub: Issue reporting
- Discord/Twitter: [@WarStrategyWSTR](https://twitter.com)

---

**Built with ❤️ for the Solana ecosystem**
