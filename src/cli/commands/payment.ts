import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { privacyService } from '../../services/privacy.service';
import { walletService } from '../../services/wallet.service';
import { PaymentStatus } from '../../models/Payment';

export const paymentCommands = new Command('payment')
  .description('Payment commands')
  .alias('pay')
  .alias('p');

paymentCommands
  .command('send')
  .description('Send a payment between agents')
  .argument('<fromAgentId>', 'Sender agent ID')
  .argument('<toAgentId>', 'Recipient agent ID')
  .argument('<amount>', 'Amount in lamports (or use --sol flag)')
  .option('-s, --sol', 'Amount is in SOL instead of lamports')
  .option('-m, --memo <memo>', 'Payment memo/note')
  .action(async (fromAgentId: string, toAgentId: string, amount: string, options: { sol?: boolean; memo?: string }) => {
    const spinner = ora('Processing payment...').start();

    try {
      let amountInLamports: number;
      
      if (options.sol) {
        amountInLamports = walletService.solToLamports(parseFloat(amount));
      } else {
        amountInLamports = parseInt(amount, 10);
      }

      if (isNaN(amountInLamports) || amountInLamports <= 0) {
        spinner.fail('Invalid amount');
        console.error(chalk.red('\n✗ Amount must be a positive number'));
        process.exit(1);
      }

      if (fromAgentId === toAgentId) {
        spinner.fail('Invalid payment');
        console.error(chalk.red('\n✗ Cannot send payment to self'));
        process.exit(1);
      }

      // Create payment
      const payment = await privacyService.createPrivatePayment(
        fromAgentId,
        toAgentId,
        amountInLamports,
        options.memo
      );

      spinner.text = 'Processing transaction on Solana...';
      
      // Process payment
      const completedPayment = await privacyService.processPayment(payment.id);

      if (completedPayment.status === PaymentStatus.COMPLETED) {
        spinner.succeed('Payment completed successfully!');
        console.log(chalk.green('\n✓ Payment Details:'));
        console.log(chalk.cyan(`  Payment ID: ${completedPayment.id}`));
        console.log(chalk.cyan(`  From: ${completedPayment.fromAgentId}`));
        console.log(chalk.cyan(`  To: ${completedPayment.toAgentId}`));
        console.log(chalk.cyan(`  Amount: ${completedPayment.amount.toLocaleString()} lamports (${walletService.lamportsToSol(completedPayment.amount).toFixed(9)} SOL)`));
        if (completedPayment.transactionSignature) {
          console.log(chalk.cyan(`  Transaction: ${completedPayment.transactionSignature}`));
        }
        if (completedPayment.memo) {
          console.log(chalk.cyan(`  Memo: ${completedPayment.memo}`));
        }
      } else {
        spinner.fail('Payment failed');
        console.error(chalk.red(`\n✗ Payment status: ${completedPayment.status}`));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Payment failed');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

paymentCommands
  .command('status')
  .description('Get payment status')
  .argument('<paymentId>', 'Payment ID')
  .option('-a, --agent <agentId>', 'Agent ID for privacy check')
  .action(async (paymentId: string, options: { agent?: string }) => {
    const spinner = ora('Fetching payment status...').start();

    try {
      const payment = await privacyService.getPayment(paymentId, options.agent);

      if (!payment) {
        spinner.fail('Payment not found');
        console.error(chalk.red(`\n✗ Payment '${paymentId}' not found or access denied`));
        process.exit(1);
      }

      spinner.succeed('Payment found');
      console.log(chalk.green('\n✓ Payment Details:'));
      console.log(chalk.cyan(`  Payment ID: ${payment.id}`));
      console.log(chalk.cyan(`  From: ${payment.fromAgentId}`));
      console.log(chalk.cyan(`  To: ${payment.toAgentId}`));
      console.log(chalk.cyan(`  Amount: ${payment.amount.toLocaleString()} lamports (${walletService.lamportsToSol(payment.amount).toFixed(9)} SOL)`));
      console.log(chalk.cyan(`  Status: ${getStatusColor(payment.status)(payment.status)}`));
      if (payment.transactionSignature) {
        console.log(chalk.cyan(`  Transaction: ${payment.transactionSignature}`));
      }
      if (payment.memo) {
        console.log(chalk.cyan(`  Memo: ${payment.memo}`));
      }
      console.log(chalk.cyan(`  Created: ${payment.createdAt.toISOString()}`));
      if (payment.completedAt) {
        console.log(chalk.cyan(`  Completed: ${payment.completedAt.toISOString()}`));
      }
    } catch (error) {
      spinner.fail('Failed to get payment status');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

paymentCommands
  .command('history')
  .description('Get payment history for an agent')
  .argument('<agentId>', 'Agent identifier')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .action(async (agentId: string, options: { limit?: string }) => {
    const spinner = ora('Fetching payment history...').start();

    try {
      const payments = await privacyService.getAgentPayments(agentId);
      const limit = parseInt(options.limit || '10', 10);
      const limitedPayments = payments.slice(0, limit);

      spinner.succeed(`Found ${payments.length} payment(s)`);

      if (limitedPayments.length === 0) {
        console.log(chalk.yellow('\nNo payments found'));
        return;
      }

      console.log(chalk.green(`\n✓ Payment History (showing ${limitedPayments.length} of ${payments.length}):`));
      limitedPayments.forEach((payment) => {
        const isOutgoing = payment.fromAgentId === agentId;
        const direction = isOutgoing ? chalk.red('→') : chalk.green('←');
        const otherAgent = isOutgoing ? payment.toAgentId : payment.fromAgentId;
        
        console.log(chalk.cyan(`  ${direction} ${otherAgent}`));
        console.log(chalk.gray(`    Amount: ${walletService.lamportsToSol(payment.amount).toFixed(9)} SOL`));
        console.log(chalk.gray(`    Status: ${getStatusColor(payment.status)(payment.status)}`));
        if (payment.transactionSignature) {
          console.log(chalk.gray(`    TX: ${payment.transactionSignature.substring(0, 16)}...`));
        }
        console.log(chalk.gray(`    Date: ${payment.createdAt.toISOString()}`));
        console.log('');
      });
    } catch (error) {
      spinner.fail('Failed to get payment history');
      console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

function getStatusColor(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return chalk.green;
    case PaymentStatus.FAILED:
      return chalk.red;
    case PaymentStatus.PROCESSING:
      return chalk.yellow;
    case PaymentStatus.PENDING:
      return chalk.blue;
    default:
      return chalk.white;
  }
}

