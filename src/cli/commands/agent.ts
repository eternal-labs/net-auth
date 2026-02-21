import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { agentService } from '../../services/agent.service';

export const agentCommands = new Command('agent')
  .description('Agent management commands')
  .alias('a');

agentCommands
  .command('register')
  .description('Register a new agent')
  .argument('<agentId>', 'Unique agent identifier')
  .option('-k, --key <publicKey>', 'Use existing Solana public key')
  .action(async (agentId: string, options: { key?: string }) => {
    const spinner = ora('Registering agent...').start();

    try {
      const agent = await agentService.registerAgent({
        agentId,
        publicKey: options.key,
      });

      spinner.succeed('Agent registered successfully!');
      console.log(chalk.green('\n✓ Agent Details:'));
      console.log(chalk.cyan(`  ID: ${agent.id}`));
      console.log(chalk.cyan(`  Public Key: ${agent.publicKey}`));
      console.log(chalk.cyan(`  Created: ${agent.createdAt.toISOString()}`));
    } catch (error) {
      spinner.fail('Failed to register agent');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

agentCommands
  .command('info')
  .description('Get agent information')
  .argument('<agentId>', 'Agent identifier')
  .action(async (agentId: string) => {
    const spinner = ora('Fetching agent info...').start();

    try {
      const agent = await agentService.getAgent(agentId);

      if (!agent) {
        spinner.fail('Agent not found');
        console.error(chalk.red(`\n✗ Agent '${agentId}' does not exist`));
        process.exit(1);
      }

      spinner.succeed('Agent found');
      console.log(chalk.green('\n✓ Agent Details:'));
      console.log(chalk.cyan(`  ID: ${agent.id}`));
      console.log(chalk.cyan(`  Public Key: ${agent.publicKey}`));
      console.log(chalk.cyan(`  Status: ${agent.isActive ? chalk.green('Active') : chalk.red('Inactive')}`));
      console.log(chalk.cyan(`  Created: ${agent.createdAt.toISOString()}`));
    } catch (error) {
      spinner.fail('Failed to get agent info');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

agentCommands
  .command('balance')
  .description('Get agent wallet balance')
  .argument('<agentId>', 'Agent identifier')
  .option('-s, --sol', 'Display balance in SOL instead of lamports')
  .action(async (agentId: string, options: { sol?: boolean }) => {
    const spinner = ora('Fetching balance...').start();

    try {
      const balance = await agentService.getAgentBalance(agentId);

      spinner.succeed('Balance retrieved');
      console.log(chalk.green('\n✓ Wallet Balance:'));
      
      if (options.sol) {
        console.log(chalk.cyan(`  ${balance.solBalance.toFixed(9)} SOL`));
        console.log(chalk.gray(`  (${balance.balance.toLocaleString()} lamports)`));
      } else {
        console.log(chalk.cyan(`  ${balance.balance.toLocaleString()} lamports`));
        console.log(chalk.gray(`  (${balance.solBalance.toFixed(9)} SOL)`));
      }
    } catch (error) {
      spinner.fail('Failed to get balance');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

agentCommands
  .command('list')
  .description('List all registered agents')
  .action(async () => {
    const spinner = ora('Fetching agents...').start();

    try {
      const agents = await agentService.listAgents();

      spinner.succeed(`Found ${agents.length} agent(s)`);
      
      if (agents.length === 0) {
        console.log(chalk.yellow('\nNo agents registered yet'));
        return;
      }

      console.log(chalk.green('\n✓ Registered Agents:'));
      agents.forEach((agent) => {
        console.log(chalk.cyan(`  ${agent.id}`));
        console.log(chalk.gray(`    Public Key: ${agent.publicKey}`));
        console.log(chalk.gray(`    Status: ${agent.isActive ? 'Active' : 'Inactive'}`));
        console.log('');
      });
    } catch (error) {
      spinner.fail('Failed to list agents');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

