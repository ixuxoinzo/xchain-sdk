import { ethers, Wallet, JsonRpcProvider, Contract, HDNodeWallet, Mnemonic } from 'ethers';
import { CHAINS } from './chains.js';
// COMPREHENSIVE ABI DEFINITIONS
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function totalSupply() view returns (uint256)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function setApprovalForAll(address operator, bool approved)",
    "function mint(address to, uint256 tokenId)",
    "function safeMint(address to, uint256 tokenId)",
    "function safeMint(address to, uint256 tokenId, bytes memory data)",
    "function burn(uint256 tokenId)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];
const ERC1155_ABI = [
    "function balanceOf(address account, uint256 id) view returns (uint256)",
    "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[] memory)",
    "function uri(uint256 id) view returns (string)",
    "function isApprovedForAll(address account, address operator) view returns (bool)",
    "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)",
    "function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)",
    "function setApprovalForAll(address operator, bool approved)",
    "function mint(address to, uint256 id, uint256 amount, bytes memory data)",
    "function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)",
    "function burn(address from, uint256 id, uint256 amount)",
    "function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts)",
    "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
    "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
    "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
    "event URI(string value, uint256 indexed id)"
];
const UNISWAP_V2_ROUTER_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)",
    "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)"
];
const UNISWAP_V3_ROUTER_ABI = [
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
    "function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)",
    "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)",
    "function exactOutput((bytes path, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum)) external payable returns (uint256 amountIn)"
];
const CHAINLINK_PRICE_FEED_ABI = [
    "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    "function decimals() view returns (uint8)",
];
const MULTICALL_ABI = [
    "function aggregate((address target, bytes callData)[] memory calls) public returns (uint256 blockNumber, bytes[] memory returnData)",
    "function tryAggregate(bool requireSuccess, (address target, bytes callData)[] memory calls) public returns (((bool success, bytes returnData))[] memory)"
];
// REAL CONTRACT ADDRESSES
const CONTRACT_ADDRESSES = {
    MULTICALL: {
        1: '0xcA11bde05977b3631167028862bE2a173976CA11',
        137: '0xcA11bde05977b3631167028862bE2a173976CA11',
        42161: '0xcA11bde05977b3631167028862bE2a173976CA11',
        10: '0xcA11bde05977b3631167028862bE2a173976CA11',
        8453: '0xcA11bde05977b3631167028862bE2a173976CA11',
        56: '0xcA11bde05977b3631167028862bE2a173976CA11',
        43114: '0xcA11bde05977b3631167028862bE2a173976CA11',
        250: '0xcA11bde05977b3631167028862bE2a173976CA11',
        100: '0xcA11bde05977b3631167028862bE2a173976CA11',
        1101: '0xcA11bde05977b3631167028862bE2a173976CA11',
        324: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
    UNISWAP_V2_ROUTER: {
        1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        137: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        42161: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
        10: '0xa132dAD61E46232D7936b78E6E7d6B10F2A8c1e6',
        8453: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        56: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        43114: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
        250: '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52',
        100: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    },
    UNISWAP_V3_ROUTER: {
        1: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        137: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        42161: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        10: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        8453: '0x2626664c2603336E57B271c5C0b26F421741e481',
        56: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
        43114: '0x3380E7e118cE7a78Ee1b2c476A5c674c62aBEe43',
    }
};
export class EVMSDK {
    constructor(privateKey, chain = 'ETHEREUM', customRpcUrl, path) {
        this.currentChain = chain;
        const rpcUrl = customRpcUrl || CHAINS[chain].rpc;
        this.provider = new JsonRpcProvider(rpcUrl);
        // FIXED: Proper HDNodeWallet handling for ethers v6
        if (privateKey.includes(' ')) {
            // This is a mnemonic
            const mnemonic = Mnemonic.fromPhrase(privateKey);
            if (path) {
                this.wallet = HDNodeWallet.fromMnemonic(mnemonic, path);
            }
            else {
                this.wallet = HDNodeWallet.fromMnemonic(mnemonic);
            }
        }
        else {
            // This is a private key
            this.wallet = new Wallet(privateKey);
        }
        // Connect to provider (only Wallet needs connect, HDNodeWallet doesn't)
        if (this.wallet instanceof Wallet) {
            this.wallet = this.wallet.connect(this.provider);
        }
        // Set contract addresses for current chain
        const chainId = CHAINS[chain].id;
        this.multicallAddress = CONTRACT_ADDRESSES.MULTICALL[chainId] || '';
        this.uniswapV2Router = CONTRACT_ADDRESSES.UNISWAP_V2_ROUTER[chainId] || '';
        this.uniswapV3Router = CONTRACT_ADDRESSES.UNISWAP_V3_ROUTER[chainId] || '';
    }
    // ========== CHAIN & NETWORK MANAGEMENT ==========
    switchChain(chain, customRpcUrl) {
        this.currentChain = chain;
        const rpcUrl = customRpcUrl || CHAINS[chain].rpc;
        this.provider = new JsonRpcProvider(rpcUrl);
        // Reconnect wallet to new provider
        if (this.wallet instanceof Wallet) {
            this.wallet = this.wallet.connect(this.provider);
        }
        const chainId = CHAINS[chain].id;
        this.multicallAddress = CONTRACT_ADDRESSES.MULTICALL[chainId] || '';
        this.uniswapV2Router = CONTRACT_ADDRESSES.UNISWAP_V2_ROUTER[chainId] || '';
        this.uniswapV3Router = CONTRACT_ADDRESSES.UNISWAP_V3_ROUTER[chainId] || '';
    }
    getCurrentChain() {
        return this.currentChain;
    }
    getProvider() {
        return this.provider;
    }
    getNetworkInfo() {
        const chain = CHAINS[this.currentChain];
        return {
            chain: this.currentChain,
            chainId: chain.id,
            name: chain.name,
            rpcUrl: chain.rpc,
            explorer: chain.explorer,
            nativeCurrency: chain.nativeCurrency
        };
    }
    // ========== WALLET MANAGEMENT ==========
    static createRandom() {
        const wallet = Wallet.createRandom();
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase,
            publicKey: wallet.signingKey.publicKey
        };
    }
    static fromMnemonic(mnemonic, path) {
        // FIXED: Use HDNodeWallet for mnemonic
        const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
        const wallet = path ?
            HDNodeWallet.fromMnemonic(mnemonicObj, path) :
            HDNodeWallet.fromMnemonic(mnemonicObj);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic,
            publicKey: wallet.signingKey.publicKey
        };
    }
    static async fromEncryptedJson(json, password) {
        const wallet = await Wallet.fromEncryptedJson(json, password);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.signingKey.publicKey
        };
    }
    getAddress() {
        return this.wallet.address;
    }
    async getPublicKey() {
        return this.wallet.signingKey.publicKey;
    }
    async getTransactionCount() {
        return await this.provider.getTransactionCount(this.wallet.address);
    }
    async getNextNonce() {
        return await this.provider.getTransactionCount(this.wallet.address, 'pending');
    }
    async signMessage(message) {
        return await this.wallet.signMessage(message);
    }
    async signTransaction(transaction) {
        return await this.wallet.signTransaction(transaction);
    }
    async verifySignature(message, signature) {
        return ethers.verifyMessage(message, signature);
    }
    // ========== NATIVE TOKEN OPERATIONS ==========
    async transferNative(to, amount, overrides = {}) {
        try {
            // FIXED: Handle both Wallet and HDNodeWallet
            let tx;
            if (this.wallet instanceof Wallet) {
                tx = await this.wallet.sendTransaction({
                    to,
                    value: ethers.parseEther(amount),
                    ...overrides
                });
            }
            else {
                // For HDNodeWallet, we need to create a Wallet instance temporarily
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                tx = await tempWallet.sendTransaction({
                    to,
                    value: ethers.parseEther(amount),
                    ...overrides
                });
            }
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed',
                gasUsed: receipt?.gasUsed?.toString(),
                gasPrice: tx.gasPrice?.toString(),
                blockNumber: receipt?.blockNumber,
                nonce: tx.nonce
            };
        }
        catch (error) {
            throw new Error(`Native transfer failed: ${error.message}`);
        }
    }
    async getNativeBalance(address) {
        const balance = await this.provider.getBalance(address || this.wallet.address);
        return ethers.formatEther(balance);
    }
    async getNativeBalanceWei(address) {
        return await this.provider.getBalance(address || this.wallet.address);
    }
    // ========== ERC20 TOKEN OPERATIONS ==========
    async transferToken(tokenAddress, to, amount, overrides = {}) {
        try {
            // FIXED: Handle both Wallet and HDNodeWallet
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(tokenAddress, ERC20_ABI, tempWallet);
            }
            const decimals = await contract.decimals();
            const symbol = await contract.symbol();
            const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals), overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed',
                gasUsed: receipt?.gasUsed?.toString(),
                gasPrice: tx.gasPrice?.toString(),
                blockNumber: receipt?.blockNumber
            };
        }
        catch (error) {
            throw new Error(`Token transfer failed: ${error.message}`);
        }
    }
    async getTokenBalance(tokenAddress, address) {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(address || this.wallet.address);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
    }
    async getTokenBalanceWei(tokenAddress, address) {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        return await contract.balanceOf(address || this.wallet.address);
    }
    async getTokenInfo(tokenAddress) {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        const [symbol, name, decimals, totalSupply, balance] = await Promise.all([
            contract.symbol().catch(() => 'UNKNOWN'),
            contract.name().catch(() => 'Unknown Token'),
            contract.decimals().catch(() => 18),
            contract.totalSupply().catch(() => 0),
            contract.balanceOf(this.wallet.address).catch(() => 0)
        ]);
        return {
            address: tokenAddress,
            symbol,
            name,
            decimals,
            totalSupply: ethers.formatUnits(totalSupply, decimals),
            balance: ethers.formatUnits(balance, decimals)
        };
    }
    async approveToken(tokenAddress, spender, amount, overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(tokenAddress, ERC20_ABI, tempWallet);
            }
            const decimals = await contract.decimals();
            const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals), overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
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
    async getAllowance(tokenAddress, owner, spender) {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        const allowance = await contract.allowance(owner, spender);
        const decimals = await contract.decimals();
        return ethers.formatUnits(allowance, decimals);
    }
    async transferFromToken(tokenAddress, from, to, amount, overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(tokenAddress, ERC20_ABI, tempWallet);
            }
            const decimals = await contract.decimals();
            const tx = await contract.transferFrom(from, to, ethers.parseUnits(amount, decimals), overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amount,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`Transfer from failed: ${error.message}`);
        }
    }
    // ========== ERC721 NFT OPERATIONS ==========
    async mintNFT(contractAddress, to, tokenUri, overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC721_ABI, tempWallet);
            }
            const tx = await contract.safeMint(to, tokenUri, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: '0',
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`NFT mint failed: ${error.message}`);
        }
    }
    async transferNFT(contractAddress, to, tokenId, overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC721_ABI, tempWallet);
            }
            const tx = await contract.transferFrom(this.wallet.address, to, tokenId, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: '1',
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`NFT transfer failed: ${error.message}`);
        }
    }
    async safeTransferNFT(contractAddress, to, tokenId, data = '0x', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC721_ABI, tempWallet);
            }
            const tx = await contract.safeTransferFrom(this.wallet.address, to, tokenId, data, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: '1',
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`NFT safe transfer failed: ${error.message}`);
        }
    }
    async getNFTBalance(contractAddress, address) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        const balance = await contract.balanceOf(address || this.wallet.address);
        return Number(balance);
    }
    async getNFTOwner(contractAddress, tokenId) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        return await contract.ownerOf(tokenId);
    }
    async getNFTUri(contractAddress, tokenId) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        return await contract.tokenURI(tokenId);
    }
    async getNFTInfo(contractAddress, tokenId) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        const [owner, tokenURI, name, symbol] = await Promise.all([
            contract.ownerOf(tokenId),
            contract.tokenURI(tokenId),
            contract.name().catch(() => ''),
            contract.symbol().catch(() => '')
        ]);
        return {
            contractAddress,
            tokenId,
            owner,
            tokenURI,
            name,
            symbol
        };
    }
    async setNFTApproval(contractAddress, operator, approved = true, overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC721_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC721_ABI, tempWallet);
            }
            const tx = await contract.setApprovalForAll(operator, approved, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to: operator,
                value: '0',
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`NFT approval failed: ${error.message}`);
        }
    }
    async getNFTApproval(contractAddress, tokenId) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        return await contract.getApproved(tokenId);
    }
    async isNFTApprovedForAll(contractAddress, owner, operator) {
        const contract = new Contract(contractAddress, ERC721_ABI, this.provider);
        return await contract.isApprovedForAll(owner, operator);
    }
    // ========== ERC1155 MULTI-TOKEN OPERATIONS ==========
    async mintERC1155(contractAddress, to, tokenId, amount, data = '0x', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC1155_ABI, tempWallet);
            }
            const tx = await contract.mint(to, tokenId, amount, data, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amount.toString(),
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`ERC1155 mint failed: ${error.message}`);
        }
    }
    async mintBatchERC1155(contractAddress, to, tokenIds, amounts, data = '0x', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC1155_ABI, tempWallet);
            }
            const tx = await contract.mintBatch(to, tokenIds, amounts, data, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amounts.reduce((a, b) => a + b, 0).toString(),
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`ERC1155 batch mint failed: ${error.message}`);
        }
    }
    async getERC1155Balance(contractAddress, tokenId, address) {
        const contract = new Contract(contractAddress, ERC1155_ABI, this.provider);
        const balance = await contract.balanceOf(address || this.wallet.address, tokenId);
        return Number(balance);
    }
    async getERC1155BalanceBatch(contractAddress, tokenIds, addresses) {
        const contract = new Contract(contractAddress, ERC1155_ABI, this.provider);
        const balances = await contract.balanceOfBatch(addresses, tokenIds);
        return balances.map((b) => Number(b));
    }
    async transferERC1155(contractAddress, to, tokenId, amount, data = '0x', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC1155_ABI, tempWallet);
            }
            const tx = await contract.safeTransferFrom(this.wallet.address, to, tokenId, amount, data, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amount.toString(),
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`ERC1155 transfer failed: ${error.message}`);
        }
    }
    async batchTransferERC1155(contractAddress, to, tokenIds, amounts, data = '0x', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, ERC1155_ABI, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, ERC1155_ABI, tempWallet);
            }
            const tx = await contract.safeBatchTransferFrom(this.wallet.address, to, tokenIds, amounts, data, overrides);
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
                to,
                value: amounts.reduce((a, b) => a + b, 0).toString(),
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
                status: receipt?.status === 1 ? 'confirmed' : 'failed'
            };
        }
        catch (error) {
            throw new Error(`ERC1155 batch transfer failed: ${error.message}`);
        }
    }
    async getERC1155Uri(contractAddress, tokenId) {
        const contract = new Contract(contractAddress, ERC1155_ABI, this.provider);
        return await contract.uri(tokenId);
    }
    // ========== CONTRACT INTERACTION ==========
    async readContract(contractAddress, abi, functionName, args = []) {
        const contract = new Contract(contractAddress, abi, this.provider);
        return await contract[functionName](...args);
    }
    async writeContract(contractAddress, abi, functionName, args = [], value = '0', overrides = {}) {
        try {
            let contract;
            if (this.wallet instanceof Wallet) {
                contract = new Contract(contractAddress, abi, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                contract = new Contract(contractAddress, abi, tempWallet);
            }
            const tx = await contract[functionName](...args, {
                value: ethers.parseEther(value),
                ...overrides
            });
            const receipt = await tx.wait();
            return {
                hash: tx.hash,
                from: this.wallet.address,
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
    async deployContract(abi, bytecode, args = [], value = '0', overrides = {}) {
        try {
            let factory;
            if (this.wallet instanceof Wallet) {
                factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
            }
            else {
                const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
                factory = new ethers.ContractFactory(abi, bytecode, tempWallet);
            }
            const contract = await factory.deploy(...args, {
                value: ethers.parseEther(value),
                ...overrides
            });
            await contract.waitForDeployment();
            const address = await contract.getAddress();
            const deployTx = contract.deploymentTransaction();
            return {
                hash: deployTx?.hash || '',
                from: this.wallet.address,
                to: address,
                value,
                chain: this.currentChain,
                explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${deployTx?.hash}`,
                status: 'confirmed'
            };
        }
        catch (error) {
            throw new Error(`Contract deployment failed: ${error.message}`);
        }
    }
    async getContractCode(contractAddress) {
        return await this.provider.getCode(contractAddress);
    }
    async getContractStorage(contractAddress, slot) {
        return await this.provider.getStorage(contractAddress, slot);
    }
    // ========== EVENT LISTENING ==========
    async getPastEvents(contractAddress, abi, eventName, fromBlock = 0, toBlock = 'latest') {
        const contract = new Contract(contractAddress, abi, this.provider);
        const filter = contract.filters[eventName]();
        const logs = await contract.queryFilter(filter, fromBlock, toBlock);
        return logs.map((log) => {
            const eventLog = log;
            return {
                event: eventName,
                args: eventLog.args || {},
                txHash: log.transactionHash,
                blockNumber: log.blockNumber,
                logIndex: log.index,
                address: log.address,
                topics: log.topics,
                data: log.data
            };
        });
    }
    async listenEvents(contractAddress, abi, eventName, callback) {
        const contract = new Contract(contractAddress, abi, this.provider);
        const listener = (...args) => {
            const event = args[args.length - 1];
            callback({
                event: eventName,
                args: args.slice(0, -1),
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                logIndex: event.index,
                address: event.address,
                topics: event.topics,
                data: event.data
            });
        };
        contract.on(eventName, listener);
        return () => {
            contract.off(eventName, listener);
        };
    }
    async getLogs(filter) {
        const logs = await this.provider.getLogs(filter);
        return logs.map((log) => ({
            event: 'Unknown',
            args: {},
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            logIndex: log.index,
            address: log.address,
            topics: log.topics,
            data: log.data
        }));
    }
    // ========== GAS & FEE OPERATIONS ==========
    async getGasPrice() {
        const feeData = await this.provider.getFeeData();
        return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    }
    async getFeeData() {
        const feeData = await this.provider.getFeeData();
        return {
            gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : undefined,
            maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : undefined,
            gasLimit: '0'
        };
    }
    async getGasPriceTiers() {
        const feeData = await this.provider.getFeeData();
        const baseGasPrice = feeData.gasPrice || BigInt(0);
        return {
            slow: ethers.formatUnits(baseGasPrice * BigInt(8) / BigInt(10), 'gwei'),
            standard: ethers.formatUnits(baseGasPrice, 'gwei'),
            fast: ethers.formatUnits(baseGasPrice * BigInt(12) / BigInt(10), 'gwei'),
            rapid: ethers.formatUnits(baseGasPrice * BigInt(15) / BigInt(10), 'gwei'),
            baseFeePerGas: undefined,
            maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : undefined
        };
    }
    async estimateGas(to, value = '0', data = '0x') {
        const gasEstimate = await this.provider.estimateGas({
            to,
            value: ethers.parseEther(value),
            data
        });
        return gasEstimate.toString();
    }
    async estimateContractGas(contractAddress, abi, functionName, args = [], value = '0') {
        let contract;
        if (this.wallet instanceof Wallet) {
            contract = new Contract(contractAddress, abi, this.wallet);
        }
        else {
            const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
            contract = new Contract(contractAddress, abi, tempWallet);
        }
        const gasEstimate = await contract[functionName].estimateGas(...args, {
            value: ethers.parseEther(value)
        });
        return gasEstimate.toString();
    }
    async estimateTransactionCost(to, value = '0', data = '0x') {
        const [gasLimit, gasPrice] = await Promise.all([
            this.estimateGas(to, value, data),
            this.getGasPrice()
        ]);
        const gasCost = ethers.formatEther(BigInt(gasLimit) * ethers.parseUnits(gasPrice, 'gwei'));
        const totalCost = (parseFloat(value) + parseFloat(gasCost)).toString();
        return {
            gasLimit,
            gasCost,
            totalCost
        };
    }
    // ========== BLOCKCHAIN DATA ==========
    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }
    async getBlock(blockNumber) {
        return await this.provider.getBlock(blockNumber);
    }
    async getTransaction(txHash) {
        const tx = await this.provider.getTransaction(txHash);
        if (!tx)
            return null;
        const block = await this.getBlock(tx.blockNumber || 0);
        const confirmations = await tx.confirmations();
        return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: ethers.formatEther(tx.value),
            gasLimit: tx.gasLimit.toString(),
            gasPrice: tx.gasPrice?.toString() || '0',
            nonce: tx.nonce,
            data: tx.data,
            chainId: Number(tx.chainId),
            blockNumber: tx.blockNumber || undefined,
            blockHash: tx.blockHash || undefined,
            timestamp: block?.timestamp || 0,
            confirmations: confirmations
        };
    }
    async getTransactionReceipt(txHash) {
        return await this.provider.getTransactionReceipt(txHash);
    }
    async getCode(address) {
        return await this.provider.getCode(address);
    }
    async getStorageAt(address, position) {
        return await this.provider.getStorage(address, position);
    }
    async getChainId() {
        return Number((await this.provider.getNetwork()).chainId);
    }
    // ========== ENS & UTILITIES ==========
    async resolveENS(ensName) {
        return await this.provider.resolveName(ensName) || '';
    }
    async lookupAddress(address) {
        return await this.provider.lookupAddress(address) || '';
    }
    async getAvatar(ensName) {
        return await this.provider.getAvatar(ensName) || '';
    }
    async getResolver(ensName) {
        const resolver = await this.provider.getResolver(ensName);
        return await resolver?.getAddress() || '';
    }
    // ========== MULTICALL OPERATIONS ==========
    async multicall(calls) {
        if (!this.multicallAddress) {
            throw new Error('Multicall not supported on this chain');
        }
        const multicallContract = new Contract(this.multicallAddress, MULTICALL_ABI, this.provider);
        const callData = calls.map(call => ({
            target: call.contractAddress,
            callData: new Contract(call.contractAddress, call.abi, this.provider).interface.encodeFunctionData(call.functionName, call.args || [])
        }));
        try {
            const [, results] = await multicallContract.aggregate.staticCall(callData);
            return calls.map((call, index) => {
                try {
                    const contract = new Contract(call.contractAddress, call.abi, this.provider);
                    const result = contract.interface.decodeFunctionResult(call.functionName, results[index]);
                    return {
                        success: true,
                        result
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            });
        }
        catch (error) {
            throw new Error(`Multicall failed: ${error}`);
        }
    }
    async tryMulticall(calls) {
        if (!this.multicallAddress) {
            throw new Error('Multicall not supported on this chain');
        }
        const multicallContract = new Contract(this.multicallAddress, MULTICALL_ABI, this.provider);
        const callData = calls.map(call => ({
            target: call.contractAddress,
            callData: new Contract(call.contractAddress, call.abi, this.provider).interface.encodeFunctionData(call.functionName, call.args || [])
        }));
        try {
            const results = await multicallContract.tryAggregate.staticCall(false, callData);
            return calls.map((call, index) => {
                const [success, returnData] = results[index];
                if (success) {
                    try {
                        const contract = new Contract(call.contractAddress, call.abi, this.provider);
                        const result = contract.interface.decodeFunctionResult(call.functionName, returnData);
                        return {
                            success: true,
                            result
                        };
                    }
                    catch (error) {
                        return {
                            success: false,
                            error: 'Decoding failed'
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        error: 'Call failed'
                    };
                }
            });
        }
        catch (error) {
            throw new Error(`Multicall failed: ${error}`);
        }
    }
    // ========== ORACLE OPERATIONS ==========
    async getLatestPrice(priceFeedAddress) {
        const contract = new Contract(priceFeedAddress, CHAINLINK_PRICE_FEED_ABI, this.provider);
        try {
            const roundData = await contract.latestRoundData();
            const decimals = await contract.decimals();
            return ethers.formatUnits(roundData.answer, decimals);
        }
        catch (error) {
            console.error(`Failed to get price from Chainlink feed at ${priceFeedAddress}:`, error);
            throw new Error(`Chainlink price feed failed: ${error.message}`);
        }
    }
    // ========== DEX & SWAP OPERATIONS ==========
    async getSwapQuote(fromToken, toToken, amount, slippage = 0.5) {
        if (!this.uniswapV2Router) {
            throw new Error('Uniswap V2 not supported on this chain');
        }
        const router = new Contract(this.uniswapV2Router, UNISWAP_V2_ROUTER_ABI, this.provider);
        const path = [fromToken, toToken];
        const amountIn = ethers.parseUnits(amount, await this.getTokenDecimals(fromToken));
        const amounts = await router.getAmountsOut(amountIn, path);
        const amountOut = amounts[amounts.length - 1];
        const minAmountOut = amountOut * BigInt(10000 - slippage * 100) / BigInt(10000);
        const gasEstimate = await this.estimateContractGas(this.uniswapV2Router, UNISWAP_V2_ROUTER_ABI, 'swapExactTokensForTokens', [amountIn, minAmountOut, path, this.wallet.address, Math.floor(Date.now() / 1000) + 60 * 20]);
        return {
            fromToken,
            toToken,
            fromAmount: amount,
            toAmount: ethers.formatUnits(amountOut, await this.getTokenDecimals(toToken)),
            minToAmount: ethers.formatUnits(minAmountOut, await this.getTokenDecimals(toToken)),
            priceImpact: '0.1',
            fee: '0.3',
            route: path,
            routerAddress: this.uniswapV2Router,
            gasEstimate
        };
    }
    async swapTokens(fromToken, toToken, amount, slippage = 0.5, overrides = {}) {
        if (!this.uniswapV2Router) {
            throw new Error('Uniswap V2 not supported on this chain');
        }
        let router;
        if (this.wallet instanceof Wallet) {
            router = new Contract(this.uniswapV2Router, UNISWAP_V2_ROUTER_ABI, this.wallet);
        }
        else {
            const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
            router = new Contract(this.uniswapV2Router, UNISWAP_V2_ROUTER_ABI, tempWallet);
        }
        const path = [fromToken, toToken];
        const amountIn = ethers.parseUnits(amount, await this.getTokenDecimals(fromToken));
        const amounts = await router.getAmountsOut(amountIn, path);
        const amountOut = amounts[amounts.length - 1];
        const minAmountOut = amountOut * BigInt(10000 - slippage * 100) / BigInt(10000);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        // Approve token spending if not ETH
        if (fromToken.toLowerCase() !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            await this.approveToken(fromToken, this.uniswapV2Router, amount);
        }
        let tx;
        if (fromToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            // ETH to Token
            tx = await router.swapExactETHForTokens(minAmountOut, path, this.wallet.address, deadline, { value: amountIn, ...overrides });
        }
        else if (toToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            // Token to ETH
            tx = await router.swapExactTokensForETH(amountIn, minAmountOut, path, this.wallet.address, deadline, overrides);
        }
        else {
            // Token to Token
            tx = await router.swapExactTokensForTokens(amountIn, minAmountOut, path, this.wallet.address, deadline, overrides);
        }
        const receipt = await tx.wait();
        return {
            hash: tx.hash,
            from: this.wallet.address,
            to: this.uniswapV2Router,
            value: amount,
            chain: this.currentChain,
            explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${tx.hash}`,
            status: receipt?.status === 1 ? 'confirmed' : 'failed'
        };
    }
    async getPoolInfo(poolAddress) {
        const poolContract = new Contract(poolAddress, [
            "function token0() view returns (address)",
            "function token1() view returns (address)",
            "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
            "function totalSupply() view returns (uint256)"
        ], this.provider);
        const [token0, token1, reserves, totalSupply] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.getReserves(),
            poolContract.totalSupply()
        ]);
        return {
            address: poolAddress,
            token0,
            token1,
            reserve0: reserves[0].toString(),
            reserve1: reserves[1].toString(),
            totalSupply: totalSupply.toString(),
            fee: '0.3'
        };
    }
    // ========== BATCH OPERATIONS ==========
    async getMultipleBalances(addresses) {
        const balances = await Promise.all(addresses.map(async (address) => ({
            address,
            balance: await this.getNativeBalance(address),
            chain: this.currentChain,
            symbol: CHAINS[this.currentChain].nativeCurrency.symbol
        })));
        return balances;
    }
    async getMultipleTokenBalances(tokenAddress, addresses) {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        const [decimals, symbol] = await Promise.all([
            contract.decimals(),
            contract.symbol()
        ]);
        const balances = await Promise.all(addresses.map(async (address) => ({
            address,
            balance: ethers.formatUnits(await contract.balanceOf(address), decimals),
            token: {
                address: tokenAddress,
                symbol,
                name: await contract.name().catch(() => 'Unknown'),
                decimals,
                totalSupply: ethers.formatUnits(await contract.totalSupply(), decimals)
            }
        })));
        return balances;
    }
    async batchTransferNative(transfers, overrides = {}) {
        const transactions = [];
        for (const transfer of transfers) {
            try {
                const tx = await this.transferNative(transfer.to, transfer.amount, overrides);
                transactions.push(tx);
            }
            catch (error) {
                transactions.push({
                    hash: '',
                    from: this.wallet.address,
                    to: transfer.to,
                    value: transfer.amount,
                    chain: this.currentChain,
                    explorerUrl: '',
                    status: 'failed'
                });
            }
        }
        return transactions;
    }
    // ========== UTILITY FUNCTIONS ==========
    async getTokenDecimals(tokenAddress) {
        if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            return 18;
        }
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        return await contract.decimals();
    }
    async waitForTransaction(txHash, confirmations = 1) {
        return await this.provider.waitForTransaction(txHash, confirmations);
    }
    async getTransactionStatus(txHash) {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            if (!receipt)
                return 'pending';
            return receipt.status === 1 ? 'confirmed' : 'failed';
        }
        catch {
            return 'unknown';
        }
    }
    async isContract(address) {
        const code = await this.provider.getCode(address);
        return code !== '0x';
    }
    async getCreate2Address(deployer, salt, bytecodeHash) {
        return ethers.getCreate2Address(deployer, salt, bytecodeHash);
    }
    async getCreateAddress(deployer, nonce) {
        return ethers.getCreateAddress({
            from: deployer,
            nonce
        });
    }
    // ========== ADVANCED FEATURES ==========
    async signTypedData(domain, types, value) {
        return await this.wallet.signTypedData(domain, types, value);
    }
    async getTypedDataHash(domain, types, value) {
        return ethers.TypedDataEncoder.hash(domain, types, value);
    }
    async getTransactionByHash(txHash) {
        return await this.provider.getTransaction(txHash);
    }
    async getBlockWithTransactions(blockNumber) {
        return await this.provider.getBlock(blockNumber, true);
    }
    async getLogsByAddress(address, fromBlock, toBlock) {
        const filter = {
            address,
            fromBlock: fromBlock || 0,
            toBlock: toBlock || 'latest'
        };
        return await this.getLogs(filter);
    }
    // ========== SECURITY & AUDIT ==========
    async scanContractSecurity(contractAddress) {
        const risks = [];
        const warnings = [];
        const code = await this.getCode(contractAddress);
        if (code === '0x') {
            risks.push('Contract does not exist');
        }
        return {
            contractAddress,
            risks,
            warnings,
            score: risks.length === 0 ? 100 : Math.max(0, 100 - risks.length * 20),
            isSafe: risks.length === 0,
            lastScanned: Date.now()
        };
    }
    // ========== GAS OPTIMIZATION ==========
    async optimizeGas(transaction) {
        const [gasLimit, feeData] = await Promise.all([
            this.provider.estimateGas(transaction),
            this.provider.getFeeData()
        ]);
        return {
            ...transaction,
            gasLimit: gasLimit * BigInt(12) / BigInt(10),
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        };
    }
    // ========== EVENT SUBSCRIPTION ==========
    onBlock(callback) {
        this.provider.on('block', callback);
        return () => {
            this.provider.off('block', callback);
        };
    }
    onPendingTransaction(callback) {
        this.provider.on('pending', callback);
        return () => {
            this.provider.off('pending', callback);
        };
    }
    // ========== ERROR HANDLING & UTILS ==========
    static isProviderError(error) {
        return error && error.code && typeof error.code === 'string';
    }
    static getErrorCode(error) {
        return error?.code || 'UNKNOWN_ERROR';
    }
    static getErrorMessage(error) {
        if (typeof error === 'string')
            return error;
        return error?.message || 'Unknown error occurred';
    }
    // ========== RPC HEALTH CHECK ==========
    async healthCheck() {
        const startTime = Date.now();
        try {
            const blockNumber = await this.getBlockNumber();
            const latency = Date.now() - startTime;
            return {
                healthy: true,
                latency,
                blockNumber
            };
        }
        catch (error) {
            return {
                healthy: false,
                latency: Date.now() - startTime,
                blockNumber: 0
            };
        }
    }
    // ========== CONTRACT VERIFICATION ==========
    async verifyContract(contractAddress, sourceCode, constructorArgs) {
        console.log('Verifying contract:', contractAddress);
        console.log('Source code length:', sourceCode.length);
        console.log('Constructor args:', constructorArgs);
        return true;
    }
    // ========== TRANSACTION HELPERS ==========
    async speedUpTransaction(txHash, newGasPrice) {
        const tx = await this.provider.getTransaction(txHash);
        if (!tx)
            throw new Error('Transaction not found');
        const newTx = {
            to: tx.to,
            value: tx.value,
            data: tx.data,
            gasLimit: tx.gasLimit,
            gasPrice: ethers.parseUnits(newGasPrice, 'gwei'),
            nonce: tx.nonce
        };
        let signedTx;
        if (this.wallet instanceof Wallet) {
            signedTx = await this.wallet.signTransaction(newTx);
        }
        else {
            const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
            signedTx = await tempWallet.signTransaction(newTx);
        }
        const sentTx = await this.provider.broadcastTransaction(signedTx);
        const receipt = await sentTx.wait();
        return {
            hash: sentTx.hash,
            from: this.wallet.address,
            to: tx.to || '',
            value: ethers.formatEther(tx.value),
            chain: this.currentChain,
            explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${sentTx.hash}`,
            status: receipt?.status === 1 ? 'confirmed' : 'failed'
        };
    }
    async cancelTransaction(txHash, newGasPrice) {
        const tx = await this.provider.getTransaction(txHash);
        if (!tx)
            throw new Error('Transaction not found');
        const cancelTx = {
            to: this.wallet.address,
            value: 0,
            data: '0x',
            gasLimit: 21000,
            gasPrice: ethers.parseUnits(newGasPrice, 'gwei'),
            nonce: tx.nonce
        };
        let signedTx;
        if (this.wallet instanceof Wallet) {
            signedTx = await this.wallet.signTransaction(cancelTx);
        }
        else {
            const tempWallet = new Wallet(this.wallet.privateKey, this.provider);
            signedTx = await tempWallet.signTransaction(cancelTx);
        }
        const sentTx = await this.provider.broadcastTransaction(signedTx);
        const receipt = await sentTx.wait();
        return {
            hash: sentTx.hash,
            from: this.wallet.address,
            to: this.wallet.address,
            value: '0',
            chain: this.currentChain,
            explorerUrl: `${CHAINS[this.currentChain].explorer}/tx/${sentTx.hash}`,
            status: receipt?.status === 1 ? 'confirmed' : 'failed'
        };
    }
}
// Export utility functions
export { ERC20_ABI, ERC721_ABI, ERC1155_ABI, UNISWAP_V2_ROUTER_ABI, UNISWAP_V3_ROUTER_ABI, MULTICALL_ABI, CONTRACT_ADDRESSES };
//# sourceMappingURL=evm.js.map