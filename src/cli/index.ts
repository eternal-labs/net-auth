#!/usr/bin/env node

import { Command } from 'commander';
import { agentCommands } from './commands/agent';
import { paymentCommands } from './commands/payment';
import { walletCommands } from './commands/wallet';

const program = new Command();

program
  .name('netauth')
  .description('NetAuth CLI - Autonomous privacy layer for agent payments using x402 and Solana')
  .version('1.0.1');

// Add command groups
program.addCommand(agentCommands);
program.addCommand(paymentCommands);
program.addCommand(walletCommands);

// Parse arguments
program.parse(process.argv);

