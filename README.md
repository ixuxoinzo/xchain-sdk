
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

# 🚀 xChain SDK - Multi-Chain Blockchain SDK

## Design Philosophy: Made for Developers
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

This repository includes a comprehensive demo script located at `demo.ts`.

### Installation for Users

To use the SDK in your own project, install it from NPM:
```bash
npm install @ixuxoinzo/xchain-sdk

Running the Included Demo
To run the complete demo script (demo.ts) from this repository:
1. Setup
First, install the dependencies from the project's root directory.
# Install all dependencies from the project root
npm install

2. Run the Demo
The unified demo script can be run in different modes from the project root:
 * To run the core scripts (backend/CLI examples):
   This will execute demonstrations for features like balance checks and contract calls directly in your terminal.
<!-- end list -->
npm run start

 * To run the interactive dApp (frontend demo):
   This will start a local development server and open a web-based dApp in your browser to showcase client-side integration.
<!-- end list -->
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
MIT License

