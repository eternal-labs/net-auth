# NetAuth Architecture

## Overview

NetAuth is designed as a privacy-first payment infrastructure for autonomous agents on Solana. The system ensures that all payments between agents are handled privately through the backend, using the x402 protocol for privacy guarantees.

## Core Components

### 1. Agent Service
- **Purpose**: Manages agent registration and lifecycle
- **Responsibilities**:
  - Register new agents
  - Track agent status
  - Manage agent metadata

### 2. Wallet Service
- **Purpose**: Manages Solana wallets for agents
- **Responsibilities**:
  - Generate new wallets for agents
  - Encrypt and store private keys securely
  - Query wallet balances
  - Provide keypairs for transaction signing

### 3. Privacy Service
- **Purpose**: Core privacy layer for payments
- **Responsibilities**:
  - Create private payment records
  - Manage privacy tokens
  - Filter payment visibility based on agent relationships
  - Coordinate payment processing

### 4. x402 Service
- **Purpose**: Integration with x402 protocol
- **Responsibilities**:
  - Create private payments through x402
  - Generate and verify privacy tokens
  - Handle x402 API communication
  - Fallback to local privacy when x402 unavailable

### 5. Payment Service
- **Purpose**: Execute Solana transactions
- **Responsibilities**:
  - Build and sign Solana transactions
  - Send transactions to Solana network
  - Track transaction status
  - Handle transaction errors

### 6. Encryption Service
- **Purpose**: Secure storage of sensitive data
- **Responsibilities**:
  - Encrypt private keys at rest
  - Decrypt keys for transaction signing
  - Use AES-256-GCM encryption

## Data Flow

### Payment Flow

```
1. Agent A requests payment to Agent B
   ↓
2. Privacy Service creates private payment record
   ↓
3. x402 Service generates privacy token
   ↓
4. Payment Service executes Solana transaction
   ↓
5. Transaction confirmed on Solana
   ↓
6. Payment status updated
```

### Privacy Guarantees

- Payment details are only visible to involved agents
- Privacy tokens obfuscate transaction details
- All sensitive operations happen in backend
- Private keys never exposed to agents

## Security Considerations

1. **Key Management**: Private keys are encrypted at rest using AES-256-GCM
2. **Access Control**: Agents can only see their own payments
3. **Transaction Signing**: All signing happens server-side
4. **Privacy Tokens**: x402 protocol ensures payment privacy

## Storage

Currently using in-memory storage (Maps). In production, replace with:
- PostgreSQL for agent and payment records
- Encrypted key-value store for wallet data
- Redis for caching and session management

## API Design

RESTful API with clear separation of concerns:
- `/api/agents/*` - Agent management
- `/api/payments/*` - Payment operations

All endpoints return JSON and use standard HTTP status codes.

## Future Enhancements

1. Database integration (PostgreSQL)
2. Authentication and authorization
3. Rate limiting
4. Webhook support for payment notifications
5. Multi-signature wallet support
6. Token payments (SPL tokens)
7. Payment scheduling
8. Analytics and reporting

