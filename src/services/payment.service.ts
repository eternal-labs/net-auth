import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Payment Service
 * Handles actual Solana transaction execution
 */
export class PaymentService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
  }

  /**
   * Execute a Solana transaction
   */
  async executeTransaction(
    fromKeypair: Keypair,
    toPublicKey: string,
    amount: number, // in lamports
    memo?: string
  ): Promise<string> {
    try {
      // Check balance
      const balance = await this.connection.getBalance(fromKeypair.publicKey);
      if (balance < amount) {
        throw new Error(`Insufficient balance. Required: ${amount} lamports, Available: ${balance} lamports`);
      }

      // Create transaction
      const transaction = new Transaction();
      const recipientPubkey = new PublicKey(toPublicKey);

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: amount,
        })
      );

      // Add memo if provided
      if (memo) {
        // Note: In production, you'd use @solana/spl-memo for memo instructions
        // For now, we'll just log it
        logger.info(`Payment memo: ${memo}`);
      }

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKeypair.publicKey;

      // Sign and send transaction
      logger.info(`Sending ${amount} lamports (${amount / LAMPORTS_PER_SOL} SOL) from ${fromKeypair.publicKey.toBase58()} to ${toPublicKey}`);
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair],
        {
          commitment: 'confirmed',
        }
      );

      logger.info(`Transaction confirmed: ${signature}`);
      return signature;
    } catch (error) {
      logger.error('Error executing transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<{
    confirmed: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return {
        confirmed: status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized',
        status: status?.value?.confirmationStatus,
        error: status?.value?.err ? JSON.stringify(status.value.err) : undefined,
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      return {
        confirmed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const paymentService = new PaymentService();

