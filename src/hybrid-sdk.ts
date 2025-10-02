import { FrontendSDK } from './frontend-sdk.js';
import { BackendSDK } from './backend-sdk.js';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { CHAINS, Chain } from './chains.js';
import { 
  TransactionResponse, 
  WalletConnection, 
  TokenInfo, 
  BalanceResult,
  BackendConfig,
  FrontendConfig 
} from './types.js';

export class HybridSDK {
  public frontend: FrontendSDK;
  public backend: BackendSDK | null = null;
  private useBackend: boolean = false;

  constructor(backendConfig?: BackendConfig, frontendConfig?: FrontendConfig) {
    this.frontend = new FrontendSDK(frontendConfig);
    
    if (backendConfig && (backendConfig.evmPrivateKey || backendConfig.solanaPrivateKey)) {
      this.backend = new BackendSDK(backendConfig);
      this.useBackend = true;
    }
  }

  // ========== WALLET CONNECTION ==========

  async connectEVM(): Promise<WalletConnection> {
    return await this.frontend.connectEVM();
  }

  async connectSolana(): Promise<WalletConnection> {
    return await this.frontend.connectSolana();
  }

  async disconnect(): Promise<void> {
    await this.frontend.disconnectAll();
  }

  // ========== TRANSFER OPERATIONS ==========

  async transferNative(to: string, amount: string, chain: Chain = 'ETHEREUM'): Promise<TransactionResponse> {
    if (this.useBackend && this.backend) {
      // Use backend for transfers (more secure)
      return await this.backend.transferNativeEVM(to, amount, chain);
    } else {
      // Use frontend (user signs transaction)
      return await this.frontend.transferNativeEVM(to, amount);
    }
  }

  async transferToken(tokenAddress: string, to: string, amount: string, chain: Chain = 'ETHEREUM'): Promise<TransactionResponse> {
    if (this.useBackend && this.backend) {
      return await this.backend.transferTokenEVM(tokenAddress, to, amount, chain);
    } else {
      return await this.frontend.transferTokenEVM(tokenAddress, to, amount);
    }
  }

  async transferSOL(to: string, amount: number): Promise<any> {
    if (this.useBackend && this.backend) {
      return await this.backend.transferSOL(to, amount);
    } else {
      throw new Error('Solana transfers require backend configuration for security.');
    }
  }

  // ========== BALANCE OPERATIONS ==========

  async getNativeBalance(address?: string, chain: Chain = 'ETHEREUM'): Promise<string> {
    if (this.useBackend && this.backend) {
      return await this.backend.getNativeBalanceEVM(address || this.getCurrentAddress(), chain);
    } else {
      return await this.frontend.getNativeBalanceEVM(address);
    }
  }

  async getTokenBalance(tokenAddress: string, address?: string, chain: Chain = 'ETHEREUM'): Promise<string> {
    if (this.useBackend && this.backend) {
      return await this.backend.getTokenBalanceEVM(tokenAddress, address || this.getCurrentAddress(), chain);
    } else {
      return await this.frontend.getTokenBalanceEVM(tokenAddress, address);
    }
  }

  async getSOLBalance(address?: string): Promise<number> {
    if (this.useBackend && this.backend) {
      return await this.backend.getSOLBalance(address);
    } else {
      throw new Error('Solana balance checks require backend configuration.');
    }
  }

  // ========== BATCH OPERATIONS ==========

  async getBalancesAllChains(address: string): Promise<BalanceResult[]> {
    if (this.useBackend && this.backend) {
      return await this.backend.getBalancesAllChains(address);
    } else {
      // Fallback to frontend-only implementation
      const results: BalanceResult[] = [];
      
      // This would need to be implemented for frontend
      // For now, return empty array
      return results;
    }
  }

  // ========== WALLET INFO ==========

  async getCurrentAddress(): Promise<string> {
    if (this.useBackend && this.backend?.getEVMAddress()) {
      return this.backend.getEVMAddress()!;
    } else {
      return await this.frontend.getEVMAddress();
    }
  }

  getCurrentChain(): Chain {
    return this.frontend.getCurrentChain();
  }

  isConnected(): boolean {
    return this.frontend.isWalletConnected();
  }

  // ========== CONFIGURATION ==========

  enableBackend(backendConfig: BackendConfig): void {
    this.backend = new BackendSDK(backendConfig);
    this.useBackend = true;
  }

  disableBackend(): void {
    this.backend = null;
    this.useBackend = false;
  }

  isBackendEnabled(): boolean {
    return this.useBackend;
  }

  // ========== HEALTH CHECKS ==========

  async healthCheck(): Promise<{ frontend: boolean; backend: boolean; details: any }> {
    const details: any = {};
    let frontendHealthy = true;
    let backendHealthy = false;

    // Check frontend health
    try {
      details.frontend = {
        connected: this.frontend.isWalletConnected(),
        currentChain: this.frontend.getCurrentChain()
      };
    } catch (error) {
      frontendHealthy = false;
      details.frontend = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Check backend health
    if (this.useBackend && this.backend) {
      try {
        const backendHealth = await this.backend.healthCheck();
        backendHealthy = backendHealth.evm || backendHealth.solana;
        details.backend = backendHealth;
      } catch (error) {
        details.backend = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return {
      frontend: frontendHealthy,
      backend: backendHealthy,
      details
    };
  }

  // ========== UTILITY METHODS ==========

  static createEVMSDK(privateKey: string, chain: Chain = 'ETHEREUM'): EVMSDK {
    return new EVMSDK(privateKey, chain);
  }

  static createSolanaSDK(privateKey: string): SolanaSDK {
    return new SolanaSDK(privateKey);
  }

  getSupportedChains(): Chain[] {
    return this.frontend.getSupportedChains();
  }

  // ========== ERROR HANDLING ==========

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || error?.message?.includes('network');
  }

  static isUserRejected(error: any): boolean {
    return error?.code === 4001 || error?.message?.includes('rejected');
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    return error?.message || 'Unknown error occurred';
  }
}

// Default export for convenience
export default HybridSDK;