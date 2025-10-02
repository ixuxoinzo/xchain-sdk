```markdown
# 🚀 XChain SDK - Multi-Chain Blockchain SDK

**Enterprise-grade SDK for Ethereum, 13 L2 networks, and Solana**

## 🌟 Features

### 🛠 **Complete Multi-Chain Support**
- **Ethereum** + **13 L2 Networks**: Optimism, Arbitrum, Base, Polygon, zkSync, Linea, Scroll, Mantle, Metis, Blast
- **Solana** with full SPL token and NFT support
- **Unified API** across all chains

## 🚀 Quick Start

### Installation

```bash
npm install @ixuxoinzo/xchain-sdk
```

Basic Usage

```typescript
import { XChainSDK } from '@ixuxoinzo/xchain-sdk';

// Initialize SDK
const sdk = new XChainSDK();

// Transfer tokens
const tx = await sdk.transferToken(
  'ethereum',
  '0xYourAddress',
  '0xRecipientAddress',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '1000000' // 1 USDC
);

console.log('Transaction:', tx.hash);
```

Frontend Usage (User Wallets)

```typescript
import { FrontendSDK } from '@ixuxoinzo/xchain-sdk';

const sdk = new FrontendSDK();
await sdk.connectEVM();

// Transfer native token
const tx = await sdk.transferNativeEVM('0xReceiver...', '0.001');
console.log('Transaction:', tx.hash);
```

Backend Usage (Server Wallets)

```typescript
import { BackendSDK } from '@ixuxoinzo/xchain-sdk';

const sdk = new BackendSDK({
  evmPrivateKey: process.env.EVM_PRIVATE_KEY
});

// Transfer from server wallet
const tx = await sdk.transferNativeEVM('0xUserAddress...', '0.01', 'POLYGON');
console.log('Transaction:', tx.hash);
```

📚 Examples

1. Multi-Chain Balance Check

```typescript
const balances = await sdk.getBalancesAllChains('0xUserAddress...');

balances.forEach(({ chain, balance, symbol }) => {
  console.log(`${chain}: ${balance} ${symbol}`);
});
```

2. NFT Operations

```typescript
// Get NFT balance
const nftBalance = await sdk.getNFTBalance('0xNFTContract...');

// Mint NFT
const nft = await sdk.mintNFT(
  'ethereum',
  '0xNFTContract...',
  '0xRecipient...',
  'https://api.com/token/1'
);
```

3. Smart Contract Interactions

```typescript
// Read contract
const balance = await sdk.readContract(
  'ethereum',
  '0xContract...',
  'balanceOf',
  ['0xUser...']
);

// Write contract
const result = await sdk.writeContract(
  'polygon',
  '0xContract...',
  'transfer',
  ['0xReceiver...', '1000000']
);
```

4. Event Listening

```typescript
sdk.onEvent(
  'ethereum',
  '0xToken...',
  'Transfer',
  (from, to, value) => {
    console.log(`Transfer: ${value} from ${from} to ${to}`);
  }
);
```

🔧 Configuration

```typescript
const sdk = new XChainSDK({
  network: 'mainnet',
  privateKey: process.env.PRIVATE_KEY,
  rpcUrls: {
    ethereum: process.env.ETH_RPC,
    polygon: process.env.POLYGON_RPC,
    solana: process.env.SOLANA_RPC
  }
});
```

🌐 Supported Chains

· Ethereum, Optimism, Arbitrum, Base, Polygon
· zkSync, StarkNet, Linea, Scroll, Mantle
· Metis, Blast, Solana

📞 Support

· GitHub: https://github.com/ixuxoinzo/xchain-sdk
· Issues: GitHub Issues

📄 License

MIT License

```
