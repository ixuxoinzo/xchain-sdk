import { FrontendSDK } from './frontend-sdk.js';
import { BackendSDK } from './backend-sdk.js';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { Chain } from './chains.js';
import { TransactionResponse, WalletConnection, BalanceResult, BackendConfig, FrontendConfig } from './types.js';
export declare class HybridSDK {
    frontend: FrontendSDK;
    backend: BackendSDK | null;
    private useBackend;
    constructor(backendConfig?: BackendConfig, frontendConfig?: FrontendConfig);
    connectEVM(): Promise<WalletConnection>;
    connectSolana(): Promise<WalletConnection>;
    disconnect(): Promise<void>;
    transferNative(to: string, amount: string, chain?: Chain): Promise<TransactionResponse>;
    transferToken(tokenAddress: string, to: string, amount: string, chain?: Chain): Promise<TransactionResponse>;
    transferSOL(to: string, amount: number): Promise<any>;
    getNativeBalance(address?: string, chain?: Chain): Promise<string>;
    getTokenBalance(tokenAddress: string, address?: string, chain?: Chain): Promise<string>;
    getSOLBalance(address?: string): Promise<number>;
    getBalancesAllChains(address: string): Promise<BalanceResult[]>;
    getCurrentAddress(): Promise<string>;
    getCurrentChain(): Chain;
    isConnected(): boolean;
    enableBackend(backendConfig: BackendConfig): void;
    disableBackend(): void;
    isBackendEnabled(): boolean;
    healthCheck(): Promise<{
        frontend: boolean;
        backend: boolean;
        details: any;
    }>;
    static createEVMSDK(privateKey: string, chain?: Chain): EVMSDK;
    static createSolanaSDK(privateKey: string): SolanaSDK;
    getSupportedChains(): Chain[];
    static isNetworkError(error: any): boolean;
    static isUserRejected(error: any): boolean;
    static getErrorMessage(error: any): string;
}
export default HybridSDK;
//# sourceMappingURL=hybrid-sdk.d.ts.map