import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    const encryptionKey = config.security.encryptionKey;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    // Derive a 32-byte key from the encryption key
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  /**
   * Encrypt data
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine iv, authTag, and encrypted data
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

export const encryptionService = new EncryptionService();

