import fetch from 'node-fetch';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Payment } from '../models/Payment';

/**
 * x402 Protocol Service
 * Handles integration with x402 protocol for private payments
 */
export class X402Service {
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = config.x402.endpoint;
    this.apiKey = config.x402.apiKey;

    if (!this.endpoint || !this.apiKey) {
      logger.warn('x402 service not fully configured. Some features may not work.');
    }
  }

  /**
   * Create a private payment using x402 protocol
   */
  async createPrivatePayment(
    fromPublicKey: string,
    toPublicKey: string,
    amount: number,
    memo?: string
  ): Promise<{ privacyToken: string; encryptedData: string }> {
    try {
      if (!this.endpoint || !this.apiKey) {
        // Fallback: generate privacy token locally
        logger.warn('x402 endpoint not configured, using local privacy token generation');
        return this.generateLocalPrivacyToken(fromPublicKey, toPublicKey, amount);
      }

      const response = await fetch(`${this.endpoint}/api/v1/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: fromPublicKey,
          to: toPublicKey,
          amount,
          memo,
        }),
      });

      if (!response.ok) {
        throw new Error(`x402 API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        privacyToken: data.privacyToken,
        encryptedData: data.encryptedData,
      };
    } catch (error) {
      logger.error('Error creating x402 private payment:', error);
      // Fallback to local privacy token
      return this.generateLocalPrivacyToken(fromPublicKey, toPublicKey, amount);
    }
  }

  /**
   * Verify a privacy token
   */
  async verifyPrivacyToken(privacyToken: string): Promise<boolean> {
    try {
      if (!this.endpoint || !this.apiKey) {
        // Local verification fallback
        return this.verifyLocalPrivacyToken(privacyToken);
      }

      const response = await fetch(`${this.endpoint}/api/v1/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ privacyToken }),
      });

      return response.ok;
    } catch (error) {
      logger.error('Error verifying privacy token:', error);
      return false;
    }
  }

  /**
   * Generate privacy token locally (fallback when x402 endpoint not available)
   */
  private generateLocalPrivacyToken(
    fromPublicKey: string,
    toPublicKey: string,
    amount: number
  ): { privacyToken: string; encryptedData: string } {
    // Generate a privacy token that obfuscates payment details
    const timestamp = Date.now();
    const data = `${fromPublicKey}:${toPublicKey}:${amount}:${timestamp}`;
    
    // In production, use proper encryption
    const privacyToken = Buffer.from(data).toString('base64');
    const encryptedData = Buffer.from(JSON.stringify({
      from: fromPublicKey.substring(0, 8) + '...',
      to: toPublicKey.substring(0, 8) + '...',
      amount,
      timestamp,
    })).toString('base64');

    return { privacyToken, encryptedData };
  }

  /**
   * Verify privacy token locally (fallback)
   */
  private verifyLocalPrivacyToken(privacyToken: string): boolean {
    try {
      const decoded = Buffer.from(privacyToken, 'base64').toString('utf-8');
      return decoded.split(':').length === 4;
    } catch {
      return false;
    }
  }

  /**
   * Get payment details from privacy token (if authorized)
   */
  async getPaymentDetails(privacyToken: string): Promise<Partial<Payment> | null> {
    try {
      if (!this.endpoint || !this.apiKey) {
        return null; // Cannot retrieve details without x402 service
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fetch = (await import('node-fetch')).default || globalThis.fetch;
      const response = await fetch(`${this.endpoint}/api/v1/payments/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ privacyToken }),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting payment details:', error);
      return null;
    }
  }
}

export const x402Service = new X402Service();

