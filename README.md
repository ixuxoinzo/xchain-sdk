<p align="center">
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

## Design Philosophy: Made for Developers
The code in `xchain-sdk` is not only clean, but deliberately designed to be easy to understand. We name variables and functions explicitly so that developers can immediately understand what each line of code does. Our goal is for you to be productive in minutes, not hours.

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

This repository includes a comprehensive demo script located at `demo.ts`.

### Installation for Users

To use the SDK in your own project, install it from NPM:
```bash
npm install @ixuxoinzo/xchain-sdk

Running the Included Demo
To run the complete demo script (demo.ts) from this repository:
1. Setup
First, install the dependencies from the project's root directory.
npm install

2. Run the Demo
The unified demo script can be run in different modes from the project root:
 * To run the core scripts (backend/CLI examples):
   This will execute demonstrations for features like balance checks and contract calls directly in your terminal.
   npm run start

 * To run the interactive dApp (frontend demo):
   This will start a local development server and open a web-based dApp in your browser to showcase client-side integration.
   npm run dev

Example Output
Running the npm run start command will produce a detailed output in your terminal, demonstrating the SDK's core functionalities:
? XCHAIN SDK DEMO - MULTI-CHAIN BLOCKCHAIN OPERATIONS

1. HYBRID SDK DEMO
==================================================
⏩  Skipping Frontend Wallet Detection (Node.js environment)

2. BACKEND SDK DEMO
==================================================
🔐 Generated Demo Wallets:
   EVM Address: 0x54363A8eef4230f82AF38B0cFAACc0a0a24f47d3
   EVM Private Key: 0x82f1a9cedf5483c539...
   Solana Address: DV3FViuaD8KYycmU1umqW1ogXmSriLq883EatzF8FEjM
   Solana Private Key: 5qQBspU9EczFDfEwNxMm...

✅  Backend SDK Initialized:
   EVM Address: 0x54363A8eef4230f82AF38B0cFAACc0a0a24f47d3
   Solana Address: DV3FViuaD8KYycmU1umqW1ogXmSriLq883EatzF8FEjM
   EVM Configured: true
   Solana Configured: true

3. EVM OPERATIONS DEMO
==================================================
📍 EVM SDK Info:
   Address: 0x54363A8eef4230f82AF38B0cFAACc0a0a24f47d3
   Current Chain: ETHEREUM
   Network: {
     chain: 'ETHEREUM',
     chainId: 1,
     name: 'Ethereum',
     rpcUrl: '[https://eth.llamarpc.com](https://eth.llamarpc.com)',
     explorer: '[https://etherscan.io](https://etherscan.io)',
     nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
   }

📊 Read Operations:
   Current Block: 23492225
   Current Gas Price: 0.792025783 GWEI
   Balance: 0.0 ETH

🔄 Chain Switching:
   ✅  POLYGON: 0.0 MATIC
   ✅  ARBITRUM: 0.0 ETH
   ✅  BASE: 0.0 ETH

4. SOLANA OPERATIONS DEMO
==================================================
📍 Solana SDK Info:
   Address: DV3FViuaD8KYycmU1umqW1ogXmSriLq883EatzF8FEjM
   Public Key: DV3FViuaD8KYycmU1umqW1ogXmSriLq883EatzF8FEjM

📊 Solana Read Operations:
   SOL Balance: 0
   Recent Blockhash: CpmQDB5yuy5pMeHVhssG...
   Current Slot: 370762280

5. MULTICALL OPERATIONS DEMO
==================================================
🧪 Testing Multicall:
   Multicall Results:
   ✅  USDT: USDT
   ✅  USDC: USDC
   ✅  DAI: DAI

6. HEALTH CHECKS
==================================================
   EVM Health: ✅  Healthy
   EVM Latency: 254ms
   EVM Block: 23492225
   Solana Health: ✅  Healthy
   Solana Latency: 10ms
   Solana Slot: 370762282

7. ERROR HANDLING DEMO
==================================================
   Testing error handling...
   ✅  Error handled properly: Native transfer failed: unconfigured name (value="0xInvalidAddress", code=UNCONFIGURED_NAME, version=6.15.0)

8. ADVANCED FEATURES
==================================================
   Gas Estimate: 21000
   Fee Data: {
     gasPrice: '0.792025783',
     maxFeePerGas: '1.583671641',
     maxPriorityFeePerGas: '0.000379925'
   }

🎉 DEMO SUMMARY
==================================================
✅  SDK Initialized Successfully
✅  Multi-chain Support Working
✅  Read Operations Functional
✅  Error Handling Working
✅  Advanced Features Accessible

💡 NEXT STEPS:
   1. Use real private keys for actual transactions
   2. Configure RPC endpoints for better performance
   3. Add error handling and retry logic for production
   4. Implement proper security measures for private keys

🚀 SDK READY FOR PRODUCTION!

🗺️ Project Roadmap & Vision
This project is divided into two distinct parts: the Core SDK, which is a complete and ready-to-use utility, and the Pro Vision, a full-stack DeFi platform that represents the future of this project, contingent on funding and resources.
xChain SDK - CORE (✅ Stable & Ready to Use)
The Core SDK is a powerful, reliable, and free open-source tool designed to simplify multi-chain interactions. The goal for the Core SDK is to be the best utility library for developers.
Completed Features:
 * Full Multi-Chain Infrastructure: Setup for 12+ EVM chains and Solana.
 * Complete Read Operations: Fetching native/token balances, reading contract data, multicall, and network health checks.
 * Wallet Management: Secure generation and management of wallets.
Finalizing for v1.0 Release:
 * [🟡] Full Transaction Handler: Implementing sendTransaction and executeContract to complete the core read/write capabilities.
 * [🟡] Basic NFT & Data Utilities: Adding essential functions for viewing NFTs and fetching transaction history.
 * [🔵] Chainlink Price Oracle: Integrating Chainlink price feeds as a high-value, reliable utility for all users.
 * [🟡] Comprehensive Documentation: Finalizing docs to ensure the Core SDK is easy to adopt.
🚀 The Vision: xChain PRO - The Universal Asset Translator
Beyond the Core SDK lies the vision for xChain Pro: a true "any-to-any" cross-chain swap aggregator that will begin by mastering the busiest corridor in crypto: EVM chains and Solana.
The User Experience We Will Build:
Imagine a user sending native ETH from Ethereum and seamlessly receiving USDC on the Solana network in a single transaction. Or sending SOL from Solana and having it arrive as USDT on Polygon.
The user simply states their intent ("I have this, I want that"), and the aggregator executes the most optimal path—bridging and swapping automatically between the EVM and Solana ecosystems.
The Technical Challenge & The Opportunity:
Mastering the EVM-Solana corridor alone is a massive engineering undertaking. It requires a world-class smart routing engine, deep integration with EVM-Solana bridges (like Wormhole), liquidity sources on both sides (like Uniswap and Orca), a robust off-chain relayer network, and uncompromising security audits.
This is the multi-chain future we are building towards, starting with the most important connection. It is a multi-million dollar opportunity that requires a dedicated team and significant resources.
⭐ Call to Action: We have the blueprint. Let's build the future of interoperability.
We are actively seeking funding, grants, or strategic partners to accelerate the development of xChain Pro and capture this critical market. If you are an investor, a venture fund, or a grant provider looking to fund foundational infrastructure for the multi-chain world, let's connect. Once the EVM-Solana bridge is perfected, we will expand to other ecosystems.
🔧 Configuration
You can configure the SDK with custom RPC URLs and other options. Here's an example:
import { EVMSDK, SolanaSDK } from '@ixuxoinzo/xchain-sdk';
import 'dotenv/config';

// For EVM
const evm = new EVMSDK(process.env.EVM_PRIVATE_KEY!, 'ETHEREUM', {
  rpcUrl: process.env.ETHEREUM_RPC_URL, // Optional: override default RPC
});

// For Solana
const solana = new SolanaSDK(process.env.SOLANA_PRIVATE_KEY!, {
  rpcUrl: process.env.SOLANA_RPC_URL, // Optional: override default RPC
});

🔌 Adding a Custom Chain
The SDK is not limited to the pre-configured chains. You can dynamically add support for any EVM-compatible network at runtime using the addChain function. For implementation details, please refer to the source code or upcoming documentation.
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
 * EVM Chains (ETH, USDC, USDT, etc.):
   0xFBA061EA80d3593e3AF1430ad2050729b59362D9
 * Solana (SOL, USDC, etc.):
   9ShXRhekCCnbN9bbQ9wXoq1KCfNQZ4uydXvmC9LPStBZ
📄 License
This project is licensed under the MIT License.

