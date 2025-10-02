import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  sendAndConfirmTransaction,
  TransactionInstruction,
  VersionedTransaction,
  Message,
  CompiledInstruction,
  AddressLookupTableAccount,
  BlockheightBasedTransactionConfirmationStrategy,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH,
  ComputeBudgetProgram,
  StakeProgram,
  VOTE_PROGRAM_ID,
  BPF_LOADER_DEPRECATED_PROGRAM_ID,
  BPF_LOADER_PROGRAM_ID,
  Ed25519Program,
  Secp256k1Program,
  ParsedAccountData,
  PartiallyDecodedInstruction,
  ParsedTransaction,
  ParsedInstruction,
  MessageAccountKeys,
  ConfirmedSignatureInfo,
  ConfirmedTransaction,
  TokenBalance,
  TransactionResponse,
  RpcResponseAndContext,
  SignatureResult,
  Context,
  Logs,
  MemcmpFilter,
  DataSizeFilter,
  GetProgramAccountsConfig,
  AccountInfo,
  Commitment,
  Finality,
  SendTransactionOptions,
  Signer,
  TransactionSignature,
  Cluster,
  clusterApiUrl
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
  createSyncNativeInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  AccountLayout,
  MintLayout,
  NATIVE_MINT,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidAccountSizeError,
  TokenOwnerOffCurveError,
  createInitializeAccountInstruction,
  createInitializeMultisigInstruction,
  MULTISIG_SIZE,
  getMinimumBalanceForRentExemptMultisig,
  createTransferCheckedInstruction,
  createBurnCheckedInstruction,
  createMintToCheckedInstruction,
  createInitializeMintCloseAuthorityInstruction,
  unpackAccount,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';

import { 
  createCreateMetadataAccountV3Instruction, 
  createUpdateMetadataAccountV2Instruction,
  createCreateMasterEditionV3Instruction,
  createVerifyCollectionInstruction,
  createSetAndVerifyCollectionInstruction,
  createVerifySizedCollectionItemInstruction,
  createUnverifyCollectionInstruction,
  createUnverifySizedCollectionItemInstruction,
  DataV2,
  Metadata,
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  FindNftsByOwnerOutput,
  Sft,
  Nft,
  MetaplexPlugin,
  WalletAdapter
} from '@metaplex-foundation/js';

import { 
  bs58 
} from 'bs58';

import { 
  CHAINS, 
  Chain 
} from './chains';

import { 
  TransactionResponse as XChainTransactionResponse,
  TokenInfo,
  NFTInfo,
  WalletInfo,
  SolanaAccountInfo,
  SolanaTokenAccount,
  SolanaTransaction,
  SolanaTokenMetadata,
  BalanceResult,
  TokenBalance,
  APIResponse
} from './types';

// Extended types for Solana
export interface SolanaTransferResponse {
  signature: string;
  from: string;
  to: string;
  amount: number;
  lamports: number;
  slot: number;
  blockTime: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
}

export interface SolanaTokenTransferResponse {
  signature: string;
  from: string;
  to: string;
  mint: string;
  amount: number;
  decimals: number;
  slot: number;
}

export interface SolanaNFTMintResponse {
  mint: string;
  signature: string;
  metadataUri: string;
  metadata: any;
}

export interface SolanaStakeAccount {
  address: string;
  balance: number;
  stake: number;
  rewards: number;
  activationEpoch: number;
  deactivationEpoch: number;
  voter: string;
}

export interface SolanaVoteAccount {
  address: string;
  validator: string;
  commission: number;
  votes: number;
  rootSlot: number;
  epoch: number;
}

export interface SolanaProgramAccount {
  pubkey: string;
  account: AccountInfo<Buffer>;
  executable: boolean;
  owner: string;
  lamports: number;
  data: Uint8Array;
  rentEpoch: number;
}

export interface SolanaTokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce?: number;
  tokenStandard?: string;
  collection?: {
    verified: boolean;
    key: string;
  };
  uses?: {
    useMethod: 'burn' | 'multiple' | 'single';
    remaining: number;
    total: number;
  };
}

export class SolanaSDK {
  private connection: Connection;
  private keypair: Keypair;
  private metaplex: Metaplex | null = null;
  private commitment: Commitment = 'confirmed';

  constructor(privateKey: Uint8Array | string, customRpcUrl?: string, commitment: Commitment = 'confirmed') {
    // Handle both Uint8Array and base58 string private keys
    if (typeof privateKey === 'string') {
      this.keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    } else {
      this.keypair = Keypair.fromSecretKey(privateKey);
    }
    
    const rpcUrl = customRpcUrl || CHAINS.SOLANA.rpc;
    this.connection = new Connection(rpcUrl, commitment);
    this.commitment = commitment;
    
    // Initialize Metaplex for NFT operations
    this.initializeMetaplex();
  }

  private initializeMetaplex(): void {
    try {
      this.metaplex = Metaplex.make(this.connection)
        .use(keypairIdentity(this.keypair))
        .use(bundlrStorage({
          address: 'https://node1.bundlr.network',
          providerUrl: this.connection.rpcEndpoint,
          timeout: 60000,
        }));
    } catch (error) {
      console.warn('Metaplex initialization failed, NFT operations may be limited:', error);
    }
  }

  // ========== WALLET MANAGEMENT ==========

  static createRandom(): WalletInfo {
    const keypair = Keypair.generate();
    return {
      address: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      publicKey: keypair.publicKey.toString()
    };
  }

  static fromMnemonic(mnemonic: string): WalletInfo {
    // Note: Solana doesn't have built-in mnemonic support like Ethereum
    // This is a simplified implementation - in production use proper key derivation
    const seed = bs58.encode(Buffer.from(mnemonic));
    const keypair = Keypair.fromSeed(Buffer.from(seed).subarray(0, 32));
    
    return {
      address: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      publicKey: keypair.publicKey.toString()
    };
  }

  getAddress(): string {
    return this.keypair.publicKey.toString();
  }

  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  async getBalance(address?: string): Promise<number> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const balance = await this.connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  }

  async getBalanceLamports(address?: string): Promise<number> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    return await this.connection.getBalance(pubkey);
  }

  // ========== NATIVE SOL OPERATIONS ==========

  async transferSOL(to: string, amount: number, options: {
    memo?: string;
    computeUnitPrice?: number;
    computeUnitLimit?: number;
  } = {}): Promise<SolanaTransferResponse> {
    try {
      const toPubkey = new PublicKey(to);
      const transaction = new Transaction();

      // Add compute budget instructions if specified
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

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.keypair.publicKey,
          toPubkey: toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Add memo if provided
      if (options.memo) {
        transaction.add(
          new TransactionInstruction({
            keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: true }],
            programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            data: Buffer.from(options.memo, 'utf8')
          })
        );
      }

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair],
        {
          commitment: this.commitment,
          skipPreflight: true
        }
      );

      // Get transaction confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash: transaction.recentBlockhash!,
          lastValidBlockHeight: transaction.lastValidBlockHeight!
        },
        this.commitment
      );

      return {
        signature,
        from: this.keypair.publicKey.toString(),
        to,
        amount,
        lamports: amount * LAMPORTS_PER_SOL,
        slot: confirmation.context.slot,
        blockTime: Date.now() / 1000,
        confirmationStatus: 'confirmed'
      };
    } catch (error: any) {
      throw new Error(`SOL transfer failed: ${error.message}`);
    }
  }

  async transferSOLToMultiple(recipients: Array<{ to: string; amount: number }>, options: {
    computeUnitPrice?: number;
    computeUnitLimit?: number;
  } = {}): Promise<SolanaTransferResponse[]> {
    const transactions: SolanaTransferResponse[] = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.transferSOL(recipient.to, recipient.amount, options);
        transactions.push(result);
      } catch (error) {
        transactions.push({
          signature: '',
          from: this.keypair.publicKey.toString(),
          to: recipient.to,
          amount: recipient.amount,
          lamports: recipient.amount * LAMPORTS_PER_SOL,
          slot: 0,
          blockTime: 0,
          confirmationStatus: 'processed',
          // @ts-ignore
          error: error.message
        });
      }
    }
    
    return transactions;
  }

  async airdrop(amount: number = 1, address?: string): Promise<string> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const signature = await this.connection.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    
    await this.connection.confirmTransaction(signature, this.commitment);
    return signature;
  }

  // ========== SPL TOKEN OPERATIONS ==========

  async transferSPLToken(mint: string, to: string, amount: number, options: {
    decimals?: number;
    computeUnitPrice?: number;
    computeUnitLimit?: number;
  } = {}): Promise<SolanaTokenTransferResponse> {
    try {
      const mintPubkey = new PublicKey(mint);
      const toPubkey = new PublicKey(to);
      
      const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      const transaction = new Transaction();

      // Add compute budget instructions if specified
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

      // Get token decimals if not provided
      let decimals = options.decimals;
      if (!decimals) {
        const mintInfo = await getMint(this.connection, mintPubkey);
        decimals = mintInfo.decimals;
      }

      const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, decimals!)));

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
        [this.keypair],
        {
          commitment: this.commitment,
          skipPreflight: true
        }
      );

      const slot = await this.connection.getSlot(this.commitment);

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
      throw new Error(`SPL token transfer failed: ${error.message}`);
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

  async getTokenBalanceLamports(mint: string, address?: string): Promise<bigint> {
    try {
      const mintPubkey = new PublicKey(mint);
      const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
      const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
      
      const accountInfo = await getAccount(this.connection, tokenAccount);
      return accountInfo.amount;
    } catch {
      return BigInt(0);
    }
  }

  async getTokenInfo(mint: string): Promise<TokenInfo> {
    const mintPubkey = new PublicKey(mint);
    const mintInfo = await getMint(this.connection, mintPubkey);
    const balance = await this.getTokenBalance(mint);
    
    // Try to get metadata if available
    let name = 'Unknown Token';
    let symbol = 'UNKNOWN';
    
    if (this.metaplex) {
      try {
        const metadata = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        name = metadata.name;
        symbol = metadata.symbol;
      } catch (error) {
        // Metadata not available, use defaults
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

  async createToken(decimals: number = 9, options: {
    mintAuthority?: PublicKey;
    freezeAuthority?: PublicKey;
    computeUnitPrice?: number;
  } = {}): Promise<string> {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);

    const transaction = new Transaction();

    // Add compute budget if specified
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

    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair, mintKeypair],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return mintKeypair.publicKey.toString();
  }

  async mintTokens(mint: string, to: string, amount: number, options: {
    computeUnitPrice?: number;
  } = {}): Promise<string> {
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

    const transaction = new Transaction();

    // Add compute budget if specified
    if (options.computeUnitPrice) {
      transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: options.computeUnitPrice
      }));
    }

    transaction.add(
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
        skipPreflight: true
      }
    );

    return signature;
  }

  async burnTokens(mint: string, amount: number, options: {
    computeUnitPrice?: number;
  } = {}): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);

    const mintInfo = await getMint(this.connection, mintPubkey);
    const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

    const transaction = new Transaction();

    // Add compute budget if specified
    if (options.computeUnitPrice) {
      transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: options.computeUnitPrice
      }));
    }

    transaction.add(
      createBurnInstruction(
        tokenAccount,
        mintPubkey,
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
        skipPreflight: true
      }
    );

    return signature;
  }

  async approveToken(mint: string, delegate: string, amount: number, options: {
    computeUnitPrice?: number;
  } = {}): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const delegatePubkey = new PublicKey(delegate);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);

    const mintInfo = await getMint(this.connection, mintPubkey);
    const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

    const transaction = new Transaction();

    // Add compute budget if specified
    if (options.computeUnitPrice) {
      transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: options.computeUnitPrice
      }));
    }

    transaction.add(
      createApproveInstruction(
        tokenAccount,
        delegatePubkey,
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
        skipPreflight: true
      }
    );

    return signature;
  }

  async revokeTokenApproval(mint: string, delegate: string): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const delegatePubkey = new PublicKey(delegate);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);

    const transaction = new Transaction();
    transaction.add(
      createRevokeInstruction(
        tokenAccount,
        this.keypair.publicKey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return signature;
  }

  // ========== NFT OPERATIONS ==========

  async createNFT(metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string | File;
    attributes?: Array<{ trait_type: string; value: string }>;
    external_url?: string;
    seller_fee_basis_points?: number;
  }, options: {
    computeUnitPrice?: number;
    creators?: Array<{ address: PublicKey; share: number }>;
    isMutable?: boolean;
    collection?: PublicKey;
  } = {}): Promise<SolanaNFTMintResponse> {
    if (!this.metaplex) {
      throw new Error('Metaplex not initialized. NFT operations require Metaplex.');
    }

    try {
      // Convert image to Metaplex file if it's a string URL
      let imageFile;
      if (typeof metadata.image === 'string') {
        // For URL, we'll use it directly in URI
        imageFile = metadata.image;
      } else {
        // For File object, upload to Arweave
        imageFile = toMetaplexFile(metadata.image, 'image.png');
      }

      const { nft, response } = await this.metaplex.nfts().create({
        uri: "", // Will be set after upload
        name: metadata.name,
        symbol: metadata.symbol,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points || 0,
        creators: options.creators || [
          {
            address: this.keypair.publicKey,
            share: 100,
          },
        ],
        isMutable: options.isMutable !== false,
        collection: options.collection || null,
      });

      // Upload metadata
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: imageFile,
        attributes: metadata.attributes,
        external_url: metadata.external_url,
        properties: {
          files: [
            {
              uri: imageFile,
              type: 'image/png',
            },
          ],
        },
      });

      // Update NFT with actual URI
      await this.metaplex.nfts().update({
        nftOrSft: nft,
        uri: uri,
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
          editionNonce: nft.editionNonce,
          tokenStandard: nft.tokenStandard,
          collection: nft.collection,
        }
      };
    } catch (error: any) {
      throw new Error(`NFT creation failed: ${error.message}`);
    }
  }

  async transferNFT(mint: string, to: string): Promise<SolanaTokenTransferResponse> {
    return await this.transferSPLToken(mint, to, 1);
  }

  async getNFTsByOwner(owner?: string): Promise<NFTInfo[]> {
    if (!this.metaplex) {
      throw new Error('Metaplex not initialized');
    }

    const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
    const nfts = await this.metaplex.nfts().findAllByOwner({ owner: ownerPubkey });

    const nftInfos: NFTInfo[] = [];

    for (const nft of nfts) {
      if (nft.model === 'metadata') {
        try {
          const fullNft = await this.metaplex.nfts().findByMint({ mintAddress: nft.mintAddress });
          
          nftInfos.push({
            contractAddress: nft.mintAddress.toString(),
            tokenId: 0, // Solana NFTs don't have token IDs in the same way
            owner: ownerPubkey.toString(),
            tokenURI: nft.uri,
            name: nft.name,
            symbol: nft.symbol || '',
            image: fullNft.json?.image || '',
            description: fullNft.json?.description || '',
            attributes: fullNft.json?.attributes || []
          });
        } catch (error) {
          // Skip NFTs that can't be fully loaded
          continue;
        }
      }
    }

    return nftInfos;
  }

  async getNFTMetadata(mint: string): Promise<SolanaTokenMetadata> {
    if (!this.metaplex) {
      throw new Error('Metaplex not initialized');
    }

    const mintPubkey = new PublicKey(mint);
    const nft = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });

    return {
      mint: nft.address.toString(),
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
      sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
      creators: nft.creators.map(creator => ({
        address: creator.address.toString(),
        verified: creator.verified,
        share: creator.share
      })),
      primarySaleHappened: nft.primarySaleHappened,
      isMutable: nft.isMutable,
      editionNonce: nft.editionNonce,
      tokenStandard: nft.tokenStandard,
      collection: nft.collection ? {
        verified: nft.collection.verified,
        key: nft.collection.address.toString()
      } : undefined,
      uses: nft.uses ? {
        useMethod: nft.uses.useMethod as 'burn' | 'multiple' | 'single',
        remaining: nft.uses.remaining,
        total: nft.uses.total
      } : undefined
    };
  }

  async updateNFTMetadata(mint: string, updates: {
    name?: string;
    symbol?: string;
    uri?: string;
    sellersFeeBasisPoints?: number;
    creators?: Array<{ address: PublicKey; share: number }>;
    isMutable?: boolean;
  }): Promise<string> {
    if (!this.metaplex) {
      throw new Error('Metaplex not initialized');
    }

    const mintPubkey = new PublicKey(mint);
    const nft = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });

    const { response } = await this.metaplex.nfts().update({
      nftOrSft: nft,
      name: updates.name,
      symbol: updates.symbol,
      uri: updates.uri,
      sellerFeeBasisPoints: updates.sellersFeeBasisPoints,
      creators: updates.creators,
      isMutable: updates.isMutable,
    });

    return response.signature;
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
      data: accountInfo.data,
      rentEpoch: accountInfo.rentEpoch
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
          decimals: mintInfo.decimals,
          state: accountInfo.isInitialized ? 
            (accountInfo.isFrozen ? 'frozen' : 'initialized') : 
            'uninitialized'
        });
      } catch (error) {
        // Skip accounts that can't be parsed
        continue;
      }
    }

    return accounts;
  }

  async getProgramAccounts(programId: string, filters?: (DataSizeFilter | MemcmpFilter)[]): Promise<SolanaProgramAccount[]> {
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
      },
      executable: account.account.executable,
      owner: account.account.owner.toString(),
      lamports: account.account.lamports,
      data: account.account.data,
      rentEpoch: account.account.rentEpoch
    }));
  }

  async createAssociatedTokenAccount(mint: string, owner?: string): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;

    const transaction = new Transaction();
    const associatedTokenAddress = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

    transaction.add(
      createAssociatedTokenAccountInstruction(
        this.keypair.publicKey,
        associatedTokenAddress,
        ownerPubkey,
        mintPubkey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return signature;
  }

  async closeTokenAccount(mint: string, address?: string): Promise<string> {
    const mintPubkey = new PublicKey(mint);
    const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

    const transaction = new Transaction();
    transaction.add(
      createCloseAccountInstruction(
        tokenAccount,
        this.keypair.publicKey,
        this.keypair.publicKey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return signature;
  }

  // ========== TRANSACTION OPERATIONS ==========

  async getTransaction(signature: string): Promise<SolanaTransaction> {
    const tx = await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: this.commitment
    });

    if (!tx) {
      throw new Error('Transaction not found');
    }

    return {
      signature: tx.transaction.signatures[0],
      slot: tx.slot,
      blockTime: tx.blockTime || 0,
      confirmationStatus: 'confirmed',
      err: tx.meta?.err || null,
      memo: tx.transaction.message.compiledInstructions.find(ix => 
        ix.programIdIndex === tx.transaction.message.staticAccountKeys.findIndex(pk => 
          pk.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
        )
      ) ? Buffer.from(tx.transaction.message.compiledInstructions.find(ix => 
        ix.programIdIndex === tx.transaction.message.staticAccountKeys.findIndex(pk => 
          pk.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
        )
      )!.data).toString('utf8') : undefined,
      instructions: tx.transaction.message.compiledInstructions.map(ix => ({
        programId: tx.transaction.message.staticAccountKeys[ix.programIdIndex].toString(),
        accounts: ix.accountKeyIndexes.map(idx => 
          tx.transaction.message.staticAccountKeys[idx].toString()
        ),
        data: Buffer.from(ix.data).toString('base64')
      }))
    };
  }

  async getRecentTransactions(limit: number = 10, address?: string): Promise<SolanaTransaction[]> {
    const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
    const signatures = await this.connection.getSignaturesForAddress(
      pubkey,
      { limit },
      this.commitment
    );

    const transactions = await Promise.all(
      signatures.map(sig => this.getTransaction(sig.signature).catch(() => null))
    );

    return transactions.filter(tx => tx !== null) as SolanaTransaction[];
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.partialSign(this.keypair);
    return transaction;
  }

  async sendTransaction(transaction: Transaction, signers: Signer[] = []): Promise<string> {
    signers.push(this.keypair);
    return await sendAndConfirmTransaction(
      this.connection,
      transaction,
      signers,
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );
  }

  async simulateTransaction(transaction: Transaction): Promise<any> {
    return await this.connection.simulateTransaction(transaction);
  }

  // ========== STAKE OPERATIONS ==========

  async createStakeAccount(amount: number, validator: string): Promise<string> {
    const stakeAccount = Keypair.generate();
    const validatorPubkey = new PublicKey(validator);

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.keypair.publicKey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(StakeProgram.space),
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      })
    );

    transaction.add(
      StakeProgram.initialize({
        stakePubkey: stakeAccount.publicKey,
        authorized: {
          staker: this.keypair.publicKey,
          withdrawer: this.keypair.publicKey,
        },
      })
    );

    transaction.add(
      StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: this.keypair.publicKey,
        votePubkey: validatorPubkey,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair, stakeAccount],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return signature;
  }

  async getStakeAccounts(owner?: string): Promise<SolanaStakeAccount[]> {
    const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
    const stakeAccounts = await this.connection.getParsedProgramAccounts(
      StakeProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 12, // Offset for authorized staker
              bytes: ownerPubkey.toBase58(),
            },
          },
        ],
      }
    );

    const accounts: SolanaStakeAccount[] = [];

    for (const account of stakeAccounts) {
      const parsed = account.account.data as ParsedAccountData;
      if (parsed.program === 'stake' && parsed.parsed.type === 'delegated') {
        const info = parsed.parsed.info;
        accounts.push({
          address: account.pubkey.toString(),
          balance: account.account.lamports / LAMPORTS_PER_SOL,
          stake: parseInt(info.stake.delegation.stake) / LAMPORTS_PER_SOL,
          rewards: 0, // Would need to calculate from epoch info
          activationEpoch: parseInt(info.stake.delegation.activationEpoch),
          deactivationEpoch: parseInt(info.stake.delegation.deactivationEpoch),
          voter: info.stake.delegation.voter,
        });
      }
    }

    return accounts;
  }

  // ========== NETWORK INFORMATION ==========

  async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash(this.commitment);
    return blockhash;
  }

  async getSlot(): Promise<number> {
    return await this.connection.getSlot(this.commitment);
  }

  async getEpochInfo(): Promise<any> {
    return await this.connection.getEpochInfo();
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

  async getInflationReward(addresses: string[], epoch?: number): Promise<any[]> {
    const pubkeys = addresses.map(addr => new PublicKey(addr));
    return await this.connection.getInflationReward(pubkeys, epoch);
  }

  async getLeaderSchedule(epoch?: number): Promise<any> {
    return await this.connection.getLeaderSchedule(epoch);
  }

  async getVoteAccounts(): Promise<SolanaVoteAccount[]> {
    const voteAccounts = await this.connection.getVoteAccounts();
    
    const accounts: SolanaVoteAccount[] = [
      ...voteAccounts.current.map(acc => ({
        address: acc.votePubkey,
        validator: acc.nodePubkey,
        commission: acc.commission,
        votes: acc.activatedStake,
        rootSlot: acc.rootSlot,
        epoch: acc.epochVoteAccount? acc.epochVoteAccount.epoch : 0,
      })),
      ...voteAccounts.delinquent.map(acc => ({
        address: acc.votePubkey,
        validator: acc.nodePubkey,
        commission: acc.commission,
        votes: acc.activatedStake,
        rootSlot: acc.rootSlot,
        epoch: acc.epochVoteAccount? acc.epochVoteAccount.epoch : 0,
      }))
    ];

    return accounts;
  }

  // ========== FEE CALCULATION ==========

  async getFeeForMessage(message: Message): Promise<number> {
    return await this.connection.getFeeForMessage(message);
  }

  async getRecentPrioritizationFees(): Promise<Array<{ slot: number; prioritizationFee: number }>> {
    return await this.connection.getRecentPrioritizationFees();
  }

  async getPriorityFeeEstimate(accountKeys: string[], options?: {
    includeAllPriorityFee?: boolean;
    lookbackSlots?: number;
  }): Promise<number> {
    // This would typically use a custom method or RPC call
    // For now, return a conservative estimate
    const fees = await this.getRecentPrioritizationFees();
    if (fees.length === 0) return 1000; // Default micro-lamport fee
    
    return Math.ceil(fees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / fees.length);
  }

  // ========== COMPUTE BUDGET ==========

  async setComputeUnitPrice(microLamports: number): Promise<TransactionInstruction> {
    return ComputeBudgetProgram.setComputeUnitPrice({ microLamports });
  }

  async setComputeUnitLimit(units: number): Promise<TransactionInstruction> {
    return ComputeBudgetProgram.setComputeUnitLimit({ units });
  }

  // ========== TOKEN 2022 PROGRAM ==========

  async createToken2022(decimals: number = 9, options: {
    mintAuthority?: PublicKey;
    freezeAuthority?: PublicKey;
    extensions?: string[];
  } = {}): Promise<string> {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.keypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        options.mintAuthority || this.keypair.publicKey,
        options.freezeAuthority || this.keypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair, mintKeypair],
      {
        commitment: this.commitment,
        skipPreflight: true
      }
    );

    return mintKeypair.publicKey.toString();
  }

  // ========== BATCH OPERATIONS ==========

  async getMultipleBalances(addresses: string[]): Promise<BalanceResult[]> {
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: (await this.getBalance(address)).toString(),
        chain: 'SOLANA' as Chain,
        symbol: 'SOL'
      }))
    );
    return balances;
  }

  async getMultipleTokenBalances(mint: string, addresses: string[]): Promise<TokenBalance[]> {
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: (await this.getTokenBalance(mint, address)).toString(),
        token: await this.getTokenInfo(mint)
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

  async getAccountInfoBatch(addresses: string[]): Promise<(SolanaAccountInfo | null)[]> {
    const pubkeys = addresses.map(addr => new PublicKey(addr));
    const accounts = await this.connection.getMultipleAccountsInfo(pubkeys);
    
    return accounts.map((account, index) => {
      if (!account) return null;
      
      return {
        address: addresses[index],
        lamports: account.lamports,
        owner: account.owner.toString(),
        executable: account.executable,
        data: account.data,
        rentEpoch: account.rentEpoch
      };
    });
  }

  async getTokenAccountBalance(tokenAccount: string): Promise<number> {
    const pubkey = new PublicKey(tokenAccount);
    const balance = await this.connection.getTokenAccountBalance(pubkey);
    return balance.value.uiAmount || 0;
  }

  async getParsedTokenAccountsByOwner(owner?: string): Promise<any[]> {
    const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
    const accounts = await this.connection.getParsedTokenAccountsByOwner(ownerPubkey, {
      programId: TOKEN_PROGRAM_ID
    });
    
    return accounts.value;
  }

  // ========== TRANSACTION HISTORY ==========

  async getTransactionHistory(limit: number = 10, address?: string): Promise<SolanaTransaction[]> {
    return await this.getRecentTransactions(limit, address);
  }

  async getSignaturesForAddress(address: string, limit: number = 10): Promise<ConfirmedSignatureInfo[]> {
    const pubkey = new PublicKey(address);
    return await this.connection.getSignaturesForAddress(pubkey, { limit }, this.commitment);
  }

  // ========== EVENT SUBSCRIPTION ==========

  onAccountChange(address: string, callback: (accountInfo: AccountInfo<Buffer>) => void): number {
    const pubkey = new PublicKey(address);
    return this.connection.onAccountChange(pubkey, callback, this.commitment);
  }

  onProgramAccountChange(programId: string, callback: (accountInfo: AccountInfo<Buffer>, pubkey: PublicKey) => void): number {
    const pubkey = new PublicKey(programId);
    return this.connection.onProgramAccountChange(pubkey, callback, this.commitment);
  }

  onLogs(callback: (logs: Logs, context: Context) => void): number {
    return this.connection.onLogs(callback, this.commitment);
  }

  onSlotChange(callback: (slotInfo: { slot: number; parent: number }) => void): number {
    return this.connection.onSlotChange(callback);
  }

  removeEventListener(listenerId: number): Promise<void> {
    return this.connection.removeAccountChangeListener(listenerId);
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

  // ========== ERROR HANDLING ==========

  static isSolanaError(error: any): boolean {
    return error && (error.logs || error.signature);
  }

  static getErrorCode(error: any): string {
    if (error.logs) {
      // Try to extract error code from logs
      const errorLog = error.logs.find((log: string) => log.includes('Error:'));
      return errorLog || 'UNKNOWN_SOLANA_ERROR';
    }
    return error.code || 'UNKNOWN_ERROR';
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    return error.message || 'Unknown Solana error occurred';
  }
}

// Utility functions for Solana
export class SolanaUtils {
  static async getTokenMetadata(mint: string, connection: Connection): Promise<SolanaTokenMetadata | null> {
    try {
      const metaplex = Metaplex.make(connection);
      const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) });
      
      return {
        mint: nft.address.toString(),
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
        creators: nft.creators.map(creator => ({
          address: creator.address.toString(),
          verified: creator.verified,
          share: creator.share
        })),
        primarySaleHappened: nft.primarySaleHappened,
        isMutable: nft.isMutable,
        editionNonce: nft.editionNonce,
        tokenStandard: nft.tokenStandard,
        collection: nft.collection ? {
          verified: nft.collection.verified,
          key: nft.collection.address.toString()
        } : undefined,
        uses: nft.uses ? {
          useMethod: nft.uses.useMethod as 'burn' | 'multiple' | 'single',
          remaining: nft.uses.remaining,
          total: nft.uses.total
        } : undefined
      };
    } catch (error) {
      return null;
    }
  }

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
    return sol * LAMPORTS_PER_SOL;
  }

  static formatAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static parseAmount(amount: string, decimals: number): number {
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
  }
}