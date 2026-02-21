import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import { logger } from './utils/logger';
import { agentRoutes } from './api/routes/agent.routes';
import { paymentRoutes } from './api/routes/payment.routes';
import { errorHandler } from './api/middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.port || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'netauth', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`NetAuth server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Solana Network: ${config.solana.network}`);
});

export default app;

