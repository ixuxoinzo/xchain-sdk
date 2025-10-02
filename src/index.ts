import { ethers, Wallet, JsonRpcProvider, Contract, BigNumberish, TransactionResponse as EthersTx } from 'ethers';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, VersionedTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint, createMintToInstruction, createInitializeMintInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, createSetAuthorityInstruction, AuthorityType, MINT_SIZE, getMinimumBalanceForRentExemptMint } from '@solana/spl-token';
import { bs58 } from 'bs58';

// ==================== CHAINS CONFIG ====================
export const CHAINS = {
  // EVM Chains
  ETHEREUM: { id: 1, name: 'Ethereum', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io', type: 'EVM' as const },
  OPTIMISM: { id: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io', type: 'EVM' as const },
  ARBITRUM: { id: 42161, name: 'Arbitrum One', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io', type: 'EVM' as const },
  BASE: { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org', type: 'EVM' as const },
  POLYGON: { id: 137, name: 'Polygon POS', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com', type: 'EVM' as const },
  POLYGON_ZKEVM: { id: 1101, name: 'Polygon zkEVM', rpc: 'https://zkevm-rpc.com', explorer: 'https://zkevm.polygonscan.com', type: 'EVM' as const },
  ZKSYNC: { id: 324, name: 'zkSync Era', rpc: 'https://mainnet.era.zksync.io', explorer: 'https://explorer.zksync.io', type: 'EVM' as const },
  LINEA: { id: 59144, name: 'Linea', rpc: 'https://rpc.linea.build', explorer: 'https://lineascan.build', type: 'EVM' as const },
  SCROLL: { id: 534352, name: 'Scroll', rpc: 'https://rpc.scroll.io', explorer: 'https://scrollscan.com', type: 'EVM' as const },
  MANTLE: { id: 5000, name: 'Mantle', rpc: 'https://rpc.mantle.xyz', explorer: 'https://mantlescan.info', type: 'EVM' as const },
  METIS: { id: 1088, name: 'Metis', rpc: 'https://andromeda.metis.io/?owner=1088', explorer: 'https://andromeda-explorer.metis.io', type: 'EVM' as const },
  BLAST: { id: 81457, name: 'Blast', rpc: 'https://rpc.blast.io', explorer: 'https://blastscan.io', type: 'EVM' as const },
  
  // Solana
  SOLANA: { id: 101, name: 'Solana', rpc: 'https://api.mainnet-beta.solana.com', explorer: 'https://explorer.solana.com', type: 'SOLANA' as const }
} as const;

export type Chain = keyof typeof CHAINS;

// ==================== TYPES ====================
export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  chain: Chain;
  explorerUrl: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  blockNumber?: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
}

export interface NFTInfo {
  contractAddress: string;
  tokenId: number;
  owner: string;
  tokenURI: string;
  name?: string;
  image?: string;
}

export interface ContractCall {
  contractAddress: string;
  functionName: string;
  args: any[];
  value?: string;
  abi: any[];
}

export interface EventFilter {
  address?: string;
  topics?: string[];
  fromBlock?: number;
  toBlock?: number | string;
}

export interface WalletInfo {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface SolanaAccountInfo {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  data: Uint8Array;
}

export interface SolanaTokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
}

// ==================== EVM SDK ====================
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const ERC721_ABI = [
  "function safeMint(address to, string memory uri) returns (uint256)",
  "function mint(address to) returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const ERC1155_ABI = [
  "function mint(address to, uint256 id, uint256 amount, bytes memory data)",
  "function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[] memory)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function uri(uint256 id) view returns (string)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

export class EVMSDK {
  public wallet: Wallet;
  public currentChain: Chain;
  private provider: JsonRpcProvider;

  constructor(privateKey: string, chain: Chain = 'ETHEREUM') {
    this.currentChain = chain;
    this.provider = new JsonRpcProvider(CHAINS[chain].rpc);
    this.wallet = new Wallet(privateKey, this.provider);
  }

  // ========== CHAIN MANAGEMENT ==========
  switchChain(chain: Chain): void {
    this.currentChain = chain;
    this.provider = new JsonRpcProvider(CHAINS[chain].rpc);
    this.wallet = this.wallet.connect(this.provider);
  }

  getCurrentChain(): Chain {
    return this.currentChain;
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  // ========== WALLET MANAGEMENT ==========
  static createRandom(): WalletInfo {
    const wallet = Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase
    };
  }

  static fromMnemonic(mnemonic: string, path: string = "m/44'/60'/0'/0/0"): WalletInfo {
    const wallet = Wallet.fromPhrase(mnemonic, path);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic
    };
  }

  getAddress(): string {
    return this.wallet.address;
  }

  async getTransactionCount(): Promise<number> {
    return await this.provider.getTransactionCount(this.wallet.address);
  }

  // ========== NATIVE TOKEN OPERATIONS ==========
  async transferNative(to: string, amount: string): Promise<TransactionResponse> {
    try {
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });

      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber
      };
    } catch (error) {
      throw new Error(`Native transfer failed: ${error}`);
    }
  }

  async getNativeBalance(address?: string): Promise<string> {
    const balance = await this.provider.getBalance(address || this.wallet.address);
    return ethers.formatEther(balance);
  }

  // ========== ERC20 TOKEN OPERATIONS ==========
  async transferToken(tokenAddress: string, to: string, amount: string): Promise<TransactionResponse> {
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      
      const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber
      };
    } catch (error) {
      throw new Error(`Token transfer failed: ${error}`);
    }
  }

  async getTokenBalance(tokenAddress: string, address?: string): Promise<string> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(address || this.wallet.address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    
    const [symbol, name, decimals, totalSupply, balance] = await Promise.all([
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.name().catch(() => 'Unknown Token'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => 0),
      contract.balanceOf(this.wallet.address).catch(() => 0)
    ]);

    return {
      address: tokenAddress,
      symbol,
      name,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      balance: ethers.formatUnits(balance, decimals)
    };
  }

  async approveToken(tokenAddress: string, spender: string, amount: string): Promise<TransactionResponse> {
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
      const decimals = await contract.decimals();
      const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals));
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to: spender,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`Token approval failed: ${error}`);
    }
  }

  async getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const allowance = await contract.allowance(owner, spender);
    const decimals = await contract.decimals();
    return ethers.formatUnits(allowance, decimals);
  }

  async transferFromToken(tokenAddress: string, from: string, to: string, amount: string): Promise<TransactionResponse> {
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
      const decimals = await contract.decimals();
      const tx = await contract.transferFrom(from, to, ethers.parseUnits(amount, decimals));
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`Transfer from failed: ${error}`);
    }
  }

  // ========== ERC721 NFT OPERATIONS ==========
  async mintNFT(contractAddress: string, to: string, tokenUri: string): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
      const tx = await contract.safeMint(to, tokenUri);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: '0',
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`NFT mint failed: ${error}`);
    }
  }

  async transferNFT(contractAddress: string, to: string, tokenId: number): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
      const tx = await contract.transferFrom(this.wallet.address, to, tokenId);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: '1', // 1 NFT
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`NFT transfer failed: ${error}`);
    }
  }

  async getNFTBalance(contractAddress: string, address?: string): Promise<number> {
    const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
    const balance = await contract.balanceOf(address || this.wallet.address);
    return Number(balance);
  }

  async getNFTOwner(contractAddress: string, tokenId: number): Promise<string> {
    const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
    return await contract.ownerOf(tokenId);
  }

  async getNFTUri(contractAddress: string, tokenId: number): Promise<string> {
    const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
    return await contract.tokenURI(tokenId);
  }

  async getNFTInfo(contractAddress: string, tokenId: number): Promise<NFTInfo> {
    const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
    
    const [owner, tokenURI, name, symbol] = await Promise.all([
      contract.ownerOf(tokenId),
      contract.tokenURI(tokenId),
      contract.name().catch(() => ''),
      contract.symbol().catch(() => '')
    ]);

    return {
      contractAddress,
      tokenId,
      owner,
      tokenURI,
      name,
      symbol
    };
  }

  async setNFTApproval(contractAddress: string, operator: string, approved: boolean = true): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
      const tx = await contract.setApprovalForAll(operator, approved);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to: operator,
        value: '0',
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`NFT approval failed: ${error}`);
    }
  }

  // ========== ERC1155 MULTI-TOKEN OPERATIONS ==========
  async mintERC1155(contractAddress: string, to: string, tokenId: number, amount: number, uri: string = ''): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
      const tx = await contract.mint(to, tokenId, amount, uri);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount.toString(),
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`ERC1155 mint failed: ${error}`);
    }
  }

  async mintBatchERC1155(contractAddress: string, to: string, tokenIds: number[], amounts: number[], data: string = '0x'): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
      const tx = await contract.mintBatch(to, tokenIds, amounts, data);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amounts.reduce((a, b) => a + b, 0).toString(),
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`ERC1155 batch mint failed: ${error}`);
    }
  }

  async getERC1155Balance(contractAddress: string, tokenId: number, address?: string): Promise<number> {
    const contract = new Contract(contractAddress, ERC1155_ABI, this.provider);
    const balance = await contract.balanceOf(address || this.wallet.address, tokenId);
    return Number(balance);
  }

  async getERC1155BalanceBatch(contractAddress: string, tokenIds: number[], addresses: string[]): Promise<number[]> {
    const contract = new Contract(contractAddress, ERC1155_ABI, this.provider);
    const balances = await contract.balanceOfBatch(addresses, tokenIds);
    return balances.map((b: BigNumberish) => Number(b));
  }

  async transferERC1155(contractAddress: string, to: string, tokenId: number, amount: number): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
      const tx = await contract.safeTransferFrom(this.wallet.address, to, tokenId, amount, '0x');
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount.toString(),
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`ERC1155 transfer failed: ${error}`);
    }
  }

  // ========== CONTRACT INTERACTION ==========
  async readContract(contractAddress: string, abi: any[], functionName: string, args: any[] = []): Promise<any> {
    const contract = new Contract(contractAddress, abi, this.provider);
    return await contract[functionName](...args);
  }

  async writeContract(contractAddress: string, abi: any[], functionName: string, args: any[] = [], value: string = '0'): Promise<TransactionResponse> {
    try {
      const contract = new Contract(contractAddress, abi, this.wallet);
      const tx = await contract[functionName](...args, {
        value: ethers.parseEther(value)
      });
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.wallet.address,
        to: contractAddress,
        value,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
        status: receipt?.status === 1 ? 'confirmed' : 'failed'
      };
    } catch (error) {
      throw new Error(`Contract write failed: ${error}`);
    }
  }

  async deployContract(abi: any[], bytecode: string, args: any[] = [], value: string = '0'): Promise<TransactionResponse> {
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
      const contract = await factory.deploy(...args, {
        value: ethers.parseEther(value)
      });
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      return {
        hash: contract.deploymentTransaction()?.hash || '',
        from: this.wallet.address,
        to: address,
        value,
        chain: this.currentChain,
        explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${contract.deploymentTransaction()?.hash}`,
        status: 'confirmed'
      };
    } catch (error) {
      throw new Error(`Contract deployment failed: ${error}`);
    }
  }

  // ========== EVENT LISTENING ==========
  async getPastEvents(contractAddress: string, abi: any[], eventName: string, fromBlock: number = 0, toBlock: number | string = 'latest'): Promise<any[]> {
    const contract = new Contract(contractAddress, abi, this.provider);
    const filter = contract.filters[eventName]();
    const logs = await contract.queryFilter(filter, fromBlock, toBlock);
    return logs;
  }

  async listenEvents(contractAddress: string, abi: any[], eventName: string, callback: (event: any) => void): Promise<void> {
    const contract = new Contract(contractAddress, abi, this.provider);
    contract.on(eventName, callback);
  }

  async getLogs(filter: EventFilter): Promise<any[]> {
    return await this.provider.getLogs(filter);
  }

  // ========== GAS & FEE OPERATIONS ==========
  async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  }

  async estimateGas(to: string, value: string = '0', data: string = '0x'): Promise<string> {
    const gasEstimate = await this.provider.estimateGas({
      to,
      value: ethers.parseEther(value),
      data
    });
    return gasEstimate.toString();
  }

  async getFeeData(): Promise<any> {
    return await this.provider.getFeeData();
  }

  // ========== BLOCKCHAIN DATA ==========
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBlock(blockNumber: number | string): Promise<any> {
    return await this.provider.getBlock(blockNumber);
  }

  async getTransaction(txHash: string): Promise<any> {
    return await this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return await this.provider.getTransactionReceipt(txHash);
  }

  async getCode(address: string): Promise<string> {
    return await this.provider.getCode(address);
  }

  async getStorageAt(address: string, position: number): Promise<string> {
    return await this.provider.getStorage(address, position);
  }

  // ========== ENS & UTILITIES ==========
  async resolveENS(ensName: string): Promise<string> {
    return await this.provider.resolveName(ensName) || '';
  }

  async lookupAddress(address: string): Promise<string> {
    return await this.provider.lookupAddress(address) || '';
  }

  async getAvatar(ensName: string): Promise<string> {
    return await this.provider.getAvatar(ensName) || '';
  }

  // ========== BATCH OPERATIONS ==========
  async getMultipleBalances(addresses: string[]): Promise<{address: string; balance: string}[]> {
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: await this.getNativeBalance(address)
      }))
    );
    return balances;
  }

  async getMultipleTokenBalances(tokenAddress: string, addresses: string[]): Promise<{address: string; balance: string}[]> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const decimals = await contract.decimals();
    
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: ethers.formatUnits(await contract.balanceOf(address), decimals)
      }))
    );
    return balances;
  }
}

// ==================== SOLANA SDK ====================
export class SolanaSDK {
  private connection: Connection;
  private keypair: Keypair;

  constructor(privateKey: Uint8Array | string) {
    if (typeof privateKey === 'string') {
      this.keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    } else {
      this.keypair = Keypair.fromSecretKey(privateKey);
    }
    
    this.connection = new Connection(CHAINS.SOLANA.rpc, 'confirmed');
  }

  // ========== WALLET MANAGEMENT ==========
  static createRandom(): { address: string; privateKey: string } {
    const keypair = Keypair.generate();
    return {
      address: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey)
    };
  }

  getAddress(): string {
    return this.keypair.publicKey.toString();
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  // ========== NATIVE SOL OPERATIONS ==========
  async transferSOL(to: string, amount: number): Promise<{ signature: string; from: string; to: string; amount: number; lamports: number }> {
    try {
      const toPubkey = new PublicKey(to);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.keypair.publicKey,
          toPubkey: toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair]
      );

      return {
        signature,
        from: this.keypair.publicKey.toString(),
        to,
        amount,
        lamports: amount * LAMPORTS_PER_SOL
      };
    } catch (error) {
      throw new Error(`SOL transfer failed: ${error}`);
    }
  }

  async getSOLBalance(address?: string): Promise<number> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const balance = await this.connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  }

  async airdrop(amount: number = 1): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  // ========== SPL TOKEN OPERATIONS ==========
  async transferSPLToken(mint: string, to: string, amount: number): Promise<{ signature: string; from: string; to: string; mint: string; amount: number }> {
    try {
      const mintPubkey = new PublicKey(mint);
      const toPubkey = new PublicKey(to);
      
      const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      const transaction = new Transaction();

      // Create token account if doesn't exist
      try {
        await getAccount(this.connection, toTokenAccount);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            this.keypair.publicKey,
            toTokenAccount,
            toPubkey,
            mintPubkey
          )
        );
      }

      // Get token decimals
      const mintInfo = await getMint(this.connection, mintPubkey);
      const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          this.keypair.publicKey,
          adjustedAmount
        )
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair]
      );

      return {
        signature,
        from: this.keypair.publicKey.toString(),
        to,
        mint,
        amount
      };
    } catch (error) {
      throw new Error(`SPL token transfer failed: ${error}`);
    }
  }

  async getTokenBalance(mint: string, address?: string): Promise<number> {
    try {
      const mintPubkey = new PublicKey(mint);
      const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
      const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
      
      const accountInfo = await getAccount(this.connection, tokenAccount);
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
    } catch {
      return 0;
    }
  }

  async getTokenInfo(mint: string): Promise<TokenInfo> {
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await getMint(this.connection, mintPubkey);
    const balance = await this.getTokenBalance(mint);
    
    return {
      address: mint,
      symbol: 'UNKNOWN', // Would need metadata lookup
      name: 'Unknown Token',
      decimals: mintInfo.decimals,
      totalSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toString(),
      balance: balance.toString()
    };
  }

  async approveToken(mint: string, delegate: string, amount: number): Promise<string> {
    // Solana uses different approval mechanism
    // This is a simplified version
    const mintPubkey = new PublicKey(mint);
    const delegatePubkey = new PublicKey(delegate);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);

    // In Solana, you'd typically create a delegate instruction
    // This is a placeholder for the actual implementation
    const transaction = new Transaction();
    
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    return signature;
  }

  // ========== TOKEN MINTING ==========
  async createToken(decimals: number = 9, mintAuthority?: PublicKey, freezeAuthority?: PublicKey): Promise<string> {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.keypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        mintAuthority || this.keypair.publicKey,
        freezeAuthority || this.keypair.publicKey
      )
    );

    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair, mintKeypair]
    );

    return mintKeypair.publicKey.toString();
  }

  async mintTokens(mint: string, to: string, amount: number): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const toPubkey = new PublicKey(to);
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      mintPubkey,
      toPubkey
    );

    const mintInfo = await getMint(this.connection, mintPubkey);
    const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

    const signature = await sendAndConfirmTransaction(
      this.connection,
      new Transaction().add(
        createMintToInstruction(
          mintPubkey,
          tokenAccount.address,
          this.keypair.publicKey,
          adjustedAmount
        )
      ),
      [this.keypair]
    );

    return signature;
  }

  // ========== NFT OPERATIONS ==========
  async createNFT(metadataUri: string, name?: string, symbol?: string): Promise<{ mint: string; signature: string; metadataUri: string }> {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);

    // Create mint account
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.keypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        0, // NFTs have 0 decimals
        this.keypair.publicKey,
        this.keypair.publicKey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair, mintKeypair]
    );

    // Create associated token account and mint one token
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      mintKeypair.publicKey,
      this.keypair.publicKey
    );

    await sendAndConfirmTransaction(
      this.connection,
      new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          tokenAccount.address,
          this.keypair.publicKey,
          BigInt(1) // Mint exactly 1 token for NFT
        )
      ),
      [this.keypair]
    );

    // Disable future minting
    await sendAndConfirmTransaction(
      this.connection,
      new Transaction().add(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          this.keypair.publicKey,
          AuthorityType.MintTokens,
          null
        )
      ),
      [this.keypair]
    );

    return {
      mint: mintKeypair.publicKey.toString(),
      signature,
      metadataUri
    };
  }

  async transferNFT(mint: string, to: string): Promise<string> {
    return await this.transferSPLToken(mint, to, 1);
  }

  // ========== ACCOUNT MANAGEMENT ==========
  async getAccountInfo(address: string): Promise<SolanaAccountInfo> {
    const pubkey = new PublicKey(address);
    const accountInfo = await this.connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      throw new Error('Account not found');
    }

    return {
      address,
      lamports: accountInfo.lamports,
      owner: accountInfo.owner.toString(),
      executable: accountInfo.executable,
      data: accountInfo.data
    };
  }

  async getTokenAccounts(address?: string): Promise<SolanaTokenAccount[]> {
    const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const tokenAccounts = await this.connection.getTokenAccountsByOwner(
      ownerPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const accounts: SolanaTokenAccount[] = [];

    for (const account of tokenAccounts.value) {
      try {
        const accountInfo = await getAccount(this.connection, account.pubkey);
        const mintInfo = await getMint(this.connection, accountInfo.mint);
        
        accounts.push({
          address: account.pubkey.toString(),
          mint: accountInfo.mint.toString(),
          owner: accountInfo.owner.toString(),
          amount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
          decimals: mintInfo.decimals
        });
      } catch (error) {
        // Skip accounts that can't be parsed
        continue;
      }
    }

    return accounts;
  }

  // ========== BLOCKCHAIN DATA ==========
  async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    return blockhash;
  }

  async getSlot(): Promise<number> {
    return await this.connection.getSlot();
  }

  async getTransaction(signature: string): Promise<any> {
    return await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
  }

  async getSignatureStatus(signature: string): Promise<any> {
    return await this.connection.getSignatureStatus(signature);
  }

  // ========== PROGRAM INTERACTION ==========
  async callProgram(programId: string, data: Uint8Array, accounts: any[]): Promise<string> {
    const programPubkey = new PublicKey(programId);
    const transaction = new Transaction().add({
      programId: programPubkey,
      keys: accounts,
      data: Buffer.from(data)
    });

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    return signature;
  }

  // ========== BATCH OPERATIONS ==========
  async getMultipleBalances(addresses: string[]): Promise<{address: string; balance: number}[]> {
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: await this.getSOLBalance(address)
      }))
    );
    return balances;
  }

  async getMultipleTokenBalances(mint: string, addresses: string[]): Promise<{address: string; balance: number}[]> {
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: await this.getTokenBalance(mint, address)
      }))
    );
    return balances;
  }

  // ========== UTILITY FUNCTIONS ==========
  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getMinimumBalanceForRentExemption(size: number): Promise<number> {
    return await this.connection.getMinimumBalanceForRentExemption(size);
  }

  async getVersion(): Promise<any> {
    return await this.connection.getVersion();
  }

  async getGenesisHash(): Promise<string> {
    return await this.connection.getGenesisHash();
  }

  async getSupply(): Promise<any> {
    return await this.connection.getSupply();
  }

  // ========== TRANSACTION HISTORY ==========
  async getTransactionHistory(limit: number = 10, address?: string): Promise<any[]> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const signatures = await this.connection.getSignaturesForAddress(
      pubkey,
      { limit }
    );

    const transactions = await Promise.all(
      signatures.map(sig => 
        this.connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        })
      )
    );

    return transactions.filter(tx => tx !== null);
  }

  // ========== TOKEN METADATA ==========
  async getTokenMetadata(mint: string): Promise<any> {
    // This would typically interact with Metaplex Token Metadata program
    // Placeholder for actual implementation
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await getMint(this.connection, mintPubkey);
    
    return {
      mint: mint,
      decimals: mintInfo.decimals,
      supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
      mintAuthority: mintInfo.mintAuthority?.toString(),
      freezeAuthority: mintInfo.freezeAuthority?.toString()
    };
  }
}

// ==================== MASTER XCHAIN SDK ====================
export class XChainSDK {
  public evm: EVMSDK;
  public solana: SolanaSDK;

  constructor(evmPrivateKey: string, solanaPrivateKey: Uint8Array | string) {
    this.evm = new EVMSDK(evmPrivateKey);
    this.solana = new SolanaSDK(solanaPrivateKey);
  }

  // Utility method untuk switch chain EVM
  switchEVMChain(chain: Chain): void {
    this.evm.switchChain(chain);
  }

  // Get current status
  getStatus() {
    return {
      evm: {
        chain: this.evm.currentChain,
        address: this.evm.getAddress(),
        rpc: CHAINS[this.evm.currentChain].rpc,
        explorer: CHAINS[this.evm.currentChain].explorer
      },
      solana: {
        address: this.solana.getAddress(),
        rpc: CHAINS.SOLANA.rpc,
        explorer: CHAINS.SOLANA.explorer
      }
    };
  }

  // Batch operations across chains
  async getBalancesAllChains(address: string): Promise<{chain: Chain; balance: string}[]> {
    const results = [];
    
    // Get EVM balances
    for (const [chain, config] of Object.entries(CHAINS)) {
      if (config.type === 'EVM') {
        try {
          this.evm.switchChain(chain as Chain);
          const balance = await this.evm.getNativeBalance(address);
          results.push({ chain: chain as Chain, balance });
        } catch (error) {
          results.push({ chain: chain as Chain, balance: '0' });
        }
      }
    }
    
    // Get Solana balance
    try {
      const solBalance = await this.solana.getSOLBalance(address);
      results.push({ chain: 'SOLANA', balance: solBalance.toString() });
    } catch (error) {
      results.push({ chain: 'SOLANA', balance: '0' });
    }
    
    return results;
  }
}

// ==================== FRONTEND SDK ====================
export class FrontendSDK {
  private evmProvider: any = null;
  private solanaProvider: any = null;

  async connectEVM(): Promise<string> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.evmProvider = window.ethereum;
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    }
    throw new Error('No EVM wallet found');
  }

  async connectSolana(): Promise<string> {
    if (typeof window !== 'undefined' && window.solana) {
      this.solanaProvider = window.solana;
      const response = await window.solana.connect();
      return response.publicKey.toString();
    }
    throw new Error('No Solana wallet found');
  }

  async signMessage(message: string): Promise<string> {
    if (this.evmProvider) {
      return await this.evmProvider.request({
        method: 'personal_sign',
        params: [message, await this.getEVMAddress()]
      });
    }
    throw new Error('No wallet connected');
  }

  async getEVMAddress(): Promise<string> {
    if (this.evmProvider) {
      const accounts = await this.evmProvider.request({ method: 'eth_accounts' });
      return accounts[0];
    }
    throw new Error('No EVM wallet connected');
  }

  async getSolanaAddress(): Promise<string> {
    if (this.solanaProvider) {
      return this.solanaProvider.publicKey.toString();
    }
    throw new Error('No Solana wallet connected');
  }
}

// ==================== EXPORTS ====================
export default XChainSDK;
export { CHAINS };
export type { Chain, TransactionResponse, TokenInfo, NFTInfo, ContractCall, WalletInfo, SolanaAccountInfo, SolanaTokenAccount };