
# XCHAIN-SDK: EVM Usage Guide

## Installation

```bash
npm install @ixuxoinzo/xchain-sdk ethers dotenv
# or
yarn add @ixuxoinzo/xchain-sdk ethers dotenv

Basic Import and Initialization
import { EVMSDK, type Chain, type WalletInfo, type TokenInfo, type TransactionResponse, type EVMTransaction } from '@ixuxoinzo/xchain-sdk';
import dotenv from 'dotenv';
dotenv.config();

const evmPrivateKey: string = process.env.YOUR_EVM_PRIVATE_KEY || '';
const defaultChain: Chain = 'ETHEREUM'; // e.g., 'ETHEREUM', 'POLYGON', 'ARBITRUM'
const customRpcUrl?: string = process.env.YOUR_CUSTOM_RPC_URL; // Optional

if (!evmPrivateKey) {
  throw new Error('EVM Private Key is not set in environment variables.');
}

const sdkEVM = new EVMSDK(evmPrivateKey, defaultChain, customRpcUrl);

console.log(`EVMSDK Initialized for chain: ${sdkEVM.getCurrentChain()}`);
console.log(`Wallet Address: ${sdkEVM.getAddress()}`);

Core Functionalities
Wallet Management
 * sdkEVM.getAddress(): string: Get the current wallet address.
 * sdkEVM.getPublicKey(): Promise<string>: Get the public key.
 * sdkEVM.getTransactionCount(): Promise<number>: Get the transaction count (nonce).
 * sdkEVM.signMessage(message: string): Promise<string>: Sign a string message.
 * sdkEVM.signTransaction(transaction: TransactionRequest): Promise<string>: Sign a raw transaction.
 * sdkEVM.verifySignature(message: string, signature: string): Promise<string>: Verify a signed message.
 * EVMSDK.createRandom(): WalletInfo: (Static) Create a new random EVM wallet.
 * EVMSDK.fromMnemonic(mnemonic: string, path?: string): WalletInfo: (Static) Derive a wallet from a mnemonic phrase.
 * EVMSDK.fromEncryptedJson(json: string, password: string): Promise<WalletInfo>: (Static) Decrypt a wallet from Keystore JSON.
Chain & Network Management
 * sdkEVM.switchChain(chain: Chain, customRpcUrl?: string): void: Switch the active chain and RPC URL.
 * sdkEVM.getCurrentChain(): Chain: Get the currently active chain.
 * sdkEVM.getProvider(): JsonRpcProvider: Get the underlying Ethers.js provider instance.
 * sdkEVM.getNetworkInfo(): Get details about the current network (ID, Name, RPC, Explorer).
 * sdkEVM.getChainId(): Promise<number>: Get the Chain ID of the current network.
Native Token Operations (ETH, MATIC, etc.)
 * sdkEVM.getNativeBalance(address?: string): Promise<string>: Get native token balance (formatted string, e.g., "1.23").
 * sdkEVM.getNativeBalanceWei(address?: string): Promise<bigint>: Get native token balance (wei, bigint).
 * sdkEVM.transferNative(to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Send native tokens. amount is a formatted string (e.g., "0.5").
ERC20 Token Operations
 * sdkEVM.getTokenBalance(tokenAddress: string, address?: string): Promise<string>: Get ERC20 token balance (formatted string).
 * sdkEVM.getTokenBalanceWei(tokenAddress: string, address?: string): Promise<bigint>: Get ERC20 token balance (atomic units, bigint).
 * sdkEVM.getTokenInfo(tokenAddress: string): Promise<TokenInfo>: Get token details (name, symbol, decimals, total supply, balance).
 * sdkEVM.transferToken(tokenAddress: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Send ERC20 tokens. amount is a formatted string.
 * sdkEVM.approveToken(tokenAddress: string, spender: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Approve spender to transfer tokens. amount is a formatted string.
 * sdkEVM.getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string>: Check allowance given to a spender (formatted string).
 * sdkEVM.transferFromToken(tokenAddress: string, from: string, to: string, amount: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer tokens on behalf of another address (requires allowance).
ERC721 NFT Operations
 * sdkEVM.getNFTBalance(contractAddress: string, address?: string): Promise<number>: Get the number of NFTs owned by an address.
 * sdkEVM.getNFTOwner(contractAddress: string, tokenId: number): Promise<string>: Get the owner of a specific NFT.
 * sdkEVM.getNFTUri(contractAddress: string, tokenId: number): Promise<string>: Get the token URI (metadata link) of an NFT.
 * sdkEVM.getNFTInfo(contractAddress: string, tokenId: number): Promise<NFTInfo>: Get combined NFT info (owner, URI, name, symbol).
 * sdkEVM.transferNFT(contractAddress: string, to: string, tokenId: number, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer an NFT (using transferFrom).
 * sdkEVM.safeTransferNFT(contractAddress: string, to: string, tokenId: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Safely transfer an NFT (using safeTransferFrom).
 * sdkEVM.setNFTApproval(contractAddress: string, operator: string, approved?: boolean, overrides?: TransactionRequest): Promise<TransactionResponse>: Approve an operator for all NFTs (using setApprovalForAll).
 * sdkEVM.getNFTApproval(contractAddress: string, tokenId: number): Promise<string>: Get the approved address for a specific NFT.
 * sdkEVM.isNFTApprovedForAll(contractAddress: string, owner: string, operator: string): Promise<boolean>: Check if an operator is approved for all NFTs.
ERC1155 Multi-Token Operations
 * sdkEVM.getERC1155Balance(contractAddress: string, tokenId: number, address?: string): Promise<number>: Get the balance of a specific token ID for an address.
 * sdkEVM.getERC1155BalanceBatch(contractAddress: string, tokenIds: number[], addresses: string[]): Promise<number[]>: Get balances for multiple token IDs and addresses.
 * sdkEVM.transferERC1155(contractAddress: string, to: string, tokenId: number, amount: number, data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer ERC1155 tokens (using safeTransferFrom).
 * sdkEVM.batchTransferERC1155(contractAddress: string, to: string, tokenIds: number[], amounts: number[], data?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Transfer multiple ERC1155 tokens (using safeBatchTransferFrom).
 * sdkEVM.getERC1155Uri(contractAddress: string, tokenId: number): Promise<string>: Get the URI for a specific token ID.
Generic Contract Interaction
 * sdkEVM.readContract(contractAddress: string, abi: any[], functionName: string, args?: any[]): Promise<any>: Call a read-only (view or pure) function on any contract.
 * sdkEVM.writeContract(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Call a write function on any contract (sends a transaction). value is optional native token amount to send (formatted string).
 * sdkEVM.deployContract(abi: any[], bytecode: string, args?: any[], value?: string, overrides?: TransactionRequest): Promise<TransactionResponse>: Deploy a new smart contract. Returns the transaction response containing the new contract address upon confirmation.
 * sdkEVM.getContractCode(contractAddress: string): Promise<string>: Get the deployed bytecode of a contract.
 * sdkEVM.isContract(address: string): Promise<boolean>: Check if an address has deployed code.
Gas & Fee Operations
 * sdkEVM.getGasPrice(): Promise<string>: Get the current gas price (legacy, Gwei string).
 * sdkEVM.getFeeData(): Promise<FeeDataInterface>: Get EIP-1559 fee data (maxFeePerGas, maxPriorityFeePerGas, Gwei strings).
 * sdkEVM.getGasPriceTiers(): Promise<GasPriceData>: Get suggested gas prices for different speeds (slow, standard, fast, Gwei strings).
 * sdkEVM.estimateGas(to: string, value?: string, data?: string): Promise<string>: Estimate gas limit for a simple transfer or contract call.
 * sdkEVM.estimateContractGas(contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string): Promise<string>: Estimate gas limit for a specific contract function call.
 * sdkEVM.estimateTransactionCost(to: string, value?: string, data?: string): Promise<{ gasLimit: string; gasCost: string; totalCost: string }>: Estimate gas limit, gas cost (native token), and total cost (native token).
Blockchain Data & Transactions
 * sdkEVM.getBlockNumber(): Promise<number>: Get the latest block number.
 * sdkEVM.getBlock(blockNumber: number | string): Promise<Block | null>: Get details about a specific block.
 * sdkEVM.getTransaction(txHash: string): Promise<EVMTransaction | null>: Get details about a specific transaction.
 * sdkEVM.getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>: Get the receipt of a mined transaction (status, logs, gas used).
 * sdkEVM.getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'>: Quickly check the status of a transaction.
 * sdkEVM.waitForTransaction(txHash: string, confirmations?: number): Promise<TransactionReceipt | null>: Wait for a transaction to be mined with a specific number of confirmations.
Events & Logs
 * sdkEVM.getPastEvents(contractAddress: string, abi: any[], eventName: string, fromBlock?: number, toBlock?: number | string): Promise<EVMEventLog[]>: Query past event logs from a contract.
 * sdkEVM.listenEvents(contractAddress: string, abi: any[], eventName: string, callback: (event: EVMEventLog) => void): Promise<() => void>: Listen for real-time events from a contract. Returns an unsubscribe function.
 * sdkEVM.getLogs(filter: EventFilter): Promise<EVMEventLog[]>: Generic log query using filters (address, topics, block range).
Advanced Features & Utilities
 * sdkEVM.multicall(calls: MulticallRequest[]): Promise<MulticallResponse[]>: Execute multiple read calls in a single RPC request (requires Multicall contract deployed on the chain).
 * sdkEVM.tryMulticall(calls: MulticallRequest[]): Promise<MulticallResponse[]>: Similar to multicall, but allows individual calls to fail without reverting the whole batch.
 * sdkEVM.getSwapQuote(fromToken: string, toToken: string, amount: string, slippage?: number): Promise<SwapQuote>: Get an estimated quote for swapping tokens on a supported DEX (e.g., Uniswap V2).
 * sdkEVM.swapTokens(fromToken: string, toToken: string, amount: string, slippage?: number, overrides?: TransactionRequest): Promise<TransactionResponse>: Execute a token swap on a supported DEX (requires token approval).
 * sdkEVM.getPoolInfo(poolAddress: string): Promise<PoolInfo>: Get information about a DEX liquidity pool.
 * sdkEVM.getLatestPrice(priceFeedAddress: string): Promise<string>: Get the latest price from a Chainlink price feed contract.
 * sdkEVM.scanContractSecurity(contractAddress: string): Promise<SecurityScanResult>: Perform a basic security check on a contract address.
 * sdkEVM.optimizeGas(transaction: TransactionRequest): Promise<TransactionRequest>: Suggest potentially optimized gas parameters for a transaction.
 * sdkEVM.resolveENS(ensName: string): Promise<string>: Resolve an ENS name to an address (Mainnet only).
 * sdkEVM.lookupAddress(address: string): Promise<string>: Lookup the primary ENS name for an address (Mainnet only).
 * sdkEVM.healthCheck(): Promise<{ healthy: boolean; latency: number; blockNumber: number }>: Check the health and latency of the connected RPC endpoint.
 * sdkEVM.batchTransferNative(transfers: { to: string; amount: string }[], overrides?: TransactionRequest): Promise<TransactionResponse[]>: Send native tokens to multiple recipients in sequence.
 * sdkEVM.getMultipleBalances(addresses: string[]): Promise<BalanceResult[]>: Get native balances for multiple addresses.
 * sdkEVM.getMultipleTokenBalances(tokenAddress: string, addresses: string[]): Promise<TokenBalance[]>: Get token balances for multiple addresses.
<!-- end list -->

---
