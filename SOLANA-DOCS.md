

### **`SOLANA-DOCS.md`** (Combined: Specific Instance + Generic SDK)

```markdown
# XCHAIN-SDK: Solana Usage Guide

This guide covers interaction with the Solana blockchain using the XCHAIN-SDK. It explains both the simple method using pre-configured instances and the flexible method using the generic `SolanaSDK`.

## Installation

```bash
npm install @ixuxoinzo/xchain-sdk @solana/web3.js @solana/spl-token @metaplex-foundation/js bs58 bip39 ed25519-hd-key node-fetch dotenv
# or
yarn add @ixuxoinzo/xchain-sdk @solana/web3.js @solana/spl-token @metaplex-foundation/js bs58 bip39 ed25519-hd-key node-fetch dotenv
```

###Importing the SDK
Choose the import method based on your needs:
Method 1: Using Pre-configured Network Instances (Recommended for Simplicity)
Import the specific, named instance for the network you need directly from the /solana subpath. This is the simplest way if your application targets only one specific Solana network (mainnet, devnet, or testnet).
```typescript
// Example: Importing the Mainnet instance
import { Solana } from '@ixuxoinzo/xchain-sdk/solana';

// Example: Importing the Devnet instance
// import { SolanaDevnet } from '@ixuxoinzo/xchain-sdk/solana';

// Example: Importing the Testnet instance
// import { SolanaTestnet } from '@ixuxoinzo/xchain-sdk/solana';

// Import SolanaUtils or types if needed (can be from /solana or main entry)
import { SolanaUtils } from '@ixuxoinzo/xchain-sdk/solana';
import { type TokenInfo, type SolanaTransaction } from '@ixuxoinzo/xchain-sdk';

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables (e.g., SOLANA_PRIVATE_KEY)
```

Method 2: Using the Generic SolanaSDK (Flexible)
Import the main SolanaSDK class from the package's main entry point. Use this if you need to dynamically choose the network or use a custom RPC URL during runtime.
import { SolanaSDK, SolanaUtils, type SolanaNetwork, type WalletInfo } from '@ixuxoinzo/xchain-sdk'; // Import from main entry
import dotenv from 'dotenv';
dotenv.config();

## Initialization
For Method 1 (Specific Network Instance):
These instances (Solana, SolanaDevnet, SolanaTestnet) are pre-configured. They typically initialize themselves using a common private key found in your environment variables (e.g., process.env.SOLANA_PRIVATE_KEY) and the correct RPC for their network. Ensure your .env file contains the necessary SOLANA_PRIVATE_KEY. No manual instantiation is needed.
```typescript
// Just import and use. Assumes SOLANA_PRIVATE_KEY is in .env
console.log(`Using pre-configured Solana Devnet instance.`);
// import { SolanaDevnet } from '@ixuxoinzo/xchain-sdk/solana'; // Make sure to import it
// console.log(`Wallet Address: ${SolanaDevnet.getAddress()}`);
```
For Method 2 (Generic SolanaSDK):
You must create an instance, providing the private key and specifying the network.
```typescript
const solanaPrivateKey: string | Uint8Array = process.env.YOUR_SOLANA_PRIVATE_KEY || ''; // Base58 string or Uint8Array
const network: SolanaNetwork = 'devnet'; // 'mainnet', 'devnet', or 'testnet'
const customRpcUrl?: string = process.env.YOUR_CUSTOM_SOLANA_RPC_URL; // Optional

if (!solanaPrivateKey) {
  throw new Error('Solana Private Key is not set in environment variables.');
}

const sdkSolana = new SolanaSDK(solanaPrivateKey, network, customRpcUrl);

console.log(`Generic SolanaSDK Initialized for network: ${sdkSolana.getNetwork()}`);
console.log(`Wallet Address: ${sdkSolana.getAddress()}`);
```

## Core Functionalities (SolanaSDK instance)
The following methods are available on both the generic sdkSolana instance and the specific network instances (like Solana, SolanaDevnet). When using specific instances, operations target their pre-configured network.
Wallet Management
 * .getAddress(): string: Get the current wallet address (Base58 string).
 * .getPublicKey(): PublicKey: Get the wallet's PublicKey object.
 * .getNetwork(): SolanaNetwork: Get the current network ('mainnet', 'devnet', 'testnet').
 * SolanaSDK.createRandom(): WalletInfo: (Static) Create a new random Solana keypair and optional mnemonic.
 * SolanaSDK.fromMnemonic(mnemonic: string, path?: string): WalletInfo: (Static) Derive a keypair from a mnemonic phrase.
Native SOL Operations
 * .getBalance(address?: string): Promise<number>: Get SOL balance (in SOL units). If no address, gets own balance.
 * .transferSOL(to: string, amount: number, options?: { memo?: string; computeUnitPrice?: number; computeUnitLimit?: number; skipPreflight?: boolean; maxRetries?: number }): Promise<SolanaTransferResponse>: Send SOL to another address. amount is in SOL units.
SPL Token Operations
 * .getTokenBalance(mint: string, address?: string): Promise<number>: Get the balance of a specific SPL token for an address (human-readable units). If no address, gets own balance. Returns 0 if the token account doesn't exist.
 * .getTokenInfo(mint: string): Promise<TokenInfo>: Get details about an SPL token (name, symbol, decimals, total supply, own balance). May use Metaplex for name/symbol.
 * .transferSPLToken(mint: string, to: string, amount: number, options?: { decimals?: number; computeUnitPrice?: number; computeUnitLimit?: number; skipPreflight?: boolean; maxRetries?: number }): Promise<SolanaTokenTransferResponse>: Send SPL tokens. amount is in human-readable units. Automatically creates the destination token account if it doesn't exist. Fetches decimals if not provided.
NFT Operations (Metaplex)
 * .isMetaplexInitialized(): boolean: Check if the Metaplex instance was successfully initialized (needed for NFT operations).
 * .createNFT(metadata: { name: string; symbol: string; description: string; image: string | Buffer; attributes?: any[]; external_url?: string; seller_fee_basis_points?: number }, options?: { computeUnitPrice?: number; creators?: any[]; isMutable?: boolean; maxRetries?: number }): Promise<SolanaNFTMintResponse>: Create (mint) a new Metaplex NFT. Requires Metaplex to be initialized. Image can be a URL or a Buffer.
Price Oracles (Pyth, Jupiter, Birdeye)
 * .getTokenPrice(mintAddress: string, source?: 'auto' | 'pyth' | 'jupiter' | 'birdeye'): Promise<SolanaPriceData>: Get the price of a token from the specified source ('auto' tries Jupiter, then Birdeye, then Pyth).
 * .getPriceFromPyth(priceFeed: 'SOL_USD' | 'USDC_USD' | 'USDT_USD'): Promise<SolanaPriceData>: Get price directly from a known Pyth Network feed.
 * .getPriceFromJupiter(mintAddress: string): Promise<SolanaPriceData>: Get price using the Jupiter Aggregator API.
 * .getPriceFromBirdeye(mintAddress: string): Promise<SolanaPriceData>: Get price using the Birdeye API (requires BIRDEYE_API_KEY in environment for reliable use).
 * .getMultiplePrices(mintAddresses: string[], source?: 'jupiter' | 'birdeye'): Promise<SolanaPriceData[]>: Get prices for multiple tokens efficiently using Jupiter or Birdeye.
Transaction Operations & History
 * .getTransaction(signature: string): Promise<SolanaTransaction>: Get detailed information about a confirmed transaction by its signature.
 * .getTransactionHistory(address: string, limit?: number): Promise<SolanaHistoryItem[]>: Get a list of recent transaction signatures and basic info for an address.
 * .getRecentTransactions(address: PublicKey, limit?: number): Promise<SolanaTransaction[]>: Get recent transactions with more details (calls getTransaction internally).
 * .signTransaction(transaction: Transaction): Promise<Transaction>: Sign a partially built transaction object.
 * .sendTransaction(transaction: Transaction, signers?: Signer[]): Promise<string>: Send a signed transaction to the network and wait for confirmation. Returns the signature.
 * .simulateTransaction(transaction: Transaction): Promise<any>: Simulate a transaction without sending it to check for errors and estimate compute units.
Account Management & Info
 * .getAccountInfo(address: string): Promise<SolanaAccountInfo>: Get low-level account information (lamports, owner program, data).
 * .getTokenAccounts(address?: string): Promise<SolanaTokenAccount[]>: Get all SPL token accounts owned by an address, including mint, amount, and state. If no address, gets own accounts.
 * .getProgramAccounts(programId: string, filters?: any[]): Promise<any[]>: Find all accounts owned by a specific program, optionally applying filters.
Token Management (Creating & Minting SPL Tokens)
 * .createToken(decimals?: number, options?: { mintAuthority?: PublicKey; freezeAuthority?: PublicKey; computeUnitPrice?: number }): Promise<string>: Create a new SPL token type (mint). Returns the mint address. Requires SOL for rent.
 * .mintTokens(mint: string, to: string, amount: number): Promise<string>: Mint more supply of an existing SPL token to a specific address. Requires mint authority. amount is human-readable.
Utility Functions & Network Info
 * .isValidAddress(address: string): boolean: Check if a string is a valid Solana address format.
 * .getRecentBlockhash(): Promise<string>: Get the latest network blockhash (needed for transactions).
 * .getSlot(): Promise<number>: Get the current slot number on the network.
 * .getEpochInfo(): Promise<any>: Get information about the current epoch.
 * .getVersion(): Promise<any>: Get the version of the connected Solana RPC node.
Batch Operations
 * .getMultipleBalances(addresses: string[]): Promise<BalanceResult[]>: Get SOL balances for multiple addresses in parallel.
 * .getMultipleTokenBalances(mint: string, addresses: string[]): Promise<TokenBalance[]>: Get SPL token balances for multiple addresses in parallel.
Health Check
 * .healthCheck(): Promise<{ healthy: boolean; latency: number; slot: number }>: Check the connectivity and latency to the RPC endpoint.

## Utility Class (SolanaUtils)
These are static helper functions that can be called directly without needing a SolanaSDK instance. Import SolanaUtils either from the main package entry or from /solana.
```typescript
import { SolanaUtils } from '@ixuxoinzo/xchain-sdk/solana';

const isValid = SolanaUtils.validateAddress('So1111...');
const short = SolanaUtils.shortAddress('SomeLongAddress...', 6);
const sol = SolanaUtils.lamportsToSol(1e9);
const lamports = SolanaUtils.solToLamports(0.5);
const formatted = SolanaUtils.formatAmount(100 * 1e6, 6); // Format 100 USDC (6 decimals)
```
 * SolanaUtils.validateAddress(address: string): boolean: Check if a string is a valid Solana address format.
 * SolanaUtils.shortAddress(address: string, chars?: number): string: Truncate a Solana address (e.g., AbC...XyZ). chars defaults to 4.
 * SolanaUtils.lamportsToSol(lamports: number): number: Convert lamports to SOL.
 * SolanaUtils.solToLamports(sol: number): number: Convert SOL to lamports.
 * SolanaUtils.formatAmount(amount: number, decimals: number): string: Convert a raw token amount into a human-readable string based on decimals.
 * SolanaUtils.getPythPriceFeeds(): object: Get the map of known Pyth price feed addresses.
 * SolanaUtils.getTokenMappings(): object: Get the map of common token mint addresses (SOL, USDC, USDT, etc.) to their symbols.

### Example Usage (Recommended: Using Specific Instance)
// Example using Devnet instance
```typescript
import { SolanaDevnet } from '@ixuxoinzo/xchain-sdk/solana';
import { type SolanaTransferResponse } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config();

 function main() {
  try {
    // Assumes SolanaDevnet instance loads SOLANA_PRIVATE_KEY from .env
    const address = SolanaDevnet.getAddress();
    console.log(`Using Solana Devnet SDK Instance - Address: ${address}`);

    const balance = await SolanaDevnet.getBalance();
    console.log(`SOL Balance (Devnet): ${balance}`);

    // Example: Request Airdrop (Devnet/Testnet only)
    // Needs '@solana/web3.js' imported directly for Connection
    // import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
    // const connection = new Connection(SolanaDevnet.connection.rpcEndpoint); // Get underlying connection
    // console.log("Requesting airdrop...");
    // const airdropSig = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL);
    // await connection.confirmTransaction(airdropSig);
    // console.log("Airdrop confirmed. New balance:", await SolanaDevnet.getBalance());


    // Example Transaction (Devnet - Uncomment carefully)
    /*
    const recipient = 'RecipientDevnetAddress...'; // Replace with actual Devnet address
    const amount = 0.005; // Send 0.005 SOL
    console.log(`Sending ${amount} SOL to ${recipient} on Devnet...`);
    const tx: SolanaTransferResponse = await SolanaDevnet.transferSOL(recipient, amount);
    console.log(`Sent ${amount} SOL. Tx Signature: ${tx.signature}`);
    */

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
```

### Alternative Usage (Generic SolanaSDK)
This is useful if you need to choose the network dynamically.
```typescript
import { SolanaSDK, type SolanaNetwork } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config();

const network: SolanaNetwork = 'testnet'; // Choose network dynamically
const sdkSolana = new SolanaSDK(process.env.SOLANA_PRIVATE_KEY!, network);

async function checkBalance() {
  console.log(`Checking balance on ${sdkSolana.getNetwork()}`);
  const balance = await sdkSolana.getBalance();
  console.log(`Balance: ${balance} SOL`);
}

checkBalance();
```

