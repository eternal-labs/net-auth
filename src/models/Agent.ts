export interface Agent {
  id: string;
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AgentWallet {
  agentId: string;
  publicKey: string;
  encryptedPrivateKey: string; // Encrypted private key
  balance: number; // in lamports
  lastSyncedAt: Date;
}

export interface CreateAgentRequest {
  agentId: string;
  publicKey?: string; // Optional: if agent wants to use existing key
}

export interface AgentBalance {
  agentId: string;
  balance: number;
  solBalance: number; // Human-readable SOL balance
}

