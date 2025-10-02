

XChain SDK

<div align="center">

Multi-Chain SDK for Ethereum, 13 L2 Networks, and Solana
One SDK for all chains - Simple, Fast, Production Ready

https://img.shields.io/badge/version-1.0.0-blue
https://img.shields.io/badge/license-MIT-green
https://img.shields.io/badge/chains-15+-orange

</div>

🚀 Quick Start

Installation

```bash
npm install @ixuxoinzo/xchain-sdk
```

Basic Usage

```javascript
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

📖 Complete Examples

1. Multi-Chain Portfolio

```javascript
// Get balances across all chains
const portfolio = await sdk.getMultiChainPortfolio('0xUserAddress');

console.log('Ethereum:', portfolio.ethereum.native, 'ETH');
console.log('Polygon:', portfolio.polygon.native, 'MATIC'); 
console.log('Solana:', portfolio.solana.native, 'SOL');
```

2. NFT Operations

```javascript
// Mint NFT on Ethereum
const nft = await sdk.mintNFT(
  'ethereum',
  '0xNFTContract',
  '0xRecipient',
  'https://api.com/token/1'
);

// Get NFT balance
const balance = await sdk.getNFTBalance('ethereum', '0xUser', '0xNFTContract');
```

3. Smart Contract Interactions

```javascript
// Read contract
const balance = await sdk.readContract(
  'ethereum',
  '0xTokenAddress',
  'balanceOf',
  ['0xUserAddress']
);

// Write contract  
const result = await sdk.writeContract(
  'polygon',
  '0xContract',
  'transfer',
  ['0xRecipient', '1000000']
);
```

4. Event Listening

```javascript
// Listen to transfers
sdk.onEvent(
  'ethereum',
  '0xTokenAddress', 
  'Transfer',
  (from, to, amount) => {
    console.log(`Transfer: ${amount} from ${from} to ${to}`);
  }
);
```

5. Batch Transactions

```javascript
import { BatchProcessor } from '@ixuxoinzo/xchain-sdk';

const batch = new BatchProcessor(sdk);

// Multiple transfers in one transaction
const results = await batch.batchTransfers('ethereum', [
  {
    from: '0xSender',
    to: '0xRecipient1', 
    token: '0xUSDC',
    amount: '1000000'
  },
  {
    from: '0xSender',
    to: '0xRecipient2',
    token: '0xUSDC', 
    amount: '2000000'
  }
]);
```

🔧 Configuration

Basic Setup

```javascript
const sdk = new XChainSDK({
  network: 'mainnet', // or 'testnet'
  privateKey: process.env.PRIVATE_KEY, // optional
  rpcUrls: {
    ethereum: process.env.ETH_RPC,
    polygon: process.env.POLYGON_RPC,
    solana: process.env.SOLANA_RPC
  }
});
```

🌐 Supported Chains

· Ethereum
· Optimism
· Arbitrum
· Base
· Polygon
· zkSync
· StarkNet
· Linea
· Scroll
· Mantle
· Metis
· Blast
· Solana

📞 Need Help?

· Docs: https://github.com/ixuxoinzo/xchain-sdk
· Issues: GitHub Issues
· Email: ixuxoinzo@gmail.com

📄 License

MIT © ixuxoinzo

---

