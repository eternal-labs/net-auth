import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    network: process.env.NETWORK || 'mainnet-beta',
  },
  
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    jwtSecret: process.env.JWT_SECRET || '',
  },
  
  x402: {
    endpoint: process.env.X402_ENDPOINT || '',
    apiKey: process.env.X402_API_KEY || '',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validate required configuration
if (!config.security.encryptionKey) {
  console.warn('WARNING: ENCRYPTION_KEY not set. This is required for production.');
}

if (!config.x402.endpoint || !config.x402.apiKey) {
  console.warn('WARNING: X402 configuration not set. x402 protocol features may not work.');
}

