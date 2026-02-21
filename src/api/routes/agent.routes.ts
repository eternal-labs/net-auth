import { Router, Request, Response } from 'express';
import { agentService } from '../../services/agent.service';
import { CreateAgentRequest } from '../../models/Agent';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * POST /api/agents/register
 * Register a new agent
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const request: CreateAgentRequest = req.body;

    if (!request.agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    const agent = await agentService.registerAgent(request);
    return res.status(201).json(agent);
  } catch (error) {
    logger.error('Error registering agent:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to register agent',
    });
  }
});

/**
 * GET /api/agents/:agentId
 * Get agent details
 */
router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agent = await agentService.getAgent(agentId);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json(agent);
  } catch (error) {
    logger.error('Error getting agent:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get agent',
    });
  }
});

/**
 * GET /api/agents/:agentId/balance
 * Get agent balance
 */
router.get('/:agentId/balance', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const balance = await agentService.getAgentBalance(agentId);
    return res.json(balance);
  } catch (error) {
    logger.error('Error getting agent balance:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get balance',
    });
  }
});

/**
 * GET /api/agents
 * List all agents
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const agents = await agentService.listAgents();
    return res.json(agents);
  } catch (error) {
    logger.error('Error listing agents:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list agents',
    });
  }
});

export { router as agentRoutes };

