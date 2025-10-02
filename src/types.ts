import { Chain } from './chains';

// ========== COMMON TYPES ==========
export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  chain: Chain;
  explorerUrl: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  timestamp?: number;
  nonce?: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
  priceUSD?: string;
  logoURI?: string;
}

export interface NFTInfo {
  contractAddress: string;
  tokenId: number;
  owner: string;
  tokenURI: string;
  name?: string;
  symbol?: string;
  image?: string;
  description?: string;
  attributes?: any[];
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
  publicKey?: string;
}

export interface BalanceResult {
  address: string;
  balance: string;
  chain: Chain;
  symbol: string;
}

export interface TokenBalance {
  address: string;
  balance: string;
  token: TokenInfo;
}

// ========== EVM SPECIFIC TYPES ==========
export interface EVMTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  data: string;
  chainId: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
}

export interface EVMEventLog {
  event: string;
  args: any;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  address: string;
  topics: string[];
  data: string;
}

export interface EVMContractDeployment {
  address: string;
  txHash: string;
  creator: string;
  blockNumber: number;
  timestamp: number;
}

// ========== SOLANA SPECIFIC TYPES ==========
export interface SolanaAccountInfo {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch?: number;
  data: Uint8Array;
}

export interface SolanaTokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
  state: 'initialized' | 'frozen' | 'uninitialized';
}

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  err: any;
  memo?: string;
  instructions: any[];
}

export interface SolanaTokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: any[];
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce?: number;
  tokenStandard?: string;
  collection?: any;
  uses?: any;
}

export interface SolanaProgramAccount {
  pubkey: string;
  account: {
    executable: boolean;
    owner: string;
    lamports: number;
    data: Uint8Array;
    rentEpoch: number;
  };
}

// ========== SDK CONFIGURATION TYPES ==========
export interface SDKConfig {
  evmPrivateKey?: string;
  solanaPrivateKey?: string;
  rpcUrls?: Partial<Record<Chain, string>>;
  timeout?: number;
  maxRetries?: number;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

export interface BackendConfig extends SDKConfig {
  databaseUrl?: string;
  redisUrl?: string;
  cacheTtl?: number;
}

export interface FrontendConfig {
  autoConnect?: boolean;
  theme?: 'light' | 'dark';
  defaultChain?: Chain;
  supportedChains?: Chain[];
}

// ========== RESPONSE TYPES ==========
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========== EVENT TYPES ==========
export interface EventListenerOptions {
  eventName: string;
  contractAddress: string;
  fromBlock?: number;
  toBlock?: number | string;
  pollInterval?: number;
}

export interface Subscription {
  unsubscribe: () => void;
}

// ========== GAS & FEE TYPES ==========
export interface GasPriceData {
  slow: string;
  standard: string;
  fast: string;
  rapid: string;
  baseFeePerGas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface FeeData {
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasLimit: string;
}

// ========== MULTICALL TYPES ==========
export interface MulticallRequest {
  contractAddress: string;
  functionName: string;
  args?: any[];
  abi: any[];
}

export interface MulticallResponse {
  success: boolean;
  result?: any;
  error?: string;
}

// ========== BRIDGE TYPES ==========
export interface BridgeRoute {
  fromChain: Chain;
  toChain: Chain;
  fromToken: string;
  toToken: string;
  amount: string;
  fee: string;
  estimatedTime: number;
  route: any;
}

export interface BridgeQuote {
  routes: BridgeRoute[];
  bestRoute: BridgeRoute;
}

// ========== DEX TYPES ==========
export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  minToAmount: string;
  priceImpact: string;
  fee: string;
  route: any[];
  routerAddress: string;
  gasEstimate: string;
}

export interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  fee: string;
}

// ========== STAKING TYPES ==========
export interface StakingPosition {
  poolAddress: string;
  stakedAmount: string;
  rewards: string;
  unlockTime?: number;
  apr: string;
}

export interface StakingPool {
  address: string;
  token: string;
  totalStaked: string;
  apr: string;
  rewardToken: string;
  lockPeriod?: number;
}

// ========== PRICE ORACLE TYPES ==========
export interface PriceData {
  token: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap?: string;
  liquidity?: string;
  timestamp: number;
}

// ========== NFT MARKETPLACE TYPES ==========
export interface NFTListing {
  tokenId: number;
  contractAddress: string;
  seller: string;
  price: string;
  currency: string;
  expiresAt?: number;
  marketplace: string;
}

export interface NFTBid {
  tokenId: number;
  contractAddress: string;
  bidder: string;
  price: string;
  currency: string;
  expiresAt?: number;
}

// ========== ANALYTICS TYPES ==========
export interface PortfolioValue {
  totalValue: string;
  chains: Record<Chain, string>;
  tokens: TokenBalance[];
  nfts: NFTInfo[];
  timestamp: number;
}

export interface TransactionHistory {
  transactions: TransactionResponse[];
  total: number;
  page: number;
  limit: number;
}

// ========== SECURITY TYPES ==========
export interface SecurityScanResult {
  contractAddress: string;
  risks: string[];
  warnings: string[];
  score: number;
  isSafe: boolean;
  lastScanned: number;
}

export interface AuditReport {
  auditor: string;
  score: number;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  reportUrl: string;
  date: number;
}

// ========== NOTIFICATION TYPES ==========
export interface Notification {
  id: string;
  type: 'transaction' | 'price' | 'security' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

// ========== BACKUP & RECOVERY TYPES ==========
export interface WalletBackup {
  version: string;
  wallets: WalletInfo[];
  timestamp: number;
  encrypted: boolean;
}

export interface RecoveryPhrase {
  mnemonic: string;
  addresses: string[];
  timestamp: number;
}

// ========== ADVANCED FEATURE TYPES ==========
export interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastExecuted?: number;
}

export interface BatchTransaction {
  id: string;
  transactions: TransactionResponse[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gasSaved: string;
  createdAt: number;
  completedAt?: number;
}

// ========== CROSS-CHAIN TYPES ==========
export interface CrossChainBalance {
  chain: Chain;
  nativeBalance: string;
  tokens: TokenBalance[];
  nfts: NFTInfo[];
  totalValue: string;
}

export interface ChainStatus {
  chain: Chain;
  online: boolean;
  blockNumber: number;
  gasPrice: string;
  lastUpdate: number;
}
// ========== WALLET CONNECTION TYPES ==========
export interface WalletConnection {
  address: string;
  chain: Chain;
  connected: boolean;
  provider?: any;
}
