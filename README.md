
# <p align="center">
  <img src="assets/8fx443.jpg" alt="xChain SDK Logo" width="600"/>
</p>

<h1 align="center">xChain SDK</h1>

<p align="center">
  Your unified solution for Ethereum, L2 networks, and Solana.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@ixuxoinzo/xchain-sdk">
    <img src="https://img.shields.io/npm/v/@ixuxoinzo/xchain-sdk.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/ixuxoinzo/xchain-sdk/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@ixuxoinzo/xchain-sdk.svg" alt="License">
  </a>
    <a href="https://github.com/ixuxoinzo/xchain-sdk/stargazers">
    <img src="https://img.shields.io/github/stars/ixuxoinzo/xchain-sdk.svg" alt="GitHub Stars">
  </a>
</p>

---


**Your unified solution for Ethereum, L2 networks, and Solana**

#Design Philosophy: Made for Developers
The code in xchain-sdk is not only clean, but deliberately designed to be easy to understand. We name variables and functions explicitly so that developers can immediately understand what each line of code does. Our goal is for you to be productive in minutes, not hours.

---

## 🌟 Features

### 🛠 **Comprehensive Multi-Chain Support**
- **Ethereum** and **Leading L2 Networks**: Optimism, Arbitrum, Base, Polygon, zkSync, Linea, Scroll, and more.
- **Solana** with full SPL Token, NFT, and native SOL support.
- **Unified API** for seamless interactions across all supported chains.

### 💰 **Native & Token Operations**
- Get native coin (ETH, MATIC, SOL, etc.) balances.
- Get ERC20/SPL token balances.
- Transfer native coins.
- Transfer ERC20/SPL tokens.
- Fetch token information (name, symbol, decimals, total supply).

### 🖼 **NFT Management**
- Get ERC721/SPL NFT balances.
- Get owner of a specific NFT.
- Mint new ERC721/SPL NFTs (requires specific contract logic or metaplex setup).
- View NFTs owned by an address.

### 📝 **Smart Contract Interaction**
- Read data from any EVM smart contract (e.g., `balanceOf`, `symbol`).
- Write transactions to any EVM smart contract (e.g., `transfer`, `approve`).
- Multicall functionality for efficient batching of read operations on EVM chains.

### 📡 **Network Utilities**
- Get current block number/slot.
- Get current gas prices/fee data.
- Estimate gas for EVM transactions.
- Get transaction history for Solana.
- Comprehensive health checks for RPC endpoints (latency, block sync).
- Event listening for real-time updates on EVM chains.

### 🔑 **Wallet Management**
- Generate new random EVM and Solana wallets.
- Securely manage private keys for backend operations.
- Integrate with frontend wallet extensions (MetaMask, Phantom, etc.).

---

## 🚀 Quick Start & Examples

To quickly get started and see the SDK in action, explore the examples provided in the `examples/` directory.

### Installation

```bash
npm install @your-org/xchain-sdk # Assuming your package is published under a scope
# Or, if directly from GitHub:
# npm install ixuxoinzo/xchain-sdk

Running Examples
 * Basic Usage: Demonstrates fundamental EVM and Solana operations.
   # Navigate to the basic-usage example directory
cd examples/basic-usage
# Install dependencies (if needed)
npm install
# Run the basic example
npm start

   Find the code at: examples/basic-usage/index.ts
 * Backend API Demo: Shows how to use the SDK for server-side operations with private keys.
   # Navigate to the backend-api example directory
cd examples/backend-api
# Install dependencies (if needed)
npm install
# Run the backend API example
npm start

   Find the code at: examples/backend-api/index.ts
 * Frontend dApp Demo: Illustrates integrating the SDK into a client-side application (requires a browser environment).
   # Navigate to the frontend-dapp example directory
cd examples/frontend-dapp
# Install dependencies (if needed)
npm install
# Follow instructions in its README for running the dApp

   Find the code at: examples/frontend-dapp/index.ts
🔧 Configuration
You can configure the SDK with custom RPC URLs and other options. Here's an example:
import { EVMSDK, SolanaSDK } from 'ixuxoinzo/xchain-sdk'; // Adjust imports
import 'dotenv/config';

// For EVM
const evm = new EVMSDK(process.env.EVM_PRIVATE_KEY!, 'ETHEREUM', {
  rpcUrl: process.env.ETHEREUM_RPC_URL, // Optional: override default RPC
  // Other Ethers.js provider options can be passed here
});

// For Solana
const solana = new SolanaSDK(process.env.SOLANA_PRIVATE_KEY!, {
  rpcUrl: process.env.SOLANA_RPC_URL, // Optional: override default RPC
  // Other Solana Connection options can be passed here
});

🌐 Supported Chains
EVM Chains
 * Ethereum
 * Optimism
 * Arbitrum One
 * Base
 * Polygon POS
 * Polygon zkEVM
 * zkSync Era
 * Linea
 * Scroll
 * Mantle
 * Metis
 * Blast
Solana
 * Solana Mainnet Beta
 * Solana Devnet / Testnet support via RPC configuration
📞 Support
 * GitHub Repository: https://github.com/ixuxoinzo/xchain-sdk
 * Report Issues: Use GitHub Issues
🙏 Donations Supported
If you find this SDK useful and would like to support its development, any contributions are greatly appreciated!
EVM Chains (ETH, USDC, USDT, etc.):
0xFBA061EA80d3593e3AF1430ad2050729b59362D9
Solana (SOL, USDC, etc.):
9ShXRhekCCnbN9bbQ9wXoq1KCfNQZ4uydXvmC9LPStBZ
📄 License
MIT License



