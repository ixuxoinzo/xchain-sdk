import { Chain } from './chains.js';
import { TransactionResponse, TokenInfo, BalanceResult, BackendConfig, APIResponse } from './types.js';
export declare class BackendSDK {
    private evmSDK;
    private solanaSDK;
    private config;
    constructor(config?: BackendConfig);
    private initializeWallets;
    transferNativeEVM(to: string, amount: string, chain?: Chain): Promise<TransactionResponse>;
    transferTokenEVM(tokenAddress: string, to: string, amount: string, chain?: Chain): Promise<TransactionResponse>;
    getNativeBalanceEVM(address: string, chain?: Chain): Promise<string>;
    getTokenBalanceEVM(tokenAddress: string, address: string, chain?: Chain): Promise<string>;
    getTokenInfoEVM(tokenAddress: string, chain?: Chain): Promise<TokenInfo>;
    transferSOL(to: string, amount: number): Promise<any>;
    transferSPLToken(mint: string, to: string, amount: number): Promise<any>;
    getSOLBalance(address?: string): Promise<number>;
    getTokenBalanceSolana(mint: string, address?: string): Promise<number>;
    getBalancesAllChains(address: string): Promise<BalanceResult[]>;
    createEVMWallet(): Promise<{
        address: string;
        privateKey: string;
    }>;
    createSolanaWallet(): Promise<{
        address: string;
        privateKey: string;
    }>;
    healthCheck(): Promise<{
        evm: boolean;
        solana: boolean;
        details: any;
    }>;
    updateConfig(newConfig: Partial<BackendConfig>): void;
    getConfig(): BackendConfig;
    signMessageEVM(message: string): Promise<string>;
    verifySignatureEVM(message: string, signature: string): Promise<string>;
    getEVMAddress(): string | null;
    getSolanaAddress(): string | null;
    isEVMConfigured(): boolean;
    isSolanaConfigured(): boolean;
    estimateTransferFeeEVM(to: string, amount: string, chain?: Chain): Promise<{
        gasLimit: string;
        gasCost: string;
        totalCost: string;
    }>;
    getTransactionEVM(txHash: string, chain?: Chain): Promise<any>;
    getTransactionSolana(signature: string): Promise<any>;
    deployContractEVM(abi: any[], bytecode: string, args?: any[], value?: string, chain?: Chain): Promise<TransactionResponse>;
    createTokenSolana(decimals?: number): Promise<string>;
    mintTokensSolana(mint: string, to: string, amount: number): Promise<string>;
    bulkTransferEVM(transfers: Array<{
        to: string;
        amount: string;
    }>, chain?: Chain): Promise<TransactionResponse[]>;
    getPastEventsEVM(contractAddress: string, abi: any[], eventName: string, fromBlock?: number, chain?: Chain): Promise<any[]>;
    static handleError(error: any): APIResponse;
    static handleSuccess<T>(data: T): APIResponse<T>;
}
//# sourceMappingURL=backend-sdk.d.ts.map