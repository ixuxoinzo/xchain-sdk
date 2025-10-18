import dotenv from 'dotenv';
dotenv.config();
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  AccountInfo,
  Commitment,
  Finality,
  Signer,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
  createMintToInstruction,
  createInitializeMintInstruction,
  createSetAuthorityInstruction,
  createBurnInstruction,
  createCloseAccountInstruction,
  createApproveInstruction,
  createRevokeInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from '@metaplex-foundation/js';
import bs58 from 'bs58';
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic
} from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import fetch from 'node-fetch';
import {
  WalletInfo,
  TokenInfo,
  NFTInfo,
  SolanaTransaction,
  SolanaAccountInfo,
  SolanaTokenAccount,
  BalanceResult,
  TokenBalance,
  SolanaTransferResponse,
  SolanaTokenTransferResponse,
  SolanaNFTMintResponse,
  SolanaPriceData,
  SolanaHistoryItem,
  SolanaNetwork
  } from './types.js';
import { Chain } from './chains.js'; 

// RPC URLs with fallbacks and timeouts
const SOLANA_RPC_URLS = {
  mainnet: [
    process.env.SOLANA_RPC_MAINNET || 'https://api.mainnet-beta.solana.com',
    process.env.SOLANA_RPC_MAINNET_FALLBACK_1 || 'https://solana-api.projectserum.com',
    process.env.SOLANA_RPC_MAINNET_FALLBACK_2 || 'https://rpc.ankr.com/solana'
  ],
  testnet: [
    process.env.SOLANA_RPC_TESTNET || 'https://api.testnet.solana.com'
  ],
  devnet: [
    process.env.SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com'
  ]
};
// Pyth Network Price Feeds (Mainnet)
const PYTH_PRICE_FEEDS = {
  SOL_USD: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
  USDC_USD: 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
  USDT_USD: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
};
// Jupiter API endpoints
const JUPITER_API = {
  price: 'https://price.jup.ag/v4/price',
  tokens: 'https://token.jup.ag/all',
};
// Common Solana token mappings
const TOKEN_MAPPINGS: { [key: string]: string } = {
  'So11111111111111111111111111111111111111112': 'SOL',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
  'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR': 'GUAC',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'WIF',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
  'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y': 'SHADOW',
};
// Logger for production
class ProductionLogger {
  static warn(message: string, context?: any) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[SOLANA-SDK] ${message}`, context);
    } else {
      console.warn(`[SOLANA-SDK] ${message}`, context);
    }
  }
  static error(message: string, error?: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[SOLANA-SDK] ${message}`, {
        error: error?.message,
        stack: error?.stack
      });
    } else {
      console.error(`[SOLANA-SDK] ${message}`, error);
    }
  }
  static info(message: string, context?: any) {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[SOLANA-SDK] ${message}`, context);
    } else {
      console.log(`[SOLANA-SDK] ${message}`, context);
    }
  }
}
export class SolanaSDK {
  private connection: Connection;
  private keypair: Keypair;
  private metaplex: Metaplex | null = null;
  private commitment: Commitment;
  private network: SolanaNetwork;
  private metaplexInitialized: boolean = false;
  constructor(
    privateKey: Uint8Array | string,
    network: SolanaNetwork = 'mainnet',
    customRpcUrl?: string,
    commitment: Commitment = 'confirmed'
  ) {
    this.network = network;
    this.commitment = commitment;
   // Handle private key input
    if (typeof privateKey === 'string') {
  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(privateKey);
  } catch (base58Error) {
    if (privateKey.trim().startsWith('[') && privateKey.trim().endsWith(']')) {
      try {
        const keyArray = JSON.parse(privateKey);
        if (!Array.isArray(keyArray) || keyArray.some(n => typeof n !== 'number' || n < 0 || n
> 255)) {
           throw new Error('Invalid JSON array.');
        }
        decoded = new Uint8Array(keyArray);
      } catch (jsonError: any) {
        throw new Error(`Invalid private key format.`);
      }
    } else {
       throw base58Error;
    }
  }
  const keyLength = decoded.length;
  if (keyLength === 64) {
    this.keypair = Keypair.fromSecretKey(decoded);
  } else if (keyLength === 32) {
    this.keypair = Keypair.fromSeed(decoded);
  } else {
    throw new Error(`Bad secret key size: ${keyLength} bytes. Expected 32 or 64.`);
  }
} else {
  this.keypair = Keypair.fromSecretKey(privateKey);
}
    // Create connection with fallback RPCs
    this.connection = this.createConnectionSync(network, customRpcUrl);
    // Initialize Metaplex for NFT operations
    this.initializeMetaplex();
  }
  private createConnectionSync(network: SolanaNetwork, customRpcUrl?: string): Connection {
    const rpcUrls = customRpcUrl ? [customRpcUrl] : SOLANA_RPC_URLS[network];
    // Use first RPC URL without async test in constructor
    const rpcUrl = rpcUrls[0];
    ProductionLogger.info(`Using RPC: ${rpcUrl}`);
    return new Connection(rpcUrl, this.commitment);
  }
  private async initializeMetaplex(): Promise<void> {
    try {
      this.metaplex = Metaplex.make(this.connection)
        .use(keypairIdentity(this.keypair))
        .use(bundlrStorage({
          address: 'https://node1.bundlr.network',
          providerUrl: this.connection.rpcEndpoint,
          timeout: 60000,
        }));
      // Test Metaplex connection with timeout
      await Promise.race([
        this.metaplex.nfts().findAllByOwner({ owner: this.keypair.publicKey }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Metaplex initialization timeout')), 10000)
        )
      ]);
      this.metaplexInitialized = true;
      ProductionLogger.info('Metaplex initialized successfully');
    } catch (error) {
      ProductionLogger.warn('Metaplex initialization failed, NFT operations may be limited');
      this.metaplexInitialized = false;
    }
  }
  // ========== ORACLE PRICE FEEDS ==========
  async getPriceFromPyth(priceFeed: keyof typeof PYTH_PRICE_FEEDS): Promise<SolanaPriceData> {
    try {
      const priceAccountAddress = new PublicKey(PYTH_PRICE_FEEDS[priceFeed]);
      const accountInfo = await this.connection.getAccountInfo(priceAccountAddress);
      if (!accountInfo) {
        throw new Error(`Price feed account not found: ${priceFeed}`);
      }
      // Real Pyth price parsing
      const priceData = this.parseRealPythPriceData(accountInfo.data);
      return {
        symbol: priceFeed,
        price: priceData.price,
        confidence: priceData.confidence,
        timestamp: Date.now(),
        source: 'pyth'
      };
    } catch (error: any) {
      throw new Error(`Failed to get price from Pyth: ${error.message}`);
    }
  }
  private parseRealPythPriceData(data: Uint8Array): { price: number; confidence: number } {
    const dataView = new DataView(data.buffer);
    const price = Number(dataView.getBigInt64(16, true));
    const confidence = Number(dataView.getBigUint64(24, true));
    const exponent = dataView.getInt32(48, true);
    const adjustedPrice = price * Math.pow(10, exponent);
    const adjustedConfidence = confidence * Math.pow(10, exponent);
    return {
      price: Math.abs(adjustedPrice),
      confidence: adjustedConfidence
    };
  }
  async getPriceFromJupiter(mintAddress: string): Promise<SolanaPriceData> {
    try {
      const response = await fetch(`${JUPITER_API.price}?ids=${mintAddress}`);
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }
        const data = await response.json() as any;
        if (!data.data || !data.data[mintAddress]) {
         return await this.getPriceBySymbol(this.getTokenSymbol(mintAddress));
        }
      const priceInfo = data.data[mintAddress];
      return {
        symbol: mintAddress,
        price: priceInfo.price,
        confidence: priceInfo.confidence || 0,
        timestamp: Date.now(),
        source: 'jupiter'
      };
    } catch (error: any) {
      throw new Error(`Failed to get price from Jupiter: ${error.message}`);
    }
  }
  private getTokenSymbol(mintAddress: string): string {
    return TOKEN_MAPPINGS[mintAddress] || mintAddress;
  }
  private async getPriceBySymbol(symbol: string): Promise<SolanaPriceData> {
    try {
      const response = await fetch(`${JUPITER_API.price}?ids=${symbol}`);
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }
      const data = await response.json();
      const priceInfo = Object.values((data as any).data)[0] as any;
      if (!priceInfo) {
        throw new Error(`Price not found for symbol: ${symbol}`);
      }
      return {
        symbol: symbol,
        price: priceInfo.price,
        confidence: 0,
        timestamp: Date.now(),
        source: 'jupiter'
      };
    } catch (error: any) {
      throw new Error(`Failed to get price by symbol: ${error.message}`);
    }
  }
  async getPriceFromBirdeye(mintAddress: string): Promise<SolanaPriceData> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/price?address=${mintAddress}`, {
      headers: {
        'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
      }
    });
    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }
    const data: unknown = await response.json();
    const priceData = data as {
      success: boolean;
      data?: { value: number; confidence?: number; updateUnixTime?: number };
    };
    if (!priceData.success || !priceData.data || priceData.data.value === undefined) {
      throw new Error(`Price not found for token: ${mintAddress}`);
    }
    return {
      symbol: mintAddress,
      price: priceData.data.value,
      confidence: priceData.data.confidence || 0,
      timestamp: (priceData.data.updateUnixTime ? priceData.data.updateUnixTime * 1000 : Date.now()),
      source: 'birdeye' as 'birdeye',
    };
  } catch (error: any) {
    throw new Error(`Failed to get price from Birdeye: ${error.message}`);
  }
}
  async getTokenPrice(mintAddress: string, source: 'pyth' | 'jupiter' | 'birdeye' | 'auto' = 'auto'): Promise<SolanaPriceData> {
    try {
      if (source === 'auto') {
        try {
          return await this.getPriceFromJupiter(mintAddress);
        } catch (jupiterError) {
          ProductionLogger.warn('Jupiter price failed, trying Birdeye', jupiterError);
          try {
            return await this.getPriceFromBirdeye(mintAddress);
          } catch (birdeyeError) {
            ProductionLogger.warn('Birdeye price failed, trying Pyth', birdeyeError);
            const pythFeed = Object.entries(PYTH_PRICE_FEEDS).find(([_, address]) => address === mintAddress);
            if (pythFeed) {
              return await this.getPriceFromPyth(pythFeed[0] as keyof typeof PYTH_PRICE_FEEDS);            }
            if (mintAddress === 'So11111111111111111111111111111111111111112') {
              return await this.getPriceFromPyth('SOL_USD');
            }
            throw new Error('No price source available for this token');
          }
        }
      }
      switch (source) {
        case 'pyth':
          const pythFeed = Object.entries(PYTH_PRICE_FEEDS).find(([_, address]) => address ===
mintAddress);
          if (!pythFeed) {
            throw new Error('Token not available on Pyth network');
          }
          return await this.getPriceFromPyth(pythFeed[0] as keyof typeof PYTH_PRICE_FEEDS);
        case 'jupiter':
          return await this.getPriceFromJupiter(mintAddress);
        case 'birdeye':
          return await this.getPriceFromBirdeye(mintAddress);
        default:
          throw new Error(`Unknown price source: ${source}`);
      }
    } catch (error: any) {
      ProductionLogger.error(`Failed to get token price for ${mintAddress}`, error);
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }
  async getMultiplePrices(mintAddresses: string[], source: 'jupiter' | 'birdeye' = 'jupiter'):
Promise<SolanaPriceData[]> {
    try {
      if (source === 'jupiter') {
        const ids = mintAddresses.join(',');
        const response = await fetch(`${JUPITER_API.price}?ids=${ids}`);
        if (!response.ok) {
          throw new Error(`Jupiter API error: ${response.statusText}`);
        }
        const data = await response.json() as any;
        return mintAddresses.map(mint => {
          const priceInfo = data.data[mint];
          return {
            symbol: mint,
            price: priceInfo?.price || 0,
            confidence: priceInfo?.confidence || 0,
            timestamp: Date.now(),
            source: 'jupiter' as const
          };
        });
      } else {
        const prices = await Promise.all(
          mintAddresses.map(mint =>
            this.getPriceFromBirdeye(mint).catch(error => {
              ProductionLogger.warn(`Failed to get price for ${mint} from Birdeye`, error);
              return {
                symbol: mint,
                price: 0,
                confidence: 0,
                timestamp: Date.now(),
                source: 'birdeye'
              };
            })
          )
        ) as SolanaPriceData[];
        return prices;
      }
    } catch (error: any) {
      ProductionLogger.error('Failed to get multiple prices', error);
      throw new Error(`Failed to get multiple prices: ${error.message}`);
    }
  }
  // ========== WALLET MANAGEMENT ==========
  static createRandom(): WalletInfo {
    const keypair = Keypair.generate();
    const mnemonic = generateMnemonic();
    return {
      address: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      mnemonic: mnemonic,
      publicKey: keypair.publicKey.toString()
    };
  }
  static fromMnemonic(mnemonic: string, path: string = "m/44'/501'/0'/0'"): WalletInfo {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    if (derivedSeed.length !== 32) {
      throw new Error('Derived seed must be 32 bytes');
    }
    const keypair = Keypair.fromSeed(derivedSeed);
    return {
      address: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      mnemonic: mnemonic,
      publicKey: keypair.publicKey.toString()
    };
  }
  getAddress(): string {
    return this.keypair.publicKey.toString();
  }
  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }
  getNetwork(): SolanaNetwork {
    return this.network;
  }
  isMetaplexInitialized(): boolean {
    return this.metaplexInitialized;
  }
  public async getBalance(address?: string): Promise<number> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const balance = await this.connection.getBalance(pubkey, this.commitment);
    return balance / LAMPORTS_PER_SOL;
}
  // ========== NATIVE SOL OPERATIONS ==========
  async transferSOL(
    to: string,
    amount: number,
    options: {
      memo?: string;
      computeUnitPrice?: number;
      computeUnitLimit?: number;
      skipPreflight?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<SolanaTransferResponse> {
    const maxRetries = options.maxRetries || 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        ProductionLogger.info(`SOL transfer attempt ${attempt}/${maxRetries}`, { to, amount });
        const toPubkey = new PublicKey(to);
        const latestBlockhash = await this.connection.getLatestBlockhash(this.commitment);
        const transaction = new Transaction({
          feePayer: this.keypair.publicKey,
          ...latestBlockhash
        });
        if (options.computeUnitPrice) {
          transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: options.computeUnitPrice
          }));
        }
        if (options.computeUnitLimit) {
          transaction.add(ComputeBudgetProgram.setComputeUnitLimit({
            units: options.computeUnitLimit
          }));
        }
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: this.keypair.publicKey,
            toPubkey: toPubkey,
            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
          })
        );
        if (options.memo) {
          transaction.add(
            new TransactionInstruction({
              keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: true }],
              programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
              data: Buffer.from(options.memo, 'utf8')
            })
          );
        }
        const skipPreflight = this.network === 'mainnet'
          ? (options.skipPreflight || false)
          : (options.skipPreflight || true);
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.keypair],
          {
            commitment: this.commitment,
            skipPreflight,
            preflightCommitment: this.commitment
          }
        );
        const confirmation = await this.connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
          },
          this.commitment
        );
        const tx = await this.connection.getTransaction(signature, {
         commitment: this.commitment as any,
         maxSupportedTransactionVersion: 0
        });
        ProductionLogger.info('SOL transfer successful', { signature, amount });
        return {
          signature,
          from: this.keypair.publicKey.toString(),
          to,
          amount,
          lamports: amount * LAMPORTS_PER_SOL,
          slot: confirmation.context.slot,
          blockTime: tx?.blockTime || null,
          confirmationStatus: 'confirmed'
        };
      } catch (error: any) {
        ProductionLogger.warn(`SOL transfer attempt ${attempt} failed`, error);
        if (attempt === maxRetries) {
          throw new Error(`SOL transfer failed after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('SOL transfer failed: max retries exceeded');
  }
  // ========== SPL TOKEN OPERATIONS ==========
  async transferSPLToken(
    mint: string,
    to: string,
    amount: number,
    options: {
      decimals?: number;
      computeUnitPrice?: number;
      computeUnitLimit?: number;
      skipPreflight?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<SolanaTokenTransferResponse> {
    const maxRetries = options.maxRetries || 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        ProductionLogger.info(`SPL token transfer attempt ${attempt}/${maxRetries}`, { mint, to, amount });
        const mintPubkey = new PublicKey(mint);
        const toPubkey = new PublicKey(to);
        const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
        const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);
        const latestBlockhash = await this.connection.getLatestBlockhash(this.commitment);
        const transaction = new Transaction({
          feePayer: this.keypair.publicKey,
          ...latestBlockhash
        });
        if (options.computeUnitPrice) {
          transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: options.computeUnitPrice
          }));
        }
        if (options.computeUnitLimit) {
          transaction.add(ComputeBudgetProgram.setComputeUnitLimit({
            units: options.computeUnitLimit
          }));
        }
        let tokenAccountExists = true;
        try {
          const tokenAccount = await getAccount(this.connection, toTokenAccount);
          if (tokenAccount.isFrozen) {
            throw new Error('Token account is frozen');
          }
        } catch (error: any) {
          if (error.message.includes('could not find account')) {
            tokenAccountExists = false;
            transaction.add(
              createAssociatedTokenAccountInstruction(
                this.keypair.publicKey,
                toTokenAccount,
                toPubkey,
                mintPubkey
              )
            );
          } else {
            throw error;
          }
        }
        let decimals = options.decimals;
        if (!decimals) {
          const mintInfo = await getMint(this.connection, mintPubkey);
          decimals = mintInfo.decimals;
        }
        const amountMultiplier = Math.pow(10, decimals!);
        const rawAmount = amount * amountMultiplier;
        if (rawAmount > Number.MAX_SAFE_INTEGER) {
          throw new Error('Amount too large, consider using BigNumber library');
        }
        const adjustedAmount = BigInt(Math.round(rawAmount));
        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            this.keypair.publicKey,
            adjustedAmount
          )
        );
        const skipPreflight = this.network === 'mainnet'
          ? (options.skipPreflight || false)
          : (options.skipPreflight || true);
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.keypair],
          {
            commitment: this.commitment,
            skipPreflight,
            preflightCommitment: this.commitment
          }
        );
        const slot = await this.connection.getSlot(this.commitment);
        ProductionLogger.info('SPL token transfer successful', { signature, mint, amount });
        return {
          signature,
          from: this.keypair.publicKey.toString(),
          to,
          mint,
          amount,
          decimals: decimals!,
          slot
        };
      } catch (error: any) {
        ProductionLogger.warn(`SPL token transfer attempt ${attempt} failed`, error);
        if (attempt === maxRetries) {
          throw new Error(`SPL token transfer failed after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('SPL token transfer failed: max retries exceeded');
  }
  async getTokenBalance(mint: string, address?: string): Promise<number> {
    try {
      const mintPubkey = new PublicKey(mint);
      const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
      const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
      const accountInfo = await getAccount(this.connection, tokenAccount);
      if (accountInfo.isFrozen) {
        return 0;
      }
      const mintInfo = await getMint(this.connection, mintPubkey);
      return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
    } catch (error: any) {
      if (error.message.includes('could not find account')) {
        return 0;
      }
      throw error;
    }
  }
  async getTokenInfo(mint: string): Promise<TokenInfo> {
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await getMint(this.connection, mintPubkey);
    const balance = await this.getTokenBalance(mint);
    let name = 'Unknown Token';
    let symbol = 'UNKNOWN';
    if (this.metaplex) {
      try {
        const metadata = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        name = metadata.name;
        symbol = metadata.symbol;
      } catch (error) {
        // Metadata not available
      }
    }
    return {
      address: mint,
      symbol,
      name,
      decimals: mintInfo.decimals,
      totalSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toString(),
      balance: balance.toString()
    };
  }
  // ========== NFT OPERATIONS ==========
async createNFT(metadata: {
  name: string;
  symbol: string;
  description: string;
  image: string | Buffer;
  attributes?: Array<{ trait_type: string; value: string }>;
  external_url?: string;
  seller_fee_basis_points?: number;
}, options: {
  computeUnitPrice?: number;
  creators?: Array<{ address: PublicKey; share: number }>;
  isMutable?: boolean;
  maxRetries?: number;
} = {}): Promise<SolanaNFTMintResponse> {
  if (!this.metaplexInitialized) {
    throw new Error('Metaplex not initialized. NFT operations require Metaplex.');
  }
  const maxRetries = options.maxRetries || 3;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      ProductionLogger.info(`NFT creation attempt ${attempt}/${maxRetries}`, {
        name: metadata.name,
        symbol: metadata.symbol
      });
      const imageFile =
        typeof metadata.image === 'string'
          ? metadata.image
          : toMetaplexFile(metadata.image, 'image.png');
    const { uri } = (await Promise.race([
     this.metaplex!.nfts().uploadMetadata({
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    image: imageFile,
    attributes: metadata.attributes || [],
    external_url: metadata.external_url || '',
    seller_fee_basis_points: metadata.seller_fee_basis_points || 500,
     }),
     new Promise<{ uri: string }>((_, reject) =>
    setTimeout(() => reject(new Error('Metadata upload timeout')), 30000)
    ),
     ])) as { uri: string };
     const { nft, response } = await this.metaplex!.nfts().create({
        uri,
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points || 500,
        creators: options.creators || [
          { address: this.keypair.publicKey, share: 100 },
        ],
        isMutable: options.isMutable !== false,
        maxSupply: 1,
        useNewMint: Keypair.generate(),
      });
      ProductionLogger.info('✅  NFT creation successful', {
        mint: nft.address.toString(),
        signature: response.signature
      });
      return {
        mint: nft.address.toString(),
        signature: response.signature,
        metadataUri: uri,
        metadata: {
          name: nft.name,
          symbol: nft.symbol,
          uri: nft.uri,
          sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
          creators: nft.creators,
          primarySaleHappened: nft.primarySaleHappened,
          isMutable: nft.isMutable,
        },
      };
    } catch (error: any) {
      lastError = error;
      ProductionLogger.warn(`⚠️ NFT creation attempt ${attempt} failed`, { message: error.message });
      if (attempt < maxRetries) {
        ProductionLogger.warn(`Retrying NFT creation (attempt ${attempt + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  throw new Error(`NFT creation failed after ${maxRetries} attempts: ${lastError?.message}`);
}
  // ========== TRANSACTION OPERATIONS ==========
  async getTransaction(signature: string): Promise<SolanaTransaction> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: this.commitment as Finality
      });
      if (!tx) {
        throw new Error('Transaction not found');
      }
      return {
        signature: tx.transaction.signatures[0],
        slot: tx.slot,
        blockTime: tx.blockTime || null,
        confirmationStatus: 'confirmed',
        err: tx.meta?.err || null,
        fee: tx.meta?.fee || 0,
        instructions: (tx.transaction.message as any).instructions,
        logMessages: tx.meta?.logMessages || []
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }
  async getTransactionHistory(address: string, limit: number = 10): Promise<SolanaHistoryItem[]> {
    try {
      const pubkey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.getTransaction(sig.signature);
            return {
              signature: tx.signature,
              slot: tx.slot,
              blockTime: tx.blockTime,
              confirmationStatus: tx.confirmationStatus,
              err: tx.err,
              fee: tx.fee || 0,
              type: this.determineTransactionType(tx)
            };
          } catch (error) {
            return null;
          }
        })
      );
      return transactions.filter((tx): tx is SolanaHistoryItem => tx !== null);
    } catch (error: any) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }
  private determineTransactionType(tx: SolanaTransaction): 'transfer' | 'token_transfer' | 'program' | 'unknown' {
    if (!tx.instructions) return 'unknown';
    for (const instruction of tx.instructions) {
      if (instruction.programId === SystemProgram.programId.toString()) {
        return 'transfer';
      }
      if (instruction.programId === TOKEN_PROGRAM_ID.toString()) {
        return 'token_transfer';
      }
    }
    return 'program';
  }
 async getRecentTransactions(address: PublicKey, limit: number = 10): Promise<SolanaTransaction[]> {
  try {
    const signatures = await this.connection.getSignaturesForAddress(address, { limit });
    const transactions = await Promise.all(
      signatures.map(async (sigInfo) => {
        try {
          return await this.getTransaction(sigInfo.signature);
        } catch {
          return null;
        }
      })
    );
    return transactions.filter(
      (tx: SolanaTransaction | null): tx is SolanaTransaction => tx !== null
    );
  } catch (error: any) {
    throw new Error(`Failed to get recent transactions: ${error.message}`);
  }
}
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      transaction.partialSign(this.keypair);
      return transaction;
    } catch (error: any) {
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }
  async sendTransaction(transaction: Transaction, signers: Signer[] = []): Promise<string> {
    try {
      signers.push(this.keypair);
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        signers,
        {
          commitment: this.commitment,
          skipPreflight: this.network !== 'mainnet'
        }
      );
      return signature;
    } catch (error: any) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }
  async simulateTransaction(transaction: Transaction): Promise<any> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return simulation;
    } catch (error: any) {
      throw new Error(`Failed to simulate transaction: ${error.message}`);
    }
  }
  // ========== ACCOUNT MANAGEMENT ==========
  async getAccountInfo(address: string): Promise<SolanaAccountInfo> {
    try {
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
        rentEpoch: accountInfo.rentEpoch ?? 0,
        dataLength: accountInfo.data.length,
        data: accountInfo.data
      };
    } catch (error: any) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }
  async getTokenAccounts(address?: string): Promise<SolanaTokenAccount[]> {
    try {
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
            decimals: mintInfo.decimals,
            state: accountInfo.isInitialized ?
              (accountInfo.isFrozen ? 'frozen' : 'initialized') :
              'uninitialized'
          });
        } catch (error) {
          continue;
        }
      }
      return accounts;
    } catch (error: any) {
      throw new Error(`Failed to get token accounts: ${error.message}`);
    }
  }
  async getProgramAccounts(programId: string, filters?: any[]): Promise<any[]> {
    try {
      const programPubkey = new PublicKey(programId);
      const accounts = await this.connection.getProgramAccounts(programPubkey, {
        filters,
        commitment: this.commitment
      });
      return accounts.map(account => ({
        pubkey: account.pubkey.toString(),
        account: {
          executable: account.account.executable,
          owner: account.account.owner.toString(),
          lamports: account.account.lamports,
          data: account.account.data,
          rentEpoch: account.account.rentEpoch
        }
      }));
    } catch (error: any) {
      throw new Error(`Failed to get program accounts: ${error.message}`);
    }
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
  async getRecentBlockhash(): Promise<string> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash(this.commitment);
      return blockhash;
    } catch (error: any) {
      throw new Error(`Failed to get recent blockhash: ${error.message}`);
    }
  }
  async getSlot(): Promise<number> {
    try {
      return await this.connection.getSlot(this.commitment);
    } catch (error: any) {
      throw new Error(`Failed to get slot: ${error.message}`);
    }
  }
  async getEpochInfo(): Promise<any> {
    try {
      return await this.connection.getEpochInfo();
    } catch (error: any) {
      throw new Error(`Failed to get epoch info: ${error.message}`);
    }
  }
  async getVersion(): Promise<any> {
    try {
      return await this.connection.getVersion();
    } catch (error: any) {
      throw new Error(`Failed to get version: ${error.message}`);
    }
  }
  // ========== BATCH OPERATIONS ==========
  async getMultipleBalances(addresses: string[]): Promise<BalanceResult[]> {
    try {
      const balances = await Promise.all(
        addresses.map(async (address) => ({
          address,
          balance: (await this.getBalance(address)).toString(),
          chain: 'SOLANA' as Chain,
          symbol: 'SOL'
        }))
      );
      return balances;
    } catch (error: any) {
      throw new Error(`Failed to get multiple balances: ${error.message}`);
    }
  }
  async getMultipleTokenBalances(mint: string, addresses: string[]): Promise<TokenBalance[]> {
    try {
      const balances = await Promise.all(
        addresses.map(async (address) => ({
          address,
          balance: (await this.getTokenBalance(mint, address)).toString(),
          token: await this.getTokenInfo(mint)
        }))
      );
      return balances;
    } catch (error: any) {
      throw new Error(`Failed to get multiple token balances: ${error.message}`);
    }
  }
  // ========== HEALTH CHECK ==========
  async healthCheck(): Promise<{ healthy: boolean; latency: number; slot: number }> {
    const startTime = Date.now();
    try {
      const slot = await this.getSlot();
      const latency = Date.now() - startTime;
      return {
        healthy: true,
        latency,
        slot
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        slot: 0
      };
    }
  }
  // ========== TOKEN MANAGEMENT ==========
  async createToken(decimals: number = 9, options: {
    mintAuthority?: PublicKey;
    freezeAuthority?: PublicKey;
    computeUnitPrice?: number;
  } = {}): Promise<string> {
    try {
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(this.connection);
      const transaction = new Transaction();
      if (options.computeUnitPrice) {
        transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: options.computeUnitPrice
        }));
      }
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: this.keypair.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          options.mintAuthority || this.keypair.publicKey,
          options.freezeAuthority || this.keypair.publicKey
        )
      );
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair, mintKeypair],
        {
          commitment: this.commitment,
          skipPreflight: this.network !== 'mainnet'
        }
      );
      ProductionLogger.info('Token created successfully', { mint: mintKeypair.publicKey.toString() });
      return mintKeypair.publicKey.toString();
    } catch (error: any) {
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }
  async mintTokens(mint: string, to: string, amount: number): Promise<string> {
    try {
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
      const transaction = new Transaction().add(
        createMintToInstruction(
          mintPubkey,
          tokenAccount.address,
          this.keypair.publicKey,
          adjustedAmount
        )
      );
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair],
        {
          commitment: this.commitment,
          skipPreflight: this.network !== 'mainnet'
        }
      );
      ProductionLogger.info('Tokens minted successfully', { mint, to, amount });
      return signature;
    } catch (error: any) {
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  }
}
// Utility functions for Solana
export class SolanaUtils {
  static validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
  static shortAddress(address: string, chars: number = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
  static lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }
  static solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }
  static formatAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }
  static getPythPriceFeeds(): typeof PYTH_PRICE_FEEDS {
    return PYTH_PRICE_FEEDS;
  }
  static getTokenMappings(): { [key: string]: string } {
    return TOKEN_MAPPINGS;
  }
}
// Default export for convenience
export default SolanaSDK;
