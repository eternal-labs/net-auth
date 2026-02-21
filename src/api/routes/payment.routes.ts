import { Router, Request, Response } from 'express';
import { privacyService } from '../../services/privacy.service';
import { SendPaymentRequest, PaymentResponse } from '../../models/Payment';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * POST /api/payments/send
 * Send a payment between agents
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const request: SendPaymentRequest = req.body;

    // Validate request
    if (!request.fromAgentId || !request.toAgentId || !request.amount) {
      return res.status(400).json({
        error: 'fromAgentId, toAgentId, and amount are required',
      });
    }

    if (request.amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }

    if (request.fromAgentId === request.toAgentId) {
      return res.status(400).json({
        error: 'Cannot send payment to self',
      });
    }

    // Create private payment
    const payment = await privacyService.createPrivatePayment(
      request.fromAgentId,
      request.toAgentId,
      request.amount,
      request.memo
    );

    // Process payment asynchronously
    privacyService.processPayment(payment.id).catch((error) => {
      logger.error(`Failed to process payment ${payment.id}:`, error);
    });

    const response: PaymentResponse = {
      paymentId: payment.id,
      status: payment.status,
      message: 'Payment initiated',
    };

    return res.status(202).json(response);
  } catch (error) {
    logger.error('Error sending payment:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send payment',
    });
  }
});

/**
 * GET /api/payments/:paymentId
 * Get payment details
 */
router.get('/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const agentId = req.query.agentId as string | undefined;

    const payment = await privacyService.getPayment(paymentId, agentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(payment);
  } catch (error) {
    logger.error('Error getting payment:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get payment',
    });
  }
});

/**
 * GET /api/payments/agent/:agentId
 * Get all payments for an agent
 */
router.get('/agent/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const payments = await privacyService.getAgentPayments(agentId);
    return res.json(payments);
  } catch (error) {
    logger.error('Error getting agent payments:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get payments',
    });
  }
});

export { router as paymentRoutes };

