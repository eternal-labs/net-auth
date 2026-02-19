import { logger } from '../utils/logger';
import { Payment, PaymentStatus } from '../models/Payment';
import { x402Service } from './x402.service';
import { walletService } from './wallet.service';

/**
 * Privacy Service
 * Manages the privacy layer for payments, ensuring all transactions
 * are handled privately through the backend
 */
export class PrivacyService {
  private payments: Map<string, Payment> = new Map(); // In-memory storage (replace with DB)

  /**
   * Create a private payment with privacy layer
   */
  async createPrivatePayment(
    fromAgentId: string,
    toAgentId: string,
    amount: number,
    memo?: string
  ): Promise<Payment> {
    try {
      // Get wallets
      const fromWallet = await walletService.getWallet(fromAgentId);
      const toWallet = await walletService.getWallet(toAgentId);

      if (!fromWallet || !toWallet) {
        throw new Error('One or both wallets not found');
      }

      // Create privacy token through x402 protocol
      const { privacyToken, encryptedData } = await x402Service.createPrivatePayment(
        fromWallet.publicKey,
        toWallet.publicKey,
        amount,
        memo
      );

      // Create payment record with privacy token
      const payment: Payment = {
        id: this.generatePaymentId(),
        fromAgentId,
        toAgentId,
        amount,
        status: PaymentStatus.PENDING,
        memo,
        privacyToken,
        createdAt: new Date(),
      };

      this.payments.set(payment.id, payment);
      logger.info(`Created private payment ${payment.id} from ${fromAgentId} to ${toAgentId}`);

      return payment;
    } catch (error) {
      logger.error('Error creating private payment:', error);
      throw error;
    }
  }

  /**
   * Process a payment privately (backend handles the actual transaction)
   */
  async processPayment(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(`Payment ${paymentId} is not in pending status`);
    }

    try {
      payment.status = PaymentStatus.PROCESSING;
      this.payments.set(paymentId, payment);

      // Get wallets
      const fromKeypair = await walletService.getKeypair(payment.fromAgentId);
      const toWallet = await walletService.getWallet(payment.toAgentId);

      if (!toWallet) {
        throw new Error('Recipient wallet not found');
      }

      // Import payment service to execute transaction
      const { paymentService } = await import('./payment.service');
      const transactionSignature = await paymentService.executeTransaction(
        fromKeypair,
        toWallet.publicKey,
        payment.amount,
        payment.memo
      );

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionSignature = transactionSignature;
      payment.completedAt = new Date();
      this.payments.set(paymentId, payment);

      logger.info(`Payment ${paymentId} completed with signature ${transactionSignature}`);

      return payment;
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      this.payments.set(paymentId, payment);
      logger.error(`Payment ${paymentId} failed:`, error);
      throw error;
    }
  }

  /**
   * Get payment by ID (with privacy checks)
   */
  async getPayment(paymentId: string, agentId?: string): Promise<Payment | null> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      return null;
    }

    // Privacy check: only return if agent is involved in the payment
    if (agentId && payment.fromAgentId !== agentId && payment.toAgentId !== agentId) {
      return null; // Privacy: don't reveal payment details to unrelated agents
    }

    return payment;
  }

  /**
   * Get payments for an agent (with privacy filtering)
   */
  async getAgentPayments(agentId: string): Promise<Payment[]> {
    const allPayments = Array.from(this.payments.values());
    return allPayments.filter(
      (p) => p.fromAgentId === agentId || p.toAgentId === agentId
    );
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const privacyService = new PrivacyService();

