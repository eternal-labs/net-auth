import { logger } from '../utils/logger';
import { Agent, CreateAgentRequest, AgentBalance } from '../models/Agent';
import { walletService } from './wallet.service';

/**
 * Agent Service
 * Manages agent registration and lifecycle
 */
export class AgentService {
  private agents: Map<string, Agent> = new Map(); // In-memory storage (replace with DB)

  /**
   * Register a new agent
   */
  async registerAgent(request: CreateAgentRequest): Promise<Agent> {
    try {
      // Check if agent already exists
      if (this.agents.has(request.agentId)) {
        throw new Error(`Agent ${request.agentId} already exists`);
      }

      // Create wallet for agent
      const wallet = await walletService.createWallet(request.agentId, request.publicKey);

      // Create agent record
      const agent: Agent = {
        id: request.agentId,
        publicKey: wallet.publicKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      this.agents.set(agent.id, agent);
      logger.info(`Registered agent ${agent.id} with wallet ${wallet.publicKey}`);

      return agent;
    } catch (error) {
      logger.error(`Error registering agent ${request.agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get agent balance
   */
  async getAgentBalance(agentId: string): Promise<AgentBalance> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const balance = await walletService.getBalance(agentId);
    const solBalance = walletService.lamportsToSol(balance);

    return {
      agentId,
      balance,
      solBalance,
    };
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Deactivate an agent
   */
  async deactivateAgent(agentId: string): Promise<void> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.isActive = false;
    agent.updatedAt = new Date();
    this.agents.set(agentId, agent);
    logger.info(`Deactivated agent ${agentId}`);
  }
}

export const agentService = new AgentService();

