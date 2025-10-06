import { ethers, BrowserProvider, Contract } from 'ethers';
import { CHAINS } from './chains.js';
export class FrontendSDK {
    constructor(config = {}) {
        this.evmProvider = null;
        this.evmSigner = null;
        this.solanaProvider = null;
        this.isConnected = false;
        this.currentChain = config.defaultChain || 'ETHEREUM';
        this.supportedChains = config.supportedChains || Object.keys(CHAINS);
        if (config.autoConnect) {
            this.autoConnect();
        }
    }
    // ========== EVM WALLET CONNECTION ==========
    async connectEVM() {
        if (!window.ethereum) {
            throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
        }
        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            this.evmProvider = new BrowserProvider(window.ethereum);
            this.evmSigner = await this.evmProvider.getSigner();
            // Get current chain
            const network = await this.evmProvider.getNetwork();
            this.currentChain = this.getChainFromId(Number(network.chainId));
            this.isConnected = true;
            return {
                address: accounts[0],
                chain: this.currentChain,
                connected: true
            };
        }
        catch (error) {
            throw new Error(`EVM connection failed: ${error.message}`);
        }
    }
    async disconnectEVM() {
        // Note: Most EVM wallets don't have a disconnect method in the provider
        // This is more about cleaning up our local state
        if (window.ethereum && window.ethereum.close) {
            await window.ethereum.close();
        }
        this.evmProvider = null;
        this.evmSigner = null;
        this.isConnected = false;
    }
    // ========== SOLANA WALLET CONNECTION ==========
    async connectSolana() {
        if (!window.solana && !window.phantom && !window.backpack) {
            throw new Error('No Solana wallet found. Please install Phantom, Backpack, or another Solana wallet.');
        }
        try {
            const provider = window.solana || window.phantom || window.backpack;
            if (!provider.isConnected) {
                await provider.connect();
            }
            this.solanaProvider = provider;
            this.currentChain = 'SOLANA';
            this.isConnected = true;
            return {
                address: provider.publicKey.toString(),
                chain: 'SOLANA',
                connected: true
            };
        }
        catch (error) {
            throw new Error(`Solana connection failed: ${error.message}`);
        }
    }
    async disconnectSolana() {
        if (this.solanaProvider) {
            await this.solanaProvider.disconnect();
            this.solanaProvider = null;
            this.isConnected = false;
        }
    }
    // ========== EVM TRANSACTIONS ==========
    async transferNativeEVM(to, amount) {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected. Please connect your wallet first.');
        }
        try {
            const tx = await this.evmSigner.sendTransaction({
                to,
                value: ethers.parseEther(amount)
            });
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: await this.evmSigner.getAddress(),
                to,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed',
                gasUsed: receipt?.gasUsed.toString(),
                blockNumber: receipt?.blockNumber
            };
        }
        catch (error) {
            throw new Error(`Native transfer failed: ${error.message}`);
        }
    }
    async transferTokenEVM(tokenAddress, to, amount) {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        const erc20Abi = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
        try {
            const contract = new Contract(tokenAddress, erc20Abi, this.evmSigner);
            const decimals = await contract.decimals();
            const symbol = await contract.symbol();
            const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: await this.evmSigner.getAddress(),
                to,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`Token transfer failed: ${error.message}`);
        }
    }
    async approveTokenEVM(tokenAddress, spender, amount) {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        const erc20Abi = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)"
        ];
        try {
            const contract = new Contract(tokenAddress, erc20Abi, this.evmSigner);
            const decimals = await contract.decimals();
            const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals));
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: await this.evmSigner.getAddress(),
                to: spender,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`Token approval failed: ${error.message}`);
        }
    }
    // ========== READ-ONLY EVM OPERATIONS ==========
    async getNativeBalanceEVM(address) {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const balance = await this.evmProvider.getBalance(address || await this.getEVMAddress());
        return ethers.formatEther(balance);
    }
    async getTokenBalanceEVM(tokenAddress, address) {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const erc20Abi = [
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];
        const contract = new Contract(tokenAddress, erc20Abi, this.evmProvider);
        const [balance, decimals] = await Promise.all([
            contract.balanceOf(address || await this.getEVMAddress()),
            contract.decimals()
        ]);
        return ethers.formatUnits(balance, decimals);
    }
    async getTokenInfoEVM(tokenAddress) {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const erc20Abi = [
            "function symbol() view returns (string)",
            "function name() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)"
        ];
        const contract = new Contract(tokenAddress, erc20Abi, this.evmProvider);
        const [symbol, name, decimals, totalSupply] = await Promise.all([
            contract.symbol().catch(() => 'UNKNOWN'),
            contract.name().catch(() => 'Unknown Token'),
            contract.decimals().catch(() => 18),
            contract.totalSupply().catch(() => 0)
        ]);
        const balance = await this.getTokenBalanceEVM(tokenAddress);
        return {
            address: tokenAddress,
            symbol,
            name,
            decimals,
            totalSupply: ethers.formatUnits(totalSupply, decimals),
            balance
        };
    }
    // ========== NETWORK MANAGEMENT ==========
    async switchEVMChain(chain) {
        if (!window.ethereum) {
            throw new Error('No Ethereum wallet found.');
        }
        const chainId = CHAINS[chain].id;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
            this.currentChain = chain;
        }
        catch (error) {
            if (error.code === 4902) {
                await this.addEVMChain(chain);
                this.currentChain = chain;
            }
            else {
                throw error;
            }
        }
    }
    async addEVMChain(chain) {
        if (!window.ethereum) {
            throw new Error('No Ethereum wallet found.');
        }
        const chainConfig = CHAINS[chain];
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                    chainId: `0x${chainConfig.id.toString(16)}`,
                    chainName: chainConfig.name,
                    rpcUrls: [chainConfig.rpc],
                    nativeCurrency: chainConfig.nativeCurrency,
                    blockExplorerUrls: [chainConfig.explorer]
                }],
        });
    }
    // ========== SIGNING & MESSAGES ==========
    async signMessageEVM(message) {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        return await this.evmSigner.signMessage(message);
    }
    async signMessageSolana(message) {
        if (!this.solanaProvider) {
            throw new Error('Solana wallet not connected.');
        }
        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await this.solanaProvider.signMessage(encodedMessage, 'utf8');
        return Buffer.from(signature).toString('hex');
    }
    async signTypedDataEVM(domain, types, value) {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        return await this.evmSigner.signTypedData(domain, types, value);
    }
    // ========== WALLET INFO ==========
    async getEVMAddress() {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        return await this.evmSigner.getAddress();
    }
    async getSolanaAddress() {
        if (!this.solanaProvider) {
            throw new Error('Solana wallet not connected.');
        }
        return this.solanaProvider.publicKey.toString();
    }
    getCurrentChain() {
        return this.currentChain;
    }
    isWalletConnected() {
        return this.isConnected;
    }
    getSupportedChains() {
        return this.supportedChains;
    }
    // ========== EVENT LISTENERS ==========
    onAccountsChanged(callback) {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', callback);
        }
    }
    onChainChanged(callback) {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', callback);
        }
    }
    onSolanaAccountChanged(callback) {
        if (this.solanaProvider) {
            this.solanaProvider.on('accountChanged', callback);
        }
    }
    onSolanaDisconnect(callback) {
        if (this.solanaProvider) {
            this.solanaProvider.on('disconnect', callback);
        }
    }
    // ========== UTILITY FUNCTIONS ==========
    getChainFromId(chainId) {
        for (const [chain, config] of Object.entries(CHAINS)) {
            if (config.type === 'EVM' && config.id === chainId) {
                return chain;
            }
        }
        return 'ETHEREUM';
    }
    async getNetworkInfo() {
        if (this.evmProvider) {
            return await this.evmProvider.getNetwork();
        }
        return null;
    }
    async getTransactionCountEVM() {
        if (!this.evmProvider || !this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        return await this.evmProvider.getTransactionCount(await this.getEVMAddress());
    }
    // ========== CONTRACT INTERACTION ==========
    async readContractEVM(contractAddress, abi, functionName, args = []) {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const contract = new Contract(contractAddress, abi, this.evmProvider);
        return await contract[functionName](...args);
    }
    async writeContractEVM(contractAddress, abi, functionName, args = [], value = '0') {
        if (!this.evmSigner) {
            throw new Error('EVM wallet not connected.');
        }
        try {
            const contract = new Contract(contractAddress, abi, this.evmSigner);
            const tx = await contract[functionName](...args, {
                value: ethers.parseEther(value)
            });
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: await this.evmSigner.getAddress(),
                to: contractAddress,
                value,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`Contract write failed: ${error.message}`);
        }
    }
    // ========== GAS ESTIMATION ==========
    async estimateGasEVM(to, value = '0', data = '0x') {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const gasEstimate = await this.evmProvider.estimateGas({
            to,
            value: ethers.parseEther(value),
            data
        });
        return gasEstimate.toString();
    }
    async getGasPriceEVM() {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const feeData = await this.evmProvider.getFeeData();
        return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    }
    // ========== AUTO CONNECTION ==========
    async autoConnect() {
        // Try to auto-connect to EVM wallet
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                if (accounts.length > 0) {
                    this.evmProvider = new BrowserProvider(window.ethereum);
                    this.evmSigner = await this.evmProvider.getSigner();
                    this.isConnected = true;
                    const network = await this.evmProvider.getNetwork();
                    this.currentChain = this.getChainFromId(Number(network.chainId));
                }
            }
            catch (error) {
                console.warn('Auto-connect to EVM wallet failed:', error);
            }
        }
        // Try to auto-connect to Solana wallet
        if (window.solana || window.phantom || window.backpack) {
            const provider = window.solana || window.phantom || window.backpack;
            try {
                if (provider.isConnected) {
                    this.solanaProvider = provider;
                    this.currentChain = 'SOLANA';
                    this.isConnected = true;
                }
            }
            catch (error) {
                console.warn('Auto-connect to Solana wallet failed:', error);
            }
        }
    }
    // ========== BATCH OPERATIONS ==========
    async getMultipleBalancesEVM(addresses) {
        if (!this.evmProvider) {
            throw new Error('EVM provider not available.');
        }
        const balances = await Promise.all(addresses.map(async (address) => ({
            address,
            balance: await this.getNativeBalanceEVM(address)
        })));
        return balances;
    }
    // ========== DISCONNECT ALL ==========
    async disconnectAll() {
        await this.disconnectEVM();
        await this.disconnectSolana();
        this.isConnected = false;
    }
    // ========== WALLET DETECTION ==========
    static detectEVMWallets() {
        const wallets = [];
        if (window.ethereum) {
            wallets.push('MetaMask');
            // Check for other injected wallets
            if (window.ethereum.isCoinbaseWallet)
                wallets.push('Coinbase Wallet');
            if (window.ethereum.isBraveWallet)
                wallets.push('Brave Wallet');
            if (window.ethereum.isTrust)
                wallets.push('Trust Wallet');
            if (window.ethereum.isRabby)
                wallets.push('Rabby');
        }
        return wallets;
    }
    static detectSolanaWallets() {
        const wallets = [];
        if (window.solana)
            wallets.push('Phantom');
        if (window.phantom)
            wallets.push('Phantom');
        if (window.backpack)
            wallets.push('Backpack');
        return wallets;
    }
}
//# sourceMappingURL=frontend-sdk.js.map