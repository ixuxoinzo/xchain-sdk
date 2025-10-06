import { Chain } from './chains.js';
import { TransactionResponse, WalletConnection, TokenInfo } from './types';
declare global {
    interface Window {
        ethereum?: any;
        solana?: any;
        phantom?: any;
        backpack?: any;
    }
}
export interface FrontendConfig {
    autoConnect?: boolean;
    defaultChain?: Chain;
    supportedChains?: Chain[];
    theme?: 'light' | 'dark';
}
export declare class FrontendSDK {
    private evmProvider;
    private evmSigner;
    private solanaProvider;
    private currentChain;
    private supportedChains;
    private isConnected;
    constructor(config?: FrontendConfig);
    connectEVM(): Promise<WalletConnection>;
    disconnectEVM(): Promise<void>;
    connectSolana(): Promise<WalletConnection>;
    disconnectSolana(): Promise<void>;
    transferNativeEVM(to: string, amount: string): Promise<TransactionResponse>;
    transferTokenEVM(tokenAddress: string, to: string, amount: string): Promise<TransactionResponse>;
    approveTokenEVM(tokenAddress: string, spender: string, amount: string): Promise<TransactionResponse>;
    getNativeBalanceEVM(address?: string): Promise<string>;
    getTokenBalanceEVM(tokenAddress: string, address?: string): Promise<string>;
    getTokenInfoEVM(tokenAddress: string): Promise<TokenInfo>;
    switchEVMChain(chain: Chain): Promise<void>;
    private addEVMChain;
    signMessageEVM(message: string): Promise<string>;
    signMessageSolana(message: string): Promise<string>;
    signTypedDataEVM(domain: any, types: any, value: any): Promise<string>;
    getEVMAddress(): Promise<string>;
    getSolanaAddress(): Promise<string>;
    getCurrentChain(): Chain;
    isWalletConnected(): boolean;
    getSupportedChains(): Chain[];
    onAccountsChanged(callback: (accounts: string[]) => void): void;
    onChainChanged(callback: (chainId: string) => void): void;
    onSolanaAccountChanged(callback: (publicKey: any) => void): void;
    onSolanaDisconnect(callback: () => void): void;
    private getChainFromId;
    getNetworkInfo(): Promise<any>;
    getTransactionCountEVM(): Promise<number>;
    readContractEVM(contractAddress: string, abi: any[], functionName: string, args?: any[]): Promise<any>;
    writeContractEVM(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string): Promise<TransactionResponse>;
    estimateGasEVM(to: string, value?: string, data?: string): Promise<string>;
    getGasPriceEVM(): Promise<string>;
    private autoConnect;
    getMultipleBalancesEVM(addresses: string[]): Promise<{
        address: string;
        balance: string;
    }[]>;
    disconnectAll(): Promise<void>;
    static detectEVMWallets(): string[];
    static detectSolanaWallets(): string[];
}
//# sourceMappingURL=frontend-sdk.d.ts.map