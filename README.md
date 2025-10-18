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
The code in xchain-sdk is not only clean, but deliberately designed to be easy to understand. We name variables and functions explicitly so that developers can immediately understand what each line of code does. Our goal is for you to be **productive in minutes, not hours.**

---

# ✨ CORE SDK FEATURES

The xChain SDK provides a **Unified API** for seamless and efficient interactions across all supported chains.

### ⛓️ Multi-Chain & Protocol Support
* **EVM Chains:** Full support for **Ethereum,** **25+ Leading L2s,** and EVM sidechains.
* **Solana Ecosystem:** Complete support for native **SOL**, **SPL Tokens**, and **NFTs**.
* **Unified API:** One simple interface for complex multi-chain operations.

### 💰 Native & Token Operations
* **Balance Retrieval:** Get native coin (ETH, MATIC, SOL, etc.) and token (ERC20/SPL) balances.
* **Transfers:** Execute transfers for native coins and ERC20/SPL tokens.
* **Token Data:** Fetch comprehensive token information (name, symbol, decimals, total supply).

### 🖼️ NFT Management
* **Ownership:** Get ERC721/SPL NFT balances and determine the owner of a specific NFT.
* **Viewing:** Easily view NFTs owned by any public address.
* **Minting:** Support for minting new ERC721/SPL NFTs (requires specific contract logic or Metaplex setup).

### 📝 Smart Contract Interaction (EVM)
* **Read Calls:** Effortlessly read data from any EVM smart contract (e.g., `balanceOf`, `symbol`).
* **Write Transactions:** Execute transactions to any EVM smart contract (e.g., `transfer`, `approve`).
* **Multicall:** Built-in functionality for efficient batching of multiple read operations on EVM chains.

### 📡 Network Utilities & Health
* **Chain Data:** Get the current block number/slot and retrieve transaction history for Solana.
* **Gas & Fees:** Fetch current gas prices/fee data and estimate gas for EVM transactions.
* **Health Checks:** Comprehensive health checks for RPC endpoints covering latency and block synchronization.
* **Real-time:** Event listening capabilities for real-time updates on EVM chains.

### 🔑 Wallet Management
* **Generation:** Generate new random EVM and Solana wallets securely.
* **Key Security:** Securely manage private keys for robust backend operations.
* **Frontend Integration:** Designed for easy integration with popular frontend wallet extensions (MetaMask, Phantom, etc.).

---



# 📚 Getting Started & Full Documentation

This README provides a high-level overview. All detailed Quick Start guides, configuration instructions, API references, and code examples have been moved to dedicated documentation files for clarity.

### 1. Installation

Install the SDK via NPM:

```bash
npm install @ixuxoinzo/xchain-sdk
```

### 2. Dive Into The Docs
Follow the link below that corresponds to your immediate goal:

| Documentation Topic | Content Focus | Link |
|---|---|---|
| Solana SDK Docs | QUICK START guide and API reference for Solana operations. | ➡️ [VIEW SOLANA-DOCS.md](./SOLANA-DOCS.md) |
| EVM SDK Docs | QUICK START guide and API reference for EVM operations & Smart Contract interaction. | ➡️ [VIEW EVM-DOCS.md](./EVM-DOCS.md) |
| Demo Script | Step-by-step guide to running the repository's included demo scripts. | ➡️ [VIEW DEMO-DOCS.md](./DEMO-DOCS.md) |



#🛣️ OFFICIAL PROJECT ROADMAP & VISION

## I. XCHAIN SDK - CORE (Stable V2.0.0 - Complete)
The XChain SDK Core has achieved V2.0.0, completing the fundamental Multi-Chain (EVM & Solana) and comprehensive Transaction Handling layers.
| Status | Feature (V1.0 - V2.0 Upgrade) | Notes |
|---|---|---|
| ✅ | Multi-Chain Infrastructure | Finalized Setup of 25+ EVM chains and Solana, including RPC failover. |
| ✅ | Full Transaction Handler | Complete implementation of stable sendTransaction and Contract Write capabilities. |
| ✅ | Liquidity & NFT Abstraction | Completed integration of DEX (Uniswap V2) and NFT (ERC-721/1155) standards. |
| ✅ | Hardening & Documentation | Deeper EIP-712 abstraction and finalization of all V2.0.0 documentation. |
## II. 🚀 PRO VISION: DEFI & SDK AUTOMATION STRENGTHENING (V2.1 - V2.5 Focus)
The main focus is to maximize the value of the V2.0.0 feature set by implementing advanced DeFi and Automation functionalities internally, boosting product competitiveness.
### ⚙️ V2 VALUE DEVELOPMENT MILESTONES (EVM & Scalability)
| Status | Milestone | Key Deliverable |
|---|---|---|
| [🟠] Automation V2.1 | Batch Transaction & Scheduling Module | Build service layers on top of batchTransferNative to support Scheduled Batch Transactions and Conditional Transfers for automated processes. |
| [🟠] DeFi V2.2 | Automated Liquidity Provision (LPM) | Implement a simplified interface over Liquidity Pool Management (LPM) functions (e.g., addLiquidity and removeLiquidity) for supported EVM DEXs. |
| [🟠] EVM Advanced V2.3 | Account Abstraction (EIP-4337) Support | Implement APIs to interact with bundlers and paymasters, unlocking gasless and smart wallet functionalities on EVM chains. |
| [🟠] Scalability V2.4 | High-Level Logging & Observability | Extend Error Handling and Logging in the backend to provide the visibility and debuggability necessary for scaling high-volume EVM operations. |
| [🟠] Expansion V2.5 | New Chain Integration Process | Establish a rapid and well-documented process for adding new EVM chains on-demand as they gain market relevance. |
## III. 🌉 ULTIMATE VISION & SOLANA EXPANSION (Requires New Funding)
This phase is isolated and will be activated only after sufficient multi-chain funding is secured.
 * Solana Expansion: Full development of the Anchor Program Abstraction Layer and other advanced Solana features.
 * Asset Translator: Development of the Generalized Messaging System to enable "any-to-any" token transfers between EVM and Solana ecosystems.
### ⭐ CALL TO ACTION: Seeking Funding & Strategic Partners!
Our current focus is to secure partners who can fund this complex infrastructure. We are prepared to build high value internally until that time comes. Let's connect!


### for the multi-chain world, let's connect!
## 🌐 Supported Chains (25+ EVM Networks)

### EVM Chains
- Ethereum
- Optimism
- Arbitrum 
- Base
- Polygon POS
- Polygon zkEVM
- zkSync Era
- Linea
- Scroll
- Mantle
- Metis
- Blast
- Avalanche C-Chain (AVAX)
- BNB Smart Chain (BSC)
- Fantom Opera
- Celo
- Moonbeam
- Moonriver
- Cronos
- Aurora
- Gnosis Chain
- Monad
- Somnia
- Manta Pacific
- opBNB Mainnet

### Solana Networks
- Solana Mainnet Beta
- Solana Devnet
- Solana Testnet


## 📞 Support & License

* **GitHub Repository:** [https://github.com/ixuxoinzo/xchain-sdk](https://github.com/ixuxoinzo/xchain-sdk)  
* **Report Issues:** [Open a GitHub Issue](https://github.com/ixuxoinzo/xchain-sdk/issues)

## 🙏 Donations Supported
 * EVM Chains (ETH, USDC, USDT, etc.): 0xFBA061EA80d3593e3AF1430ad2050729b59362D9
 * Solana (SOL, USDC, etc.): 9ShXRhekCCnbN9bbQ9wXoq1KCfNQZ4uydXvmC9LPStBZ


📄 License
MIT License

