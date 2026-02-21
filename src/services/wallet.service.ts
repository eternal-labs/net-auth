import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AgentWallet } from '../models/Agent';
import { encryptionService } from './encryption.service';

export class WalletService {
  private connection: Connection;
  private wallets: Map<string, AgentWallet> = new Map(); // In-memory storage (replace with DB in production)

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    logger.info('WalletService initialized');
  }

  /**
   * Create a new wallet for an agent
   */
  async createWallet(agentId: string, existingPublicKey?: string): Promise<AgentWallet> {
    try {
      let keypair: Keypair;
      let publicKey: string;

      if (existingPublicKey) {
        // Agent wants to use existing key
        publicKey = existingPublicKey;
        // In production, you'd need to handle the private key differently
        // For now, we'll create a new keypair but note the public key
        keypair = Keypair.generate();
        logger.warn(`Agent ${agentId} specified existing public key, but full keypair management not implemented`);
      } else {
        // Generate new keypair
        keypair = Keypair.generate();
        publicKey = keypair.publicKey.toBase58();
      }

      // Encrypt and store private key
      const privateKeyArray = Array.from(keypair.secretKey);
      const encryptedPrivateKey = encryptionService.encrypt(JSON.stringify(privateKeyArray));

      const wallet: AgentWallet = {
        agentId,
        publicKey,
        encryptedPrivateKey,
        balance: 0,
        lastSyncedAt: new Date(),
      };

      this.wallets.set(agentId, wallet);
      logger.info(`Created wallet for agent ${agentId}: ${publicKey}`);

      return wallet;
    } catch (error) {
      logger.error(`Error creating wallet for agent ${agentId}:`, error);
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet for an agent
   */
  async getWallet(agentId: string): Promise<AgentWallet | null> {
    return this.wallets.get(agentId) || null;
  }

  /**
   * Get balance for an agent's wallet
   */
  async getBalance(agentId: string): Promise<number> {
    try {
      const wallet = await this.getWallet(agentId);
      if (!wallet) {
        throw new Error(`Wallet not found for agent ${agentId}`);
      }

      const publicKey = new PublicKey(wallet.publicKey);
      const balance = await this.connection.getBalance(publicKey);
      
      // Update cached balance
      wallet.balance = balance;
      wallet.lastSyncedAt = new Date();
      this.wallets.set(agentId, wallet);

      return balance;
    } catch (error) {
      logger.error(`Error getting balance for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get decrypted keypair for an agent (for signing transactions)
   */
  async getKeypair(agentId: string): Promise<Keypair> {
    const wallet = await this.getWallet(agentId);
    if (!wallet) {
      throw new Error(`Wallet not found for agent ${agentId}`);
    }

    try {
      const decryptedPrivateKey = encryptionService.decrypt(wallet.encryptedPrivateKey);
      const privateKeyArray = JSON.parse(decryptedPrivateKey);
      const secretKey = Uint8Array.from(privateKeyArray);
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      logger.error(`Error decrypting keypair for agent ${agentId}:`, error);
      throw new Error('Failed to decrypt wallet');
    }
  }

  /**
   * Convert lamports to SOL
   */
  lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Convert SOL to lamports
   */
  solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }
}

export const walletService = new WalletService();

