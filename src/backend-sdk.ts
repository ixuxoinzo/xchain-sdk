import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { CHAINS, Chain } from './chains.js';
import { 
  TransactionResponse, 
  TokenInfo, 
  BalanceResult,
  BackendConfig,
  APIResponse 
} from './types.js';

export class BackendSDK {
  private evmSDK: EVMSDK | null = null;
  private solanaSDK: SolanaSDK | null = null;
  private config: BackendConfig;

  constructor(config: BackendConfig = {}) {
    this.config = config;
    this.initializeWallets();
  }

  private initializeWallets(): void {
    // Initialize EVM SDK if private key is provided
    if (this.config.evmPrivateKey) {
      this.evmSDK = new EVMSDK(
        this.config.evmPrivateKey, 
        (this.config as any).defaultChain || 'ETHEREUM',
        this.config.rpcUrls?.ETHEREUM
      );
    }

    // Initialize Solana SDK if private key is provided
    if (this.config.solanaPrivateKey) {
      this.solanaSDK = new SolanaSDK(this.config.solanaPrivateKey);
    }
  }

  // ========== EVM OPERATIONS ==========

  async transferNativeEVM(to: string, amount: string, chain: Chain = 'ETHEREUM'): Promise<TransactionResponse> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured. Please provide EVM private key.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.transferNative(to, amount);
  }

  async transferTokenEVM(tokenAddress: string, to: string, amount: string, chain: Chain = 'ETHEREUM'): Promise<TransactionResponse> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.transferToken(tokenAddress, to, amount);
  }

  async getNativeBalanceEVM(address: string, chain: Chain = 'ETHEREUM'): Promise<string> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.getNativeBalance(address);
  }

  async getTokenBalanceEVM(tokenAddress: string, address: string, chain: Chain = 'ETHEREUM'): Promise<string> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.getTokenBalance(tokenAddress, address);
  }

  async getTokenInfoEVM(tokenAddress: string, chain: Chain = 'ETHEREUM'): Promise<TokenInfo> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.getTokenInfo(tokenAddress);
  }

  // ========== SOLANA OPERATIONS ==========

  async transferSOL(to: string, amount: number): Promise<any> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured. Please provide Solana private key.');
    }

    return await this.solanaSDK.transferSOL(to, amount);
  }

  async transferSPLToken(mint: string, to: string, amount: number): Promise<any> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.transferSPLToken(mint, to, amount);
  }

  async getSOLBalance(address?: string): Promise<number> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.getBalance(address);
  }

  async getTokenBalanceSolana(mint: string, address?: string): Promise<number> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.getTokenBalance(mint, address);
  }

  // ========== BATCH OPERATIONS ==========

   // ========== BATCH OPERATIONS ==========
  async getBalancesAllChains(address: string): Promise<BalanceResult[]> {
    const results: BalanceResult[] = [];
    // Get EVM balances
    if (this.evmSDK) {
      for (const [chain, config] of Object.entries(CHAINS)) {
        if (config.type === 'EVM') {
          try {
            this.evmSDK.switchChain(chain as Chain);
            const balance = await this.evmSDK.getNativeBalance(address);
            results.push({
              address,
              balance,
              chain: chain as Chain,
              symbol: config.nativeCurrency.symbol
            });
          } catch (error) {
            // Skip chains that fail
            console.warn(`Failed to get balance for ${chain}:`, error);
          }
        }
      }
    }
   
    if (this.solanaSDK) {
      const solanaAddress = this.solanaSDK.getAddress();
      if (solanaAddress) {
        try {
 
          const balance = await this.solanaSDK.getBalance(); 
          results.push({
            address: solanaAddress,
            balance: balance.toString(),
            chain: 'SOLANA',
            symbol: 'SOL'
          });
        } catch (error) {
          console.warn('Failed to get Solana balance:', error);
        }
      }
    }
    return results;
  }


  // ========== ADMIN OPERATIONS ==========

  async createEVMWallet(): Promise<{ address: string; privateKey: string }> {
    const walletInfo = EVMSDK.createRandom();
    return {
      address: walletInfo.address,
      privateKey: walletInfo.privateKey
    };
  }

  async createSolanaWallet(): Promise<{ address: string; privateKey: string }> {
    const walletInfo = SolanaSDK.createRandom();
    return {
      address: walletInfo.address,
      privateKey: walletInfo.privateKey
    };
  }

  // ========== HEALTH CHECKS ==========

  async healthCheck(): Promise<{ evm: boolean; solana: boolean; details: any }> {
    const details: any = {};

    // Check EVM health
    let evmHealthy = false;
    if (this.evmSDK) {
      try {
        const health = await this.evmSDK.healthCheck();
        evmHealthy = health.healthy;
        details.evm = health;
      } catch (error) {
        details.evm = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // Check Solana health
    let solanaHealthy = false;
    if (this.solanaSDK) {
      try {
        const health = await this.solanaSDK.healthCheck();
        solanaHealthy = health.healthy;
        details.solana = health;
      } catch (error) {
        details.solana = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return {
      evm: evmHealthy,
      solana: solanaHealthy,
      details
    };
  }

  // ========== CONFIGURATION ==========

  updateConfig(newConfig: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeWallets(); // Reinitialize with new config
  }

  getConfig(): BackendConfig {
    return { ...this.config };
  }

  // ========== SECURITY ==========

  async signMessageEVM(message: string): Promise<string> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    return await this.evmSDK.signMessage(message);
  }

  async verifySignatureEVM(message: string, signature: string): Promise<string> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    return await this.evmSDK.verifySignature(message, signature);
  }

  // ========== UTILITY METHODS ==========

  getEVMAddress(): string | null {
    return this.evmSDK ? this.evmSDK.getAddress() : null;
  }

  getSolanaAddress(): string | null {
    return this.solanaSDK ? this.solanaSDK.getAddress() : null;
  }

  isEVMConfigured(): boolean {
    return this.evmSDK !== null;
  }

  isSolanaConfigured(): boolean {
    return this.solanaSDK !== null;
  }

  // ========== FEE ESTIMATION ==========

  async estimateTransferFeeEVM(to: string, amount: string, chain: Chain = 'ETHEREUM'): Promise<{
    gasLimit: string;
    gasCost: string;
    totalCost: string;
  }> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.estimateTransactionCost(to, amount);
  }

  // ========== TRANSACTION HISTORY ==========

  async getTransactionEVM(txHash: string, chain: Chain = 'ETHEREUM'): Promise<any> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.getTransaction(txHash);
  }

  async getTransactionSolana(signature: string): Promise<any> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.getTransaction(signature);
  }

  // ========== CONTRACT DEPLOYMENT ==========

  async deployContractEVM(abi: any[], bytecode: string, args: any[] = [], value: string = '0', chain: Chain = 'ETHEREUM'): Promise<TransactionResponse> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.deployContract(abi, bytecode, args, value);
  }

  // ========== TOKEN MANAGEMENT ==========

  async createTokenSolana(decimals: number = 9): Promise<string> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.createToken(decimals);
  }

  async mintTokensSolana(mint: string, to: string, amount: number): Promise<string> {
    if (!this.solanaSDK) {
      throw new Error('Solana wallet not configured.');
    }

    return await this.solanaSDK.mintTokens(mint, to, amount);
  }

  // ========== BULK OPERATIONS ==========

  async bulkTransferEVM(transfers: Array<{ to: string; amount: string }>, chain: Chain = 'ETHEREUM'): Promise<TransactionResponse[]> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.batchTransferNative(transfers);
  }

  // ========== EVENT LISTENING ==========

  async getPastEventsEVM(contractAddress: string, abi: any[], eventName: string, fromBlock: number = 0, chain: Chain = 'ETHEREUM'): Promise<any[]> {
    if (!this.evmSDK) {
      throw new Error('EVM wallet not configured.');
    }

    this.evmSDK.switchChain(chain);
    return await this.evmSDK.getPastEvents(contractAddress, abi, eventName, fromBlock);
  }

  // ========== ERROR HANDLING ==========

  static handleError(error: any): APIResponse {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: Date.now()
    };
  }

  static handleSuccess<T>(data: T): APIResponse<T> {
    return {
      success: true,
      data,
      timestamp: Date.now()
    };
  }
}
