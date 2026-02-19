# NetAuth

An autonomous privacy layer for agent payments using x402 and Solana protocol.

## Overview

NetAuth provides a secure, private payment infrastructure for autonomous agents on Solana. Agents can own wallets and send payments to one another using the x402 protocol, with all privacy management handled transparently in the backend.

## Features

- 🔐 **Agent Wallet Management**: Each agent owns and controls their own Solana wallet
- 💸 **Private Payments**: Send payments between agents using x402 protocol with privacy guarantees
- 🛡️ **Privacy Layer**: All payment privacy is managed autonomously in the backend
- ⚡ **Solana Integration**: Built on Solana blockchain for fast, low-cost transactions
- 🤖 **Agent-First**: Designed specifically for autonomous agent-to-agent payments

## Architecture

```
┌─────────────┐
│   Agents    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  NetAuth API    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Privacy Layer  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  x402 Protocol  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Solana Network │
└─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana CLI (optional, for local development)

### Installation

#### Global Installation (Recommended)

Install NetAuth globally to use the CLI from anywhere:

```bash
npm install -g netauth
```

After installation, you can use the `netauth` command directly:

```bash
netauth --help
netauth agent register my-agent
```

#### Local Installation

For development or local use:

```bash
npm install
```

Then use via npm script:

```bash
npm run netauth
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `SOLANA_RPC_URL`: Your Solana RPC endpoint
- `NETWORK`: devnet, testnet, or mainnet-beta
- `PRIVATE_KEY`: Your service private key (for wallet management)

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Production

```bash
npm start
```

## CLI Usage

NetAuth includes a powerful CLI for managing agents and payments directly from the command line.

### Installation

If installed globally:

```bash
netauth --help
```

If installed locally:

```bash
npm run netauth -- --help
```

Or after building:

```bash
npm run build
node dist/cli/index.js
```

### CLI Commands

#### Agent Management

```bash
# Register a new agent
netauth agent register <agentId> [--key <publicKey>]

# Get agent information
netauth agent info <agentId>

# Get agent balance
netauth agent balance <agentId> [--sol]

# List all agents
netauth agent list
```

#### Payments

```bash
# Send a payment (in lamports)
netauth payment send <fromAgentId> <toAgentId> <amount> [--memo <memo>]

# Send a payment (in SOL)
netauth payment send <fromAgentId> <toAgentId> <amount> --sol [--memo <memo>]

# Get payment status
netauth payment status <paymentId> [--agent <agentId>]

# View payment history
netauth payment history <agentId> [--limit <number>]
```

#### Wallet Management

```bash
# Get wallet information
netauth wallet info <agentId>

# Convert between SOL and lamports
netauth wallet convert <amount> [--to sol|lamports]
```

### Examples

```bash
# Register an agent
netauth agent register agent-123

# Check balance
netauth agent balance agent-123 --sol

# Send 0.1 SOL to another agent
netauth payment send agent-123 agent-456 0.1 --sol --memo "Payment for services"

# View payment history
netauth payment history agent-123 --limit 20
```

## API Documentation

### Register Agent

```bash
POST /api/agents/register
{
  "agentId": "agent-123",
  "publicKey": "optional-existing-key"
}
```

### Send Payment

```bash
POST /api/payments/send
{
  "fromAgentId": "agent-123",
  "toAgentId": "agent-456",
  "amount": 1000000, // lamports
  "memo": "optional-memo"
}
```

### Get Agent Balance

```bash
GET /api/agents/:agentId/balance
```

## Project Structure

```
netauth/
├── src/
│   ├── services/          # Core business logic
│   │   ├── wallet.ts      # Wallet management
│   │   ├── payment.ts     # Payment processing
│   │   ├── privacy.ts     # Privacy layer
│   │   └── x402.ts        # x402 protocol integration
│   ├── api/               # API routes
│   ├── models/            # Data models
│   ├── utils/             # Utilities
│   └── config/            # Configuration
├── tests/                 # Test files
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## Security

- Private keys are encrypted at rest
- All sensitive operations require authentication
- Privacy layer ensures transaction details are protected
- Regular security audits recommended

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines first.

