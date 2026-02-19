import { WalletService } from '../src/services/wallet.service';

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService();
  });

  test('should create a wallet for an agent', async () => {
    const wallet = await walletService.createWallet('test-agent-1');
    expect(wallet).toBeDefined();
    expect(wallet.agentId).toBe('test-agent-1');
    expect(wallet.publicKey).toBeDefined();
    expect(wallet.encryptedPrivateKey).toBeDefined();
  });

  test('should get wallet balance', async () => {
    const wallet = await walletService.createWallet('test-agent-2');
    const balance = await walletService.getBalance('test-agent-2');
    expect(typeof balance).toBe('number');
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  test('should convert lamports to SOL', () => {
    const sol = walletService.lamportsToSol(1000000000); // 1 SOL
    expect(sol).toBe(1);
  });

  test('should convert SOL to lamports', () => {
    const lamports = walletService.solToLamports(1.5);
    expect(lamports).toBe(1500000000);
  });
});

