# NetAuth Skills for Autonomous Agents

This document describes how autonomous agents can use NetAuth to manage wallets and send private payments on Solana.

## Overview

NetAuth provides a privacy-first payment infrastructure for autonomous agents. Each agent can:
- Own and manage a Solana wallet
- Send private payments to other agents using the x402 protocol
- Check balances and payment history
- All operations are handled privately through the backend

## Capabilities

### 1. Agent Registration
Register a new agent and receive a Solana wallet.

**API Endpoint:**
```
POST /api/agents/register
```

**Request:**
```json
{
  "agentId": "your-agent-id",
  "publicKey": "optional-existing-solana-public-key"
}
```

**Response:**
```json
{
  "id": "your-agent-id",
  "publicKey": "SolanaPublicKey...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

**Example (JavaScript/TypeScript):**
```typescript
async function registerAgent(agentId: string) {
  const response = await fetch('http://localhost:3000/api/agents/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId })
  });
  return await response.json();
}
```

### 2. Check Balance
Get the current SOL balance for an agent's wallet.

**API Endpoint:**
```
GET /api/agents/:agentId/balance
```

**Response:**
```json
{
  "agentId": "your-agent-id",
  "balance": 1000000000,
  "solBalance": 1.0
}
```

**Example:**
```typescript
async function getBalance(agentId: string) {
  const response = await fetch(`http://localhost:3000/api/agents/${agentId}/balance`);
  return await response.json();
}
```

### 3. Send Payment
Send a private payment to another agent.

**API Endpoint:**
```
POST /api/payments/send
```

**Request:**
```json
{
  "fromAgentId": "sender-agent-id",
  "toAgentId": "recipient-agent-id",
  "amount": 100000000,
  "memo": "Optional payment memo"
}
```

**Note:** Amount is in lamports (1 SOL = 1,000,000,000 lamports)

**Response:**
```json
{
  "paymentId": "pay_1234567890_abc123",
  "status": "pending",
  "message": "Payment initiated"
}
```

**Example:**
```typescript
async function sendPayment(
  fromAgentId: string,
  toAgentId: string,
  amountLamports: number,
  memo?: string
) {
  const response = await fetch('http://localhost:3000/api/payments/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAgentId,
      toAgentId,
      amount: amountLamports,
      memo
    })
  });
  return await response.json();
}

// Send 0.1 SOL (100,000,000 lamports)
await sendPayment('alice', 'bob', 100000000, 'Payment for services');
```

### 4. Check Payment Status
Get the status of a payment transaction.

**API Endpoint:**
```
GET /api/payments/:paymentId?agentId=your-agent-id
```

**Response:**
```json
{
  "id": "pay_1234567890_abc123",
  "fromAgentId": "alice",
  "toAgentId": "bob",
  "amount": 100000000,
  "status": "completed",
  "transactionSignature": "5j7s8K9L...",
  "memo": "Payment for services",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:01.000Z"
}
```

**Payment Status Values:**
- `pending` - Payment created but not yet processed
- `processing` - Payment being processed on Solana
- `completed` - Payment successfully completed
- `failed` - Payment failed

**Example:**
```typescript
async function getPaymentStatus(paymentId: string, agentId: string) {
  const response = await fetch(
    `http://localhost:3000/api/payments/${paymentId}?agentId=${agentId}`
  );
  return await response.json();
}
```

### 5. View Payment History
Get all payments for an agent (both sent and received).

**API Endpoint:**
```
GET /api/payments/agent/:agentId
```

**Response:**
```json
[
  {
    "id": "pay_1234567890_abc123",
    "fromAgentId": "alice",
    "toAgentId": "bob",
    "amount": 100000000,
    "status": "completed",
    "transactionSignature": "5j7s8K9L...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Example:**
```typescript
async function getPaymentHistory(agentId: string) {
  const response = await fetch(
    `http://localhost:3000/api/payments/agent/${agentId}`
  );
  return await response.json();
}
```

### 6. Get Agent Information
Retrieve agent details and wallet information.

**API Endpoint:**
```
GET /api/agents/:agentId
```

**Response:**
```json
{
  "id": "your-agent-id",
  "publicKey": "SolanaPublicKey...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

## Complete Agent Example

```typescript
class NetAuthAgent {
  private agentId: string;
  private baseUrl: string;

  constructor(agentId: string, baseUrl: string = 'http://localhost:3000') {
    this.agentId = agentId;
    this.baseUrl = baseUrl;
  }

  async register() {
    const response = await fetch(`${this.baseUrl}/api/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: this.agentId })
    });
    return await response.json();
  }

  async getBalance() {
    const response = await fetch(`${this.baseUrl}/api/agents/${this.agentId}/balance`);
    const data = await response.json();
    return {
      lamports: data.balance,
      sol: data.solBalance
    };
  }

  async sendPayment(toAgentId: string, solAmount: number, memo?: string) {
    const lamports = Math.floor(solAmount * 1_000_000_000);
    const response = await fetch(`${this.baseUrl}/api/payments/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAgentId: this.agentId,
        toAgentId,
        amount: lamports,
        memo
      })
    });
    return await response.json();
  }

  async getPaymentHistory() {
    const response = await fetch(`${this.baseUrl}/api/payments/agent/${this.agentId}`);
    return await response.json();
  }

  async getPaymentStatus(paymentId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/payments/${paymentId}?agentId=${this.agentId}`
    );
    return await response.json();
  }
}

// Usage
const agent = new NetAuthAgent('my-agent-id');
await agent.register();
const balance = await agent.getBalance();
console.log(`Balance: ${balance.sol} SOL`);

// Send 0.5 SOL to another agent
const payment = await agent.sendPayment('other-agent-id', 0.5, 'Payment for work');
console.log(`Payment ID: ${payment.paymentId}`);
```

## Privacy Features

- **Private Payments**: All payments use the x402 protocol for privacy
- **Privacy Tokens**: Each payment gets a privacy token that obfuscates transaction details
- **Backend Processing**: All sensitive operations (wallet management, transaction signing) happen in the backend
- **Access Control**: Agents can only view their own payments and payments they're involved in

## Error Handling

All API endpoints return standard HTTP status codes:
- `200` - Success
- `201` - Created (for registration)
- `202` - Accepted (for payment initiation)
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (agent/payment doesn't exist)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Configuration

To use NetAuth, agents need to know:
- **Base URL**: The NetAuth server endpoint (default: `http://localhost:3000`)
- **Agent ID**: A unique identifier for the agent
- **Network**: Solana network being used (mainnet, devnet, testnet)

## Best Practices

1. **Register Once**: Register your agent once and store the agent ID and public key
2. **Check Balance First**: Always check balance before sending payments
3. **Handle Async Payments**: Payments are processed asynchronously - check status after sending
4. **Store Payment IDs**: Keep track of payment IDs for status checking
5. **Error Handling**: Always handle errors and check response status codes
6. **Rate Limiting**: Be mindful of API rate limits in production

## Integration Examples

### Python
```python
import requests

class NetAuthAgent:
    def __init__(self, agent_id: str, base_url: str = "http://localhost:3000"):
        self.agent_id = agent_id
        self.base_url = base_url
    
    def register(self):
        response = requests.post(
            f"{self.base_url}/api/agents/register",
            json={"agentId": self.agent_id}
        )
        return response.json()
    
    def get_balance(self):
        response = requests.get(f"{self.base_url}/api/agents/{self.agent_id}/balance")
        return response.json()
    
    def send_payment(self, to_agent_id: str, sol_amount: float, memo: str = None):
        lamports = int(sol_amount * 1_000_000_000)
        response = requests.post(
            f"{self.base_url}/api/payments/send",
            json={
                "fromAgentId": self.agent_id,
                "toAgentId": to_agent_id,
                "amount": lamports,
                "memo": memo
            }
        )
        return response.json()
```

### Go
```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type NetAuthAgent struct {
    AgentID  string
    BaseURL  string
}

func (a *NetAuthAgent) Register() (map[string]interface{}, error) {
    data := map[string]string{"agentId": a.AgentID}
    jsonData, _ := json.Marshal(data)
    
    resp, err := http.Post(
        a.BaseURL+"/api/agents/register",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    return result, nil
}
```

## Security Notes

- Private keys are encrypted and stored securely in the backend
- Agents never have direct access to private keys
- All transactions are signed server-side
- Privacy tokens ensure payment details are protected
- Only agents involved in a payment can view its details

## Support

For issues or questions:
- Check the main README.md for setup instructions
- Review API documentation in the README
- Ensure the NetAuth server is running and configured correctly

