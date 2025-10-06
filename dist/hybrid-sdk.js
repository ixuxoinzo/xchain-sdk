import { FrontendSDK } from './frontend-sdk.js';
import { BackendSDK } from './backend-sdk.js';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
export class HybridSDK {
    constructor(backendConfig, frontendConfig) {
        this.backend = null;
        this.useBackend = false;
        this.frontend = new FrontendSDK(frontendConfig);
        if (backendConfig && (backendConfig.evmPrivateKey || backendConfig.solanaPrivateKey)) {
            this.backend = new BackendSDK(backendConfig);
            this.useBackend = true;
        }
    }
    // ========== WALLET CONNECTION ==========
    async connectEVM() {
        return await this.frontend.connectEVM();
    }
    async connectSolana() {
        return await this.frontend.connectSolana();
    }
    async disconnect() {
        await this.frontend.disconnectAll();
    }
    // ========== TRANSFER OPERATIONS ==========
    async transferNative(to, amount, chain = 'ETHEREUM') {
        if (this.useBackend && this.backend) {
            // Use backend for transfers (more secure)
            return await this.backend.transferNativeEVM(to, amount, chain);
        }
        else {
            // Use frontend (user signs transaction)
            return await this.frontend.transferNativeEVM(to, amount);
        }
    }
    async transferToken(tokenAddress, to, amount, chain = 'ETHEREUM') {
        if (this.useBackend && this.backend) {
            return await this.backend.transferTokenEVM(tokenAddress, to, amount, chain);
        }
        else {
            return await this.frontend.transferTokenEVM(tokenAddress, to, amount);
        }
    }
    async transferSOL(to, amount) {
        if (this.useBackend && this.backend) {
            return await this.backend.transferSOL(to, amount);
        }
        else {
            throw new Error('Solana transfers require backend configuration for security.');
        }
    }
    // ========== BALANCE OPERATIONS ==========
    async getNativeBalance(address, chain = 'ETHEREUM') {
        if (this.useBackend && this.backend) {
            return await this.backend.getNativeBalanceEVM(address || await this.getCurrentAddress(), chain);
        }
        else {
            return await this.frontend.getNativeBalanceEVM(address);
        }
    }
    async getTokenBalance(tokenAddress, address, chain = 'ETHEREUM') {
        if (this.useBackend && this.backend) {
            return await this.backend.getTokenBalanceEVM(tokenAddress, address || await this.getCurrentAddress(), chain);
        }
        else {
            return await this.frontend.getTokenBalanceEVM(tokenAddress, address);
        }
    }
    async getSOLBalance(address) {
        if (this.useBackend && this.backend) {
            return await this.backend.getSOLBalance(address);
        }
        else {
            throw new Error('Solana balance checks require backend configuration.');
        }
    }
    // ========== BATCH OPERATIONS ==========
    async getBalancesAllChains(address) {
        if (this.useBackend && this.backend) {
            return await this.backend.getBalancesAllChains(address);
        }
        else {
            // Fallback to frontend-only implementation
            const results = [];
            // This would need to be implemented for frontend
            // For now, return empty array
            return results;
        }
    }
    // ========== WALLET INFO ==========
    async getCurrentAddress() {
        if (this.useBackend && this.backend?.getEVMAddress()) {
            return this.backend.getEVMAddress();
        }
        else {
            return await this.frontend.getEVMAddress();
        }
    }
    getCurrentChain() {
        return this.frontend.getCurrentChain();
    }
    isConnected() {
        return this.frontend.isWalletConnected();
    }
    // ========== CONFIGURATION ==========
    enableBackend(backendConfig) {
        this.backend = new BackendSDK(backendConfig);
        this.useBackend = true;
    }
    disableBackend() {
        this.backend = null;
        this.useBackend = false;
    }
    isBackendEnabled() {
        return this.useBackend;
    }
    // ========== HEALTH CHECKS ==========
    async healthCheck() {
        const details = {};
        let frontendHealthy = true;
        let backendHealthy = false;
        // Check frontend health
        try {
            details.frontend = {
                connected: this.frontend.isWalletConnected(),
                currentChain: this.frontend.getCurrentChain()
            };
        }
        catch (error) {
            frontendHealthy = false;
            details.frontend = { error: error instanceof Error ? error.message : 'Unknown error' };
        }
        // Check backend health
        if (this.useBackend && this.backend) {
            try {
                const backendHealth = await this.backend.healthCheck();
                backendHealthy = backendHealth.evm || backendHealth.solana;
                details.backend = backendHealth;
            }
            catch (error) {
                details.backend = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
        return {
            frontend: frontendHealthy,
            backend: backendHealthy,
            details
        };
    }
    // ========== UTILITY METHODS ==========
    static createEVMSDK(privateKey, chain = 'ETHEREUM') {
        return new EVMSDK(privateKey, chain);
    }
    static createSolanaSDK(privateKey) {
        return new SolanaSDK(privateKey);
    }
    getSupportedChains() {
        return this.frontend.getSupportedChains();
    }
    // ========== ERROR HANDLING ==========
    static isNetworkError(error) {
        return error?.code === 'NETWORK_ERROR' || error?.message?.includes('network');
    }
    static isUserRejected(error) {
        return error?.code === 4001 || error?.message?.includes('rejected');
    }
    static getErrorMessage(error) {
        if (typeof error === 'string')
            return error;
        return error?.message || 'Unknown error occurred';
    }
}
// Default export for convenience
export default HybridSDK;
//# sourceMappingURL=hybrid-sdk.js.map