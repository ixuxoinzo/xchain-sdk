import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { CHAINS } from './chains.js';
export class BackendSDK {
    constructor(config = {}) {
        this.evmSDK = null;
        this.solanaSDK = null;
        this.config = config;
        this.initializeWallets();
    }
    initializeWallets() {
        // Initialize EVM SDK if private key is provided
        if (this.config.evmPrivateKey) {
            this.evmSDK = new EVMSDK(this.config.evmPrivateKey, this.config.defaultChain || 'ETHEREUM', this.config.rpcUrls?.ETHEREUM);
        }
        // Initialize Solana SDK if private key is provided
        if (this.config.solanaPrivateKey) {
            this.solanaSDK = new SolanaSDK(this.config.solanaPrivateKey);
        }
    }
    // ========== EVM OPERATIONS ==========
    async transferNativeEVM(to, amount, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured. Please provide EVM private key.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.transferNative(to, amount);
    }
    async transferTokenEVM(tokenAddress, to, amount, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.transferToken(tokenAddress, to, amount);
    }
    async getNativeBalanceEVM(address, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.getNativeBalance(address);
    }
    async getTokenBalanceEVM(tokenAddress, address, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.getTokenBalance(tokenAddress, address);
    }
    async getTokenInfoEVM(tokenAddress, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.getTokenInfo(tokenAddress);
    }
    // ========== SOLANA OPERATIONS ==========
    async transferSOL(to, amount) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured. Please provide Solana private key.');
        }
        return await this.solanaSDK.transferSOL(to, amount);
    }
    async transferSPLToken(mint, to, amount) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.transferSPLToken(mint, to, amount);
    }
    async getSOLBalance(address) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.getBalance(address);
    }
    async getTokenBalanceSolana(mint, address) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.getTokenBalance(mint, address);
    }
    // ========== BATCH OPERATIONS ==========
    async getBalancesAllChains(address) {
        const results = [];
        // Get EVM balances
        if (this.evmSDK) {
            for (const [chain, config] of Object.entries(CHAINS)) {
                if (config.type === 'EVM') {
                    try {
                        this.evmSDK.switchChain(chain);
                        const balance = await this.evmSDK.getNativeBalance(address);
                        results.push({
                            address,
                            balance,
                            chain: chain,
                            symbol: config.nativeCurrency.symbol
                        });
                    }
                    catch (error) {
                        // Skip chains that fail
                        console.warn(`Failed to get balance for ${chain}:`, error);
                    }
                }
            }
        }
        // Get Solana balance
        if (this.solanaSDK) {
            try {
                const balance = await this.solanaSDK.getBalance(address);
                results.push({
                    address,
                    balance: balance.toString(),
                    chain: 'SOLANA',
                    symbol: 'SOL'
                });
            }
            catch (error) {
                console.warn('Failed to get Solana balance:', error);
            }
        }
        return results;
    }
    // ========== ADMIN OPERATIONS ==========
    async createEVMWallet() {
        const walletInfo = EVMSDK.createRandom();
        return {
            address: walletInfo.address,
            privateKey: walletInfo.privateKey
        };
    }
    async createSolanaWallet() {
        const walletInfo = SolanaSDK.createRandom();
        return {
            address: walletInfo.address,
            privateKey: walletInfo.privateKey
        };
    }
    // ========== HEALTH CHECKS ==========
    async healthCheck() {
        const details = {};
        // Check EVM health
        let evmHealthy = false;
        if (this.evmSDK) {
            try {
                const health = await this.evmSDK.healthCheck();
                evmHealthy = health.healthy;
                details.evm = health;
            }
            catch (error) {
                details.evm = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
        // Check Solana health
        let solanaHealthy = false;
        if (this.solanaSDK) {
            try {
                const health = await this.solanaSDK.healthCheck();
                solanaHealthy = health.healthy;
                details.solana = health;
            }
            catch (error) {
                details.solana = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
        return {
            evm: evmHealthy,
            solana: solanaHealthy,
            details
        };
    }
    // ========== CONFIGURATION ==========
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.initializeWallets(); // Reinitialize with new config
    }
    getConfig() {
        return { ...this.config };
    }
    // ========== SECURITY ==========
    async signMessageEVM(message) {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        return await this.evmSDK.signMessage(message);
    }
    async verifySignatureEVM(message, signature) {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        return await this.evmSDK.verifySignature(message, signature);
    }
    // ========== UTILITY METHODS ==========
    getEVMAddress() {
        return this.evmSDK ? this.evmSDK.getAddress() : null;
    }
    getSolanaAddress() {
        return this.solanaSDK ? this.solanaSDK.getAddress() : null;
    }
    isEVMConfigured() {
        return this.evmSDK !== null;
    }
    isSolanaConfigured() {
        return this.solanaSDK !== null;
    }
    // ========== FEE ESTIMATION ==========
    async estimateTransferFeeEVM(to, amount, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.estimateTransactionCost(to, amount);
    }
    // ========== TRANSACTION HISTORY ==========
    async getTransactionEVM(txHash, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.getTransaction(txHash);
    }
    async getTransactionSolana(signature) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.getTransaction(signature);
    }
    // ========== CONTRACT DEPLOYMENT ==========
    async deployContractEVM(abi, bytecode, args = [], value = '0', chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.deployContract(abi, bytecode, args, value);
    }
    // ========== TOKEN MANAGEMENT ==========
    async createTokenSolana(decimals = 9) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.createToken(decimals);
    }
    async mintTokensSolana(mint, to, amount) {
        if (!this.solanaSDK) {
            throw new Error('Solana wallet not configured.');
        }
        return await this.solanaSDK.mintTokens(mint, to, amount);
    }
    // ========== BULK OPERATIONS ==========
    async bulkTransferEVM(transfers, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.batchTransferNative(transfers);
    }
    // ========== EVENT LISTENING ==========
    async getPastEventsEVM(contractAddress, abi, eventName, fromBlock = 0, chain = 'ETHEREUM') {
        if (!this.evmSDK) {
            throw new Error('EVM wallet not configured.');
        }
        this.evmSDK.switchChain(chain);
        return await this.evmSDK.getPastEvents(contractAddress, abi, eventName, fromBlock);
    }
    // ========== ERROR HANDLING ==========
    static handleError(error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: Date.now()
        };
    }
    static handleSuccess(data) {
        return {
            success: true,
            data,
            timestamp: Date.now()
        };
    }
}
//# sourceMappingURL=backend-sdk.js.map