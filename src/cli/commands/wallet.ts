import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { walletService } from '../../services/wallet.service';

export const walletCommands = new Command('wallet')
  .description('Wallet management commands')
  .alias('w');

walletCommands
  .command('info')
  .description('Get wallet information')
  .argument('<agentId>', 'Agent identifier')
  .action(async (agentId: string) => {
    const spinner = ora('Fetching wallet info...').start();

    try {
      const wallet = await walletService.getWallet(agentId);

      if (!wallet) {
        spinner.fail('Wallet not found');
        console.error(chalk.red(`\n✗ Wallet for agent '${agentId}' does not exist`));
        process.exit(1);
      }

      const balance = await walletService.getBalance(agentId);

      spinner.succeed('Wallet found');
      console.log(chalk.green('\n✓ Wallet Details:'));
      console.log(chalk.cyan(`  Agent ID: ${wallet.agentId}`));
      console.log(chalk.cyan(`  Public Key: ${wallet.publicKey}`));
      console.log(chalk.cyan(`  Balance: ${balance.toLocaleString()} lamports`));
      console.log(chalk.cyan(`  Balance: ${walletService.lamportsToSol(balance).toFixed(9)} SOL`));
      console.log(chalk.cyan(`  Last Synced: ${wallet.lastSyncedAt.toISOString()}`));
    } catch (error) {
      spinner.fail('Failed to get wallet info');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

walletCommands
  .command('convert')
  .description('Convert between SOL and lamports')
  .argument('<amount>', 'Amount to convert')
  .option('-t, --to <unit>', 'Convert to (sol or lamports)', 'sol')
  .action(async (amount: string, options: { to?: string }) => {
    try {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount)) {
        console.error(chalk.red('\n✗ Invalid amount'));
        process.exit(1);
      }

      if (options.to === 'lamports') {
        const lamports = walletService.solToLamports(numAmount);
        console.log(chalk.green(`\n✓ ${numAmount} SOL = ${lamports.toLocaleString()} lamports`));
      } else {
        const sol = walletService.lamportsToSol(numAmount);
        console.log(chalk.green(`\n✓ ${numAmount.toLocaleString()} lamports = ${sol.toFixed(9)} SOL`));
      }
    } catch (error) {
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

