import { ethers, BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { CHAINS, Chain } from './chains.js';
import { TransactionResponse, WalletConnection, TokenInfo, NFTInfo, FrontendConfig } from './types.js';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: any;
    backpack?: any;
  }
}

export class FrontendSDK {
  private evmProvider: BrowserProvider | null = null;
  private evmSigner: JsonRpcSigner | null = null;
  private solanaProvider: any = null;
  private currentChain: Chain;
  private supportedChains: Chain[];
  private isConnected: boolean = false;
  constructor(config: FrontendConfig = {}) {
    this.currentChain = config.defaultChain || 'ETHEREUM';
    this.supportedChains = config.supportedChains || Object.keys(CHAINS) as Chain[];
    if (config.autoConnect) {
      this.autoConnect();
    }
  }
  // ========== EVM WALLET CONNECTION ==========
  async connectEVM(): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
    }
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      this.evmProvider = new BrowserProvider(window.ethereum);
      this.evmSigner = await this.evmProvider.getSigner();
      // Get current chain
      const network = await this.evmProvider.getNetwork();
      this.currentChain = this.getChainFromId(Number(network.chainId));
      this.isConnected = true;
      return {
        address: accounts[0],
        chain: this.currentChain,
        connected: true
      };
    } catch (error: any) {
      throw new Error(`EVM connection failed: ${error.message}`);
    }
  }
  async disconnectEVM(): Promise<void> {
    if (window.ethereum && window.ethereum.close) {
      await window.ethereum.close();
    }
    this.evmProvider = null;
    this.evmSigner = null;
    this.isConnected = false;
  }
  // ========== SOLANA WALLET CONNECTION ==========
  async connectSolana(): Promise<WalletConnection> {
    if (!window.solana && !window.phantom && !window.backpack) {
      throw new Error('No Solana wallet found. Please install Phantom, Backpack, or another Solana wallet.');
    }
    try {
      const provider = window.solana || window.phantom || window.backpack;
      if (!provider.isConnected) {
        await provider.connect();
      }
      this.solanaProvider = provider;
      this.currentChain = 'SOLANA';
      this.isConnected = true;
      return {
        address: provider.publicKey.toString(),
        chain: 'SOLANA',
        connected: true
      };
    } catch (error: any) {
      throw new Error(`Solana connection failed: ${error.message}`);
    }
  }
  async disconnectSolana(): Promise<void> {
    if (this.solanaProvider) {
      await this.solanaProvider.disconnect();
      this.solanaProvider = null;
      this.isConnected = false;
    }
  }
  // ========== EVM TRANSACTIONS ==========
  async transferNativeEVM(to: string, amount: string): Promise<TransactionResponse> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected. Please connect your wallet first.');
    }
    try {
      const tx = await this.evmSigner.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
      const receipt = await tx.wait();
      return {
        hash: tx.hash,
        from: await this.evmSigner.getAddress(),
        to,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Native transfer failed: ${error.message}`);
    }
  }
  async transferTokenEVM(tokenAddress: string, to: string, amount: string): Promise<TransactionResponse> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    const erc20Abi = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
    try {
      const contract = new Contract(tokenAddress, erc20Abi, this.evmSigner);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
      const receipt = await tx.wait();
      return {
        hash: tx.hash,
        from: await this.evmSigner.getAddress(),
        to,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error: any) {
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }
  async approveTokenEVM(tokenAddress: string, spender: string, amount: string): Promise<TransactionResponse> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    const erc20Abi = [
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)"
    ];
    try {
      const contract = new Contract(tokenAddress, erc20Abi, this.evmSigner);
      const decimals = await contract.decimals();
      const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals));
      const receipt = await tx.wait();
      return {
        hash: tx.hash,
        from: await this.evmSigner.getAddress(),
        to: spender,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error: any) {
      throw new Error(`Token approval failed: ${error.message}`);
    }
  }
  // ========== READ-ONLY EVM OPERATIONS ==========
  async getNativeBalanceEVM(address?: string): Promise<string> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const balance = await this.evmProvider.getBalance(address || await this.getEVMAddress());
    return ethers.formatEther(balance);
  }
  async getTokenBalanceEVM(tokenAddress: string, address?: string): Promise<string> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const erc20Abi = [
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    const contract = new Contract(tokenAddress, erc20Abi, this.evmProvider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address || await this.getEVMAddress()),
      contract.decimals()
    ]);
    return ethers.formatUnits(balance, decimals);
  }
  async getTokenInfoEVM(tokenAddress: string): Promise<TokenInfo> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const erc20Abi = [
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ];
    const contract = new Contract(tokenAddress, erc20Abi, this.evmProvider);
    const [symbol, name, decimals, totalSupply] = await Promise.all([
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.name().catch(() => 'Unknown Token'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => 0)
    ]);
    const balance = await this.getTokenBalanceEVM(tokenAddress);
    return {
      address: tokenAddress,
      symbol,
      name,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      balance
    };
  }
  // ========== NETWORK MANAGEMENT ==========
  async switchEVMChain(chain: Chain): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found.');
    }
    const chainId = CHAINS[chain].id;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      this.currentChain = chain;
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addEVMChain(chain);
        this.currentChain = chain;
      } else {
        throw error;
      }
    }
  }
  private async addEVMChain(chain: Chain): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found.');
    }
    const chainConfig = CHAINS[chain];
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainConfig.id.toString(16)}`,
        chainName: chainConfig.name,
        rpcUrls: [chainConfig.rpc],
        nativeCurrency: chainConfig.nativeCurrency,
        blockExplorerUrls: [chainConfig.explorer]
      }],
    });
  }
  // ========== SIGNING & MESSAGES ==========
  async signMessageEVM(message: string): Promise<string> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    return await this.evmSigner.signMessage(message);
  }
  async signMessageSolana(message: string): Promise<string> {
    if (!this.solanaProvider) {
      throw new Error('Solana wallet not connected.');
    }
    const encodedMessage = new TextEncoder().encode(message);
    const { signature } = await this.solanaProvider.signMessage(encodedMessage, 'utf8');
    return Buffer.from(signature).toString('hex');
  }
  async signTypedDataEVM(domain: any, types: any, value: any): Promise<string> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    return await this.evmSigner.signTypedData(domain, types, value);
  }
  // ========== WALLET INFO ==========
  async getEVMAddress(): Promise<string> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    return await this.evmSigner.getAddress();
  }
  async getSolanaAddress(): Promise<string> {
    if (!this.solanaProvider) {
      throw new Error('Solana wallet not connected.');
    }
    return this.solanaProvider.publicKey.toString();
  }
  getCurrentChain(): Chain {
    return this.currentChain;
  }
  isWalletConnected(): boolean {
    return this.isConnected;
  }
  getSupportedChains(): Chain[] {
    return this.supportedChains;
  }
  // ========== EVENT LISTENERS ==========
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
  onSolanaAccountChanged(callback: (publicKey: any) => void): void {
    if (this.solanaProvider) {
      this.solanaProvider.on('accountChanged', callback);
    }
  }
  onSolanaDisconnect(callback: () => void): void {
    if (this.solanaProvider) {
      this.solanaProvider.on('disconnect', callback);
    }
  }
  // ========== UTILITY FUNCTIONS ==========
  private getChainFromId(chainId: number): Chain {
    for (const [chain, config] of Object.entries(CHAINS)) {
      if (config.type === 'EVM' && config.id === chainId) {
        return chain as Chain;
      }
    }
    return 'ETHEREUM';
  }
  async getNetworkInfo(): Promise<any> {
    if (this.evmProvider) {
      return await this.evmProvider.getNetwork();
    }
    return null;
  }
  async getTransactionCountEVM(): Promise<number> {
    if (!this.evmProvider || !this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    return await this.evmProvider.getTransactionCount(await this.getEVMAddress());
  }
  // ========== CONTRACT INTERACTION ==========
  async readContractEVM(contractAddress: string, abi: any[], functionName: string, args: any[]
= []): Promise<any> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const contract = new Contract(contractAddress, abi, this.evmProvider);
    return await contract[functionName](...args);
  }
  async writeContractEVM(contractAddress: string, abi: any[], functionName: string, args: any[] = [], value: string = '0'): Promise<TransactionResponse> {
    if (!this.evmSigner) {
      throw new Error('EVM wallet not connected.');
    }
    try {
      const contract = new Contract(contractAddress, abi, this.evmSigner);
      const tx = await contract[functionName](...args, {
        value: ethers.parseEther(value)
      });
      const receipt = await tx.wait();
      return {
        hash: tx.hash,
        from: await this.evmSigner.getAddress(),
        to: contractAddress,
        value,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error: any) {
      throw new Error(`Contract write failed: ${error.message}`);
    }
  }
  // ========== GAS ESTIMATION ==========
  async estimateGasEVM(to: string, value: string = '0', data: string = '0x'): Promise<string> {    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const gasEstimate = await this.evmProvider.estimateGas({
      to,
      value: ethers.parseEther(value),
      data
    });
    return gasEstimate.toString();
  }
  async getGasPriceEVM(): Promise<string> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const feeData = await this.evmProvider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  }
  // ========== AUTO CONNECTION ==========
  private async autoConnect(): Promise<void> {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          this.evmProvider = new BrowserProvider(window.ethereum);
          this.evmSigner = await this.evmProvider.getSigner();
          this.isConnected = true;
          const network = await this.evmProvider.getNetwork();
          this.currentChain = this.getChainFromId(Number(network.chainId));
        }
      } catch (error) {
        console.warn('Auto-connect to EVM wallet failed:', error);
      }
    }
    if (window.solana || window.phantom || window.backpack) {
      const provider = window.solana || window.phantom || window.backpack;
      try {
        if (provider.isConnected) {
          this.solanaProvider = provider;
          this.currentChain = 'SOLANA';
          this.isConnected = true;
        }
      } catch (error) {
        console.warn('Auto-connect to Solana wallet failed:', error);
      }
    }
  }
  // ========== BATCH OPERATIONS ==========
  async getMultipleBalancesEVM(addresses: string[]): Promise<{address: string; balance: string}[]> {
    if (!this.evmProvider) {
      throw new Error('EVM provider not available.');
    }
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: await this.getNativeBalanceEVM(address)
      }))
    );
    return balances;
  }
  // ========== DISCONNECT ALL ==========
  async disconnectAll(): Promise<void> {
    await this.disconnectEVM();
    await this.disconnectSolana();
    this.isConnected = false;
  }
  // ========== WALLET DETECTION ==========
  static detectEVMWallets(): string[] {
    const wallets: string[] = [];
    if (window.ethereum) {
      wallets.push('MetaMask');
      if (window.ethereum.isCoinbaseWallet) wallets.push('Coinbase Wallet');
      if (window.ethereum.isBraveWallet) wallets.push('Brave Wallet');
      if (window.ethereum.isTrust) wallets.push('Trust Wallet');
      if (window.ethereum.isRabby) wallets.push('Rabby');
    }
    return wallets;
  }
  static detectSolanaWallets(): string[] {
    const wallets: string[] = [];
    if (window.solana) wallets.push('Phantom');
    if (window.phantom) wallets.push('Phantom');
    if (window.backpack) wallets.push('Backpack');
    return wallets;
  }
}
