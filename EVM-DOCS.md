
EVM-DOCS.md (Combined: Specific Instance + Generic SDK)
# XCHAIN-SDK: EVM Usage Guide

This guide covers interaction with EVM-compatible blockchains using the XCHAIN-SDK. It explains both the simple method using pre-configured instances and the flexible method using the generic `EVMSDK`.

## Installation

```bash
npm install @ixuxoinzo/xchain-sdk ethers dotenv
# or
yarn add @ixuxoinzo/xchain-sdk ethers dotenv
``` 


## Importing the SDK
Choose the import method based on your needs:
Method 1: Using Pre-configured Chain Instances (Recommended for Single-Chain Focus)
Import the specific, named instance for the chain you need directly from the /evm subpath. This is the simplest way if your application primarily targets one specific EVM chain.

```typescript
// Example: Importing the Polygon instance
import { Polygon } from '@ixuxoinzo/xchain-sdk/evm';

// Example: Importing the Ethereum instance
// import { Ethereum } from '@ixuxoinzo/xchain-sdk/evm';

// Example: Importing the Blast instance
// import { Blast } from '@ixuxoinzo/xchain-sdk/evm';

// Import types if needed (usually from the main entry point)
import { type TokenInfo, type TransactionResponse } from '@ixuxoinzo/xchain-sdk';

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables (e.g., EVM_PRIVATE_KEY)
```

Method 2: Using the Generic EVMSDK (Flexible, Multi-Chain)
Import the main EVMSDK class from the package's main entry point. Use this if you need to switch between different EVM chains dynamically or require more control over initialization.

```typescript
import { EVMSDK, type Chain, type WalletInfo } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables like private key
```

## Initialization
For Method 1 (Specific Chain Instance):
These instances (Polygon, Ethereum, etc.) are pre-configured. They typically initialize themselves using a common private key (e.g., process.env.EVM_PRIVATE_KEY) and the correct RPC for their chain. Ensure your .env file contains the necessary EVM_PRIVATE_KEY. No manual instantiation is needed.

```typescript
// Just import and use. Assumes EVM_PRIVATE_KEY is in .env
console.log(`Using pre-configured Polygon instance.`);
console.log(`Wallet Address: ${Polygon.getAddress()}`);
```

For Method 2 (Generic EVMSDK):
You must create an instance, providing the private key and the initial chain.

```typescript
const evmPrivateKey: string = process.env.YOUR_EVM_PRIVATE_KEY || '';
const initialChain: Chain = 'ETHEREUM'; // Or 'POLYGON', 'ARBITRUM', etc.
const customRpcUrl?: string = process.env.YOUR_CUSTOM_RPC_URL; // Optional

if (!evmPrivateKey) {
  throw new Error('EVM Private Key is not set in environment variables.');
}

const sdkEVM = new EVMSDK(evmPrivateKey, initialChain, customRpcUrl);

console.log(`Generic EVMSDK Initialized for chain: ${sdkEVM.getCurrentChain()}`);
console.log(`Wallet Address: ${sdkEVM.getAddress()}`);
```

## Core Functionalities
The following methods are available on both the generic sdkEVM instance and the specific chain instances (like Polygon, Ethereum).
 * When using specific instances (e.g., Polygon), operations automatically target that chain.
 * When using the generic sdkEVM, operations target the currently active chain (set during initialization or via .switchChain()).
Wallet Management
 * .getAddress(): string: Get the current wallet address.
 * .getPublicKey(): Promise<string>: Get the public key.
 * .getTransactionCount(): Promise<number>: Get the transaction count (nonce).
 * .signMessage(message: string): Promise<string>: Sign a string message.
 * .signTransaction(transaction: TransactionRequest): Promise<string>: Sign a raw transaction.
 * .verifySignature(message: string, signature: string): Promise<string>: Verify a signed message.
 * EVMSDK.createRandom(): WalletInfo: (Static) Create a new random EVM wallet.
 * EVMSDK.fromMnemonic(mnemonic: string, path?: string): WalletInfo: (Static) Derive a wallet from a mnemonic phrase.
 * EVMSDK.fromEncryptedJson(json: string, password: string): Promise<WalletInfo>: (Static) Decrypt a wallet from Keystore JSON.
Chain & Network Management
 * .switchChain(chain: Chain, customRpcUrl?: string): void: (Generic EVMSDK only) Switch the active chain and RPC URL.
 * .getCurrentChain(): Chain: Get the currently active chain.
 * .getProvider(): JsonRpcProvider: Get the underlying Ethers.js provider instance.
 * .getNetworkInfo(): Get details about the current network (ID, Name, RPC, Explorer).
 * .getChainId(): Promise<number>: Get the Chain ID of the current network.
Native Token Operations (ETH, MATIC, etc.)
 * .getNativeBalance(address?: string): Promise<string>: Get native token balance (formatted string, e.g., "1.23").
 * .getNativeBalanceWei(address?: string): Promise<bigint>: Get native token balance (wei, bigint).
 * .transferNative(to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Send native tokens. amount is a formatted string (e.g., "0.5").
ERC20 Token Operations
 * .getTokenBalance(tokenAddress: string, address?: string): Promise<string>: Get ERC20 token balance (formatted string).
 * .getTokenBalanceWei(tokenAddress: string, address?: string): Promise<bigint>: Get ERC20 token balance (atomic units, bigint).
 * .getTokenInfo(tokenAddress: string): Promise<TokenInfo>: Get token details (name, symbol, decimals, total supply, balance).
 * .transferToken(tokenAddress: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Send ERC20 tokens. amount is a formatted string.
 * .approveToken(tokenAddress: string, spender: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Approve spender to transfer tokens. amount is a formatted string.
 * .getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string>: Check allowance given to a spender (formatted string).
 * .transferFromToken(tokenAddress: string, from: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer tokens on behalf of another address (requires allowance).
ERC721 NFT Operations
 * .getNFTBalance(contractAddress: string, address?: string): Promise<number>: Get the number of NFTs owned by an address.
 * .getNFTOwner(contractAddress: string, tokenId: number): Promise<string>: Get the owner of a specific NFT.
 * .getNFTUri(contractAddress: string, tokenId: number): Promise<string>: Get the token URI (metadata link) of an NFT.
 * .getNFTInfo(contractAddress: string, tokenId: number): Promise<NFTInfo>: Get combined NFT info (owner, URI, name, symbol).
 * .transferNFT(contractAddress: string, to: string, tokenId: number, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer an NFT (using transferFrom).
 * .safeTransferNFT(contractAddress: string, to: string, tokenId: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Safely transfer an NFT (using safeTransferFrom).
 * .setNFTApproval(contractAddress: string, operator: string, approved?: boolean, overrides?: TransactionRequest): Promise<TransactionResponse>: Approve an operator for all NFTs (using setApprovalForAll).
 * .getNFTApproval(contractAddress: string, tokenId: number): Promise<string>: Get the approved address for a specific NFT.
 * .isNFTApprovedForAll(contractAddress: string, owner: string, operator: string): Promise<boolean>: Check if an operator is approved for all NFTs.
ERC1155 Multi-Token Operations
 * .getERC1155Balance(contractAddress: string, tokenId: number, address?: string): Promise<number>: Get the balance of a specific token ID for an address.
 * .getERC1155BalanceBatch(contractAddress: string, tokenIds: number[], addresses: string[]): Promise<number[]>: Get balances for multiple token IDs and addresses.
 * .transferERC1155(contractAddress: string, to: string, tokenId: number, amount: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer ERC1155 tokens (using safeTransferFrom).
 * .batchTransferERC1155(contractAddress: string, to: string, tokenIds: number[], amounts: number[], data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer multiple ERC1155 tokens (using safeBatchTransferFrom).
 * .getERC1155Uri(contractAddress: string, tokenId: number): Promise<string>: Get the URI for a specific token ID.
Generic Contract Interaction
 * .readContract(contractAddress: string, abi: any[], functionName: string, args?: any[]): Promise<any>: Call a read-only (view or pure) function on any contract.
 * .writeContract(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Call a write function on any contract (sends a transaction). value is optional native token amount to send (formatted string).
 * .deployContract(abi: any[], bytecode: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Deploy a new smart contract. Returns the transaction response containing the new contract address upon confirmation.
 * .getContractCode(contractAddress: string): Promise<string>: Get the deployed bytecode of a contract.
 * .isContract(address: string): Promise<boolean>: Check if an address has deployed code.
Gas & Fee Operations
 * .getGasPrice(): Promise<string>: Get the current gas price (legacy, Gwei string).
 * .getFeeData(): Promise<FeeDataInterface>: Get EIP-1559 fee data (maxFeePerGas, maxPriorityFeePerGas, Gwei strings).
 * .getGasPriceTiers(): Promise<GasPriceData>: Get suggested gas prices for different speeds (slow, standard, fast, Gwei strings).
 * .estimateGas(to: string, value?: string, data?: string): Promise<string>: Estimate gas limit for a simple transfer or contract call.
 * .estimateContractGas(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string): Promise<string>: Estimate gas limit for a specific contract function call.
 * .estimateTransactionCost(to: string, value?: string, data?: string): Promise<{ gasLimit: string; gasCost: string; totalCost: string }>: Estimate gas limit, gas cost (native token), and total cost (native token).
Blockchain Data & Transactions
 * .getBlockNumber(): Promise<number>: Get the latest block number.
 * .getBlock(blockNumber: number | string): Promise<Block | null>: Get details about a specific block.
 * .getTransaction(txHash: string): Promise<EVMTransaction | null>: Get details about a specific transaction.
 * .getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>: Get the receipt of a mined transaction (status, logs, gas used).
 * .getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'>: Quickly check the status of a transaction.
 * .waitForTransaction(txHash: string, confirmations?: number): Promise<TransactionReceipt | null>: Wait for a transaction to be mined with a specific number of confirmations.
Events & Logs
 * .getPastEvents(contractAddress: string, abi: any[], eventName: string, fromBlock?: number, toBlock?: number | string): Promise<EVMEventLog[]>: Query past event logs from a contract.
 * .listenEvents(contractAddress: string, abi: any[], eventName: string, callback: (event: EVMEventLog) => void): Promise<() => void>: Listen for real-time events from a contract. Returns an unsubscribe function.
 * .getLogs(filter: EventFilter): Promise<EVMEventLog[]>: Generic log query using filters (address, topics, block range).
Advanced Features & Utilities
 * .multicall(calls: MulticallRequest[]): Promise<MulticallResponse[]>: Execute multiple read calls in a single RPC request (requires Multicall contract deployed on the chain).
 * .tryMulticall(calls: MulticallRequest[]): Promise<MulticallResponse[]>: Similar to multicall, but allows individual calls to fail without reverting the whole batch.
 * .getSwapQuote(fromToken: string, toToken: string, amount: string, slippage?: number): Promise<SwapQuote>: Get an estimated quote for swapping tokens on a supported DEX (e.g., Uniswap V2).
 * .swapTokens(fromToken: string, toToken: string, amount: string, slippage?: number, overrides?: TransactionRequest): Promise<TransactionResponse>: Execute a token swap on a supported DEX (requires token approval).
 * .getPoolInfo(poolAddress: string): Promise<PoolInfo>: Get information about a DEX liquidity pool.
 * .getLatestPrice(priceFeedAddress: string): Promise<string>: Get the latest price from a Chainlink price feed contract.
 * .scanContractSecurity(contractAddress: string): Promise<SecurityScanResult>: Perform a basic security check on a contract address.
 * .optimizeGas(transaction: TransactionRequest): Promise<TransactionRequest>: Suggest potentially optimized gas parameters for a transaction.
 * .resolveENS(ensName: string): Promise<string>: Resolve an ENS name to an address (Mainnet only).
 * .lookupAddress(address: string): Promise<string>: Lookup the primary ENS name for an address (Mainnet only).
 * .healthCheck(): Promise<{ healthy: boolean; latency: number; blockNumber: number }>: Check the health and latency of the connected RPC endpoint.
 * .batchTransferNative(transfers: { to: string; amount: string }[], overrides?: TransactionRequest): Promise<TransactionResponse[]>: Send native tokens to multiple recipients in sequence.
 * .getMultipleBalances(addresses: string[]): Promise<BalanceResult[]>: Get native balances for multiple addresses.
 * .getMultipleTokenBalances(tokenAddress: string, addresses: string[]): Promise<TokenBalance[]>: Get token balances for multiple addresses.

## Example Usage (Recommended: Using Specific Instance)
```typescript
import { Polygon } from '@ixuxoinzo/xchain-sdk/evm'; // Import the desired instance
import { type TransactionResponse } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    // Assumes Polygon instance loads EVM_PRIVATE_KEY from .env
    const address = Polygon.getAddress();
    console.log(`Using Polygon SDK Instance - Address: ${address}`);

    const balance = await Polygon.getNativeBalance();
    console.log(`MATIC Balance: ${balance}`);

    // Example Transaction (Uncomment to run)
    /*
    const recipient = '0xRecipientAddress...';
    const amount = '0.01';
    const tx: TransactionResponse = await Polygon.transferNative(recipient, amount);
    console.log(`Sent ${amount} MATIC. Tx Hash: ${tx.hash}`);
    */

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
```
### Alternative Usage (Generic EVMSDK with switchChain)
This is useful if you need one SDK object to handle multiple chains dynamically.
```typescript
import { EVMSDK, type Chain } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config();

const sdkMultiEVM = new EVMSDK(process.env.EVM_PRIVATE_KEY!, 'ETHEREUM');

async function checkMultiChain() {
  const address = sdkMultiEVM.getAddress();

  console.log(`Checking ${sdkMultiEVM.getCurrentChain()}:`, await sdkMultiEVM.getNativeBalance());

  sdkMultiEVM.switchChain('POLYGON');
  console.log(`Checking ${sdkMultiEVM.getCurrentChain()}:`, await sdkMultiEVM.getNativeBalance());

  sdkMultiEVM.switchChain('ARBITRUM');
  console.log(`Checking ${sdkMultiEVM.getCurrentChain()}:`, await sdkMultiEVM.getNativeBalance());
}

checkMultiChain();
```