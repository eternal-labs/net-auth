#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('netauth')
  .description('NetAuth CLI - Autonomous privacy layer for agent payments using x402 and Solana')
  .version('1.0.1');

// Lazy load commands to avoid initializing services before help is shown
const loadCommands = () => {
  const { agentCommands } = require('./commands/agent');
  const { paymentCommands } = require('./commands/payment');
  const { walletCommands } = require('./commands/wallet');
  
  program.addCommand(agentCommands);
  program.addCommand(paymentCommands);
  program.addCommand(walletCommands);
};

// Check if this is a help command
const args = process.argv.slice(2);
const isHelpCommand = args.length === 0 || 
                       args[0] === '--help' || args[0] === '-h' ||
                       args.includes('--help') || args.includes('-h');

// Only load commands if not showing help
if (!isHelpCommand) {
  loadCommands();
} else {
  // Add placeholder commands for help display
  program
    .command('agent', 'Agent management commands')
    .command('payment', 'Payment commands')
    .command('wallet', 'Wallet management commands');
}

// Parse arguments
program.parse(process.argv);
