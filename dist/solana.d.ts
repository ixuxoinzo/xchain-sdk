import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, Message, ConfirmedSignatureInfo, Context, Logs, MemcmpFilter, DataSizeFilter, AccountInfo, Commitment, Signer } from '@solana/web3.js';
import { TokenInfo, NFTInfo, WalletInfo, SolanaAccountInfo, SolanaTokenAccount, SolanaTransaction, SolanaTokenMetadata, BalanceResult, TokenBalance } from './types';
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
export declare class SolanaSDK {
    private connection;
    private keypair;
    private metaplex;
    private commitment;
    constructor(privateKey: Uint8Array | string | {
        mnemonic: string;
        path?: string;
    }, customRpcUrl?: string, commitment?: Commitment);
    private deriveSeedFromMnemonic;
    private initializeMetaplex;
    static createRandom(): WalletInfo;
    static fromMnemonic(mnemonic: string, path?: string): WalletInfo;
    getAddress(): string;
    getPublicKey(): PublicKey;
    getKeypair(): Keypair;
    getBalance(address?: string): Promise<number>;
    getBalanceLamports(address?: string): Promise<number>;
    transferSOL(to: string, amount: number, options?: {
        memo?: string;
        computeUnitPrice?: number;
        computeUnitLimit?: number;
    }): Promise<SolanaTransferResponse>;
    transferSOLToMultiple(recipients: Array<{
        to: string;
        amount: number;
    }>, options?: {
        computeUnitPrice?: number;
        computeUnitLimit?: number;
    }): Promise<SolanaTransferResponse[]>;
    airdrop(amount?: number, address?: string): Promise<string>;
    transferSPLToken(mint: string, to: string, amount: number, options?: {
        decimals?: number;
        computeUnitPrice?: number;
        computeUnitLimit?: number;
    }): Promise<SolanaTokenTransferResponse>;
    getTokenBalance(mint: string, address?: string): Promise<number>;
    getTokenBalanceLamports(mint: string, address?: string): Promise<bigint>;
    getTokenInfo(mint: string): Promise<TokenInfo>;
    createToken(decimals?: number, options?: {
        mintAuthority?: PublicKey;
        freezeAuthority?: PublicKey;
        computeUnitPrice?: number;
    }): Promise<string>;
    mintTokens(mint: string, to: string, amount: number, options?: {
        computeUnitPrice?: number;
    }): Promise<string>;
    burnTokens(mint: string, amount: number, options?: {
        computeUnitPrice?: number;
    }): Promise<string>;
    approveToken(mint: string, delegate: string, amount: number, options?: {
        computeUnitPrice?: number;
    }): Promise<string>;
    revokeTokenApproval(mint: string, delegate: string): Promise<string>;
    createNFT(metadata: {
        name: string;
        symbol: string;
        description: string;
        image: string | File;
        attributes?: Array<{
            trait_type: string;
            value: string;
        }>;
        external_url?: string;
        seller_fee_basis_points?: number;
    }, options?: {
        computeUnitPrice?: number;
        creators?: Array<{
            address: PublicKey;
            share: number;
        }>;
        isMutable?: boolean;
        collection?: PublicKey;
    }): Promise<SolanaNFTMintResponse>;
    private fileToBuffer;
    transferNFT(mint: string, to: string): Promise<SolanaTokenTransferResponse>;
    getNFTsByOwner(owner?: string): Promise<NFTInfo[]>;
    getNFTMetadata(mint: string): Promise<SolanaTokenMetadata>;
    updateNFTMetadata(mint: string, updates: {
        name?: string;
        symbol?: string;
        uri?: string;
        sellersFeeBasisPoints?: number;
        creators?: Array<{
            address: PublicKey;
            share: number;
        }>;
        isMutable?: boolean;
    }): Promise<string>;
    getAccountInfo(address: string): Promise<SolanaAccountInfo>;
    getTokenAccounts(address?: string): Promise<SolanaTokenAccount[]>;
    getProgramAccounts(programId: string, filters?: (DataSizeFilter | MemcmpFilter)[]): Promise<any[]>;
    createAssociatedTokenAccount(mint: string, owner?: string): Promise<string>;
    closeTokenAccount(mint: string, address?: string): Promise<string>;
    getTransaction(signature: string): Promise<SolanaTransaction>;
    getRecentTransactions(limit?: number, address?: string): Promise<SolanaTransaction[]>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    sendTransaction(transaction: Transaction, signers?: Signer[]): Promise<string>;
    simulateTransaction(transaction: Transaction): Promise<any>;
    createStakeAccount(amount: number, validator: string): Promise<string>;
    getStakeAccounts(owner?: string): Promise<SolanaStakeAccount[]>;
    getRecentBlockhash(): Promise<string>;
    getSlot(): Promise<number>;
    getEpochInfo(): Promise<any>;
    getVersion(): Promise<any>;
    getGenesisHash(): Promise<string>;
    getSupply(): Promise<any>;
    getInflationReward(addresses: string[], epoch?: number): Promise<any[]>;
    getLeaderSchedule(epoch?: number): Promise<any>;
    getVoteAccounts(): Promise<SolanaVoteAccount[]>;
    getFeeForMessage(message: Message): Promise<number | null>;
    getRecentPrioritizationFees(): Promise<Array<{
        slot: number;
        prioritizationFee: number;
    }>>;
    getPriorityFeeEstimate(accountKeys: string[], options?: {
        includeAllPriorityFee?: boolean;
        lookbackSlots?: number;
    }): Promise<number>;
    setComputeUnitPrice(microLamports: number): Promise<TransactionInstruction>;
    setComputeUnitLimit(units: number): Promise<TransactionInstruction>;
    createToken2022(decimals?: number, options?: {
        mintAuthority?: PublicKey;
        freezeAuthority?: PublicKey;
        extensions?: string[];
    }): Promise<string>;
    getMultipleBalances(addresses: string[]): Promise<BalanceResult[]>;
    getMultipleTokenBalances(mint: string, addresses: string[]): Promise<TokenBalance[]>;
    isValidAddress(address: string): boolean;
    getMinimumBalanceForRentExemption(size: number): Promise<number>;
    getAccountInfoBatch(addresses: string[]): Promise<(SolanaAccountInfo | null)[]>;
    getTokenAccountBalance(tokenAccount: string): Promise<number>;
    getParsedTokenAccountsByOwner(owner?: string): Promise<any[]>;
    getTransactionHistory(limit?: number, address?: string): Promise<SolanaTransaction[]>;
    getSignaturesForAddress(address: string, limit?: number): Promise<ConfirmedSignatureInfo[]>;
    onAccountChange(address: string, callback: (accountInfo: AccountInfo<Buffer>) => void): number;
    onProgramAccountChange(programId: string, callback: (accountInfo: AccountInfo<Buffer>, pubkey: PublicKey) => void): number;
    onLogs(callback: (logs: Logs, context: Context) => void): number;
    onSlotChange(callback: (slotInfo: {
        slot: number;
        parent: number;
    }) => void): number;
    removeEventListener(listenerId: number): Promise<void>;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        slot: number;
    }>;
    static isSolanaError(error: any): boolean;
    static getErrorCode(error: any): string;
    static getErrorMessage(error: any): string;
}
export declare class SolanaUtils {
    static getTokenMetadata(mint: string, connection: Connection): Promise<SolanaTokenMetadata | null>;
    static validateAddress(address: string): boolean;
    static shortAddress(address: string, chars?: number): string;
    static lamportsToSol(lamports: number): number;
    static solToLamports(sol: number): number;
    static formatAmount(amount: number, decimals: number): string;
    static parseAmount(amount: string, decimals: number): number;
}
//# sourceMappingURL=solana.d.ts.map