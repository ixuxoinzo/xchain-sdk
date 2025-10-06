import { Wallet, JsonRpcProvider, TransactionReceipt, BigNumberish, TransactionRequest, Block, HDNodeWallet } from 'ethers';
import { Chain } from './chains.js';
import { TransactionResponse, TokenInfo, NFTInfo, EventFilter, WalletInfo, BalanceResult, TokenBalance, EVMTransaction, EVMEventLog, GasPriceData, FeeData as FeeDataInterface, MulticallRequest, MulticallResponse, SwapQuote, PoolInfo, SecurityScanResult } from './types';
declare const ERC20_ABI: string[];
declare const ERC721_ABI: string[];
declare const ERC1155_ABI: string[];
declare const UNISWAP_V2_ROUTER_ABI: string[];
declare const UNISWAP_V3_ROUTER_ABI: string[];
declare const MULTICALL_ABI: string[];
declare const CONTRACT_ADDRESSES: {
    MULTICALL: {
        1: string;
        137: string;
        42161: string;
        10: string;
        8453: string;
        56: string;
        43114: string;
        250: string;
        100: string;
        1101: string;
        324: string;
    };
    UNISWAP_V2_ROUTER: {
        1: string;
        137: string;
        42161: string;
        10: string;
        8453: string;
        56: string;
        43114: string;
        250: string;
        100: string;
    };
    UNISWAP_V3_ROUTER: {
        1: string;
        137: string;
        42161: string;
        10: string;
        8453: string;
        56: string;
        43114: string;
    };
};
export declare class EVMSDK {
    wallet: Wallet | HDNodeWallet;
    currentChain: Chain;
    private provider;
    private multicallAddress;
    private uniswapV2Router;
    private uniswapV3Router;
    constructor(privateKey: string, chain?: Chain, customRpcUrl?: string, path?: string);
    switchChain(chain: Chain, customRpcUrl?: string): void;
    getCurrentChain(): Chain;
    getProvider(): JsonRpcProvider;
    getNetworkInfo(): {
        chain: "METIS" | "SOLANA" | "ETHEREUM" | "OPTIMISM" | "ARBITRUM" | "BASE" | "POLYGON" | "POLYGON_ZKEVM" | "ZKSYNC" | "LINEA" | "SCROLL" | "MANTLE" | "BLAST";
        chainId: 1 | 10 | 42161 | 8453 | 137 | 1101 | 324 | 59144 | 534352 | 5000 | 1088 | 81457 | 101;
        name: "Ethereum" | "Optimism" | "Arbitrum One" | "Base" | "Polygon POS" | "Polygon zkEVM" | "zkSync Era" | "Linea" | "Scroll" | "Mantle" | "Metis" | "Blast" | "Solana";
        rpcUrl: string;
        explorer: "https://etherscan.io" | "https://optimistic.etherscan.io" | "https://arbiscan.io" | "https://basescan.org" | "https://polygonscan.com" | "https://zkevm.polygonscan.com" | "https://explorer.zksync.io" | "https://lineascan.build" | "https://scrollscan.com" | "https://mantlescan.info" | "https://andromeda-explorer.metis.io" | "https://blastscan.io" | "https://explorer.solana.com";
        nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "MATIC";
            readonly symbol: "MATIC";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Mantle";
            readonly symbol: "MNT";
            readonly decimals: 18;
        } | {
            readonly name: "Metis";
            readonly symbol: "METIS";
            readonly decimals: 18;
        } | {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        } | {
            readonly name: "Solana";
            readonly symbol: "SOL";
            readonly decimals: 9;
        };
    };
    static createRandom(): WalletInfo;
    static fromMnemonic(mnemonic: string, path?: string): WalletInfo;
    static fromEncryptedJson(json: string, password: string): Promise<WalletInfo>;
    getAddress(): string;
    getPublicKey(): Promise<string>;
    getTransactionCount(): Promise<number>;
    getNextNonce(): Promise<number>;
    signMessage(message: string): Promise<string>;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    verifySignature(message: string, signature: string): Promise<string>;
    transferNative(to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getNativeBalance(address?: string): Promise<string>;
    getNativeBalanceWei(address?: string): Promise<bigint>;
    transferToken(tokenAddress: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getTokenBalance(tokenAddress: string, address?: string): Promise<string>;
    getTokenBalanceWei(tokenAddress: string, address?: string): Promise<bigint>;
    getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
    approveToken(tokenAddress: string, spender: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string>;
    transferFromToken(tokenAddress: string, from: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    mintNFT(contractAddress: string, to: string, tokenUri: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    transferNFT(contractAddress: string, to: string, tokenId: number, overrides?: TransactionRequest): Promise<TransactionResponse>;
    safeTransferNFT(contractAddress: string, to: string, tokenId: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getNFTBalance(contractAddress: string, address?: string): Promise<number>;
    getNFTOwner(contractAddress: string, tokenId: number): Promise<string>;
    getNFTUri(contractAddress: string, tokenId: number): Promise<string>;
    getNFTInfo(contractAddress: string, tokenId: number): Promise<NFTInfo>;
    setNFTApproval(contractAddress: string, operator: string, approved?: boolean, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getNFTApproval(contractAddress: string, tokenId: number): Promise<string>;
    isNFTApprovedForAll(contractAddress: string, owner: string, operator: string): Promise<boolean>;
    mintERC1155(contractAddress: string, to: string, tokenId: number, amount: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    mintBatchERC1155(contractAddress: string, to: string, tokenIds: number[], amounts: number[], data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getERC1155Balance(contractAddress: string, tokenId: number, address?: string): Promise<number>;
    getERC1155BalanceBatch(contractAddress: string, tokenIds: number[], addresses: string[]): Promise<number[]>;
    transferERC1155(contractAddress: string, to: string, tokenId: number, amount: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    batchTransferERC1155(contractAddress: string, to: string, tokenIds: number[], amounts: number[], data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getERC1155Uri(contractAddress: string, tokenId: number): Promise<string>;
    readContract(contractAddress: string, abi: any[], functionName: string, args?: any[]): Promise<any>;
    writeContract(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    deployContract(abi: any[], bytecode: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getContractCode(contractAddress: string): Promise<string>;
    getContractStorage(contractAddress: string, slot: string): Promise<string>;
    getPastEvents(contractAddress: string, abi: any[], eventName: string, fromBlock?: number, toBlock?: number | string): Promise<EVMEventLog[]>;
    listenEvents(contractAddress: string, abi: any[], eventName: string, callback: (event: EVMEventLog) => void): Promise<() => void>;
    getLogs(filter: EventFilter): Promise<EVMEventLog[]>;
    getGasPrice(): Promise<string>;
    getFeeData(): Promise<FeeDataInterface>;
    getGasPriceTiers(): Promise<GasPriceData>;
    estimateGas(to: string, value?: string, data?: string): Promise<string>;
    estimateContractGas(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string): Promise<string>;
    estimateTransactionCost(to: string, value?: string, data?: string): Promise<{
        gasLimit: string;
        gasCost: string;
        totalCost: string;
    }>;
    getBlockNumber(): Promise<number>;
    getBlock(blockNumber: number | string): Promise<Block | null>;
    getTransaction(txHash: string): Promise<EVMTransaction | null>;
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>;
    getCode(address: string): Promise<string>;
    getStorageAt(address: string, position: BigNumberish): Promise<string>;
    getChainId(): Promise<number>;
    resolveENS(ensName: string): Promise<string>;
    lookupAddress(address: string): Promise<string>;
    getAvatar(ensName: string): Promise<string>;
    getResolver(ensName: string): Promise<string>;
    multicall(calls: MulticallRequest[]): Promise<MulticallResponse[]>;
    tryMulticall(calls: MulticallRequest[]): Promise<MulticallResponse[]>;
    getLatestPrice(priceFeedAddress: string): Promise<string>;
    getSwapQuote(fromToken: string, toToken: string, amount: string, slippage?: number): Promise<SwapQuote>;
    swapTokens(fromToken: string, toToken: string, amount: string, slippage?: number, overrides?: TransactionRequest): Promise<TransactionResponse>;
    getPoolInfo(poolAddress: string): Promise<PoolInfo>;
    getMultipleBalances(addresses: string[]): Promise<BalanceResult[]>;
    getMultipleTokenBalances(tokenAddress: string, addresses: string[]): Promise<TokenBalance[]>;
    batchTransferNative(transfers: {
        to: string;
        amount: string;
    }[], overrides?: TransactionRequest): Promise<TransactionResponse[]>;
    private getTokenDecimals;
    waitForTransaction(txHash: string, confirmations?: number): Promise<TransactionReceipt | null>;
    getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'>;
    isContract(address: string): Promise<boolean>;
    getCreate2Address(deployer: string, salt: string, bytecodeHash: string): Promise<string>;
    getCreateAddress(deployer: string, nonce: number): Promise<string>;
    signTypedData(domain: any, types: any, value: any): Promise<string>;
    getTypedDataHash(domain: any, types: any, value: any): Promise<string>;
    getTransactionByHash(txHash: string): Promise<any>;
    getBlockWithTransactions(blockNumber: number | string): Promise<any>;
    getLogsByAddress(address: string, fromBlock?: number, toBlock?: number | string): Promise<EVMEventLog[]>;
    scanContractSecurity(contractAddress: string): Promise<SecurityScanResult>;
    optimizeGas(transaction: TransactionRequest): Promise<TransactionRequest>;
    onBlock(callback: (blockNumber: number) => void): () => void;
    onPendingTransaction(callback: (txHash: string) => void): () => void;
    static isProviderError(error: any): boolean;
    static getErrorCode(error: any): string;
    static getErrorMessage(error: any): string;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        blockNumber: number;
    }>;
    verifyContract(contractAddress: string, sourceCode: string, constructorArgs?: string): Promise<boolean>;
    speedUpTransaction(txHash: string, newGasPrice: string): Promise<TransactionResponse>;
    cancelTransaction(txHash: string, newGasPrice: string): Promise<TransactionResponse>;
}
export { ERC20_ABI, ERC721_ABI, ERC1155_ABI, UNISWAP_V2_ROUTER_ABI, UNISWAP_V3_ROUTER_ABI, MULTICALL_ABI, CONTRACT_ADDRESSES };
//# sourceMappingURL=evm.d.ts.map