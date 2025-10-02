import 'dotenv/config';
import { HybridSDK } from './hybrid-sdk.js';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { FrontendSDK } from './frontend-sdk.js';
import { BackendSDK } from './backend-sdk.js';
import { CHAINS } from './chains.js';
import { ethers } from 'ethers';

const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;

async function runDemo() {
  console.log('🚀 XCHAIN SDK DEMO - MULTI-CHAIN BLOCKCHAIN OPERATIONS\n');

  // ========== DEMO 1: HYBRID & FRONTEND SDK ==========
  console.log('1. HYBRID & FRONTEND SDK DEMO');
  console.log('='.repeat(50));
  const hybridSDK = new HybridSDK();
  console.log('\n📱 Frontend Wallet Detection (for browser environments):');
  try {
    // This part is for frontend environments and will fail in Node.js
    const evmWallets = FrontendSDK.detectEVMWallets();
    const solanaWallets = FrontendSDK.detectSolanaWallets();
    console.log('Detected EVM Wallets:', evmWallets.length > 0 ? evmWallets : 'None detected');
    console.log('Detected Solana Wallets:', solanaWallets.length > 0 ? solanaWallets : 'None detected');
  } catch (error) {
    console.log('   -> Could not run wallet detection (this is expected on a server).');
  }

  // ========== DEMO 2: BACKEND SDK ==========
  console.log('\n2. BACKEND SDK DEMO');
  console.log('='.repeat(50));

  if (!evmPrivateKey || !solanaPrivateKey) {
    console.error("FATAL ERROR: Please provide EVM_PRIVATE_KEY and SOLANA_PRIVATE_KEY in .env to run Backend, EVM, and Solana demos.");
    return;
  }
  
  const backendSDK = new BackendSDK({
    evmPrivateKey: evmPrivateKey,
    solanaPrivateKey: solanaPrivateKey
  });
  console.log('\n✅ Backend SDK Initialized:');
  console.log('EVM Address:', backendSDK.getEVMAddress());
  console.log('Solana Address:', backendSDK.getSolanaAddress());

  // ========== DEMO 3: EVM OPERATIONS ==========
  console.log('\n3. EVM OPERATIONS DEMO');
  console.log('='.repeat(50));
  
  const evmSDK = new EVMSDK(evmPrivateKey, 'ETHEREUM');
  console.log('📍 EVM SDK Info:');
  console.log('Address:', evmSDK.getAddress());
  console.log('Current Chain:', evmSDK.getCurrentChain());

  try {
    console.log('\n📊 Read Operations:');
    const blockNumber = await evmSDK.getBlockNumber();
    console.log('Current Block:', blockNumber);
    const gasPrice = await evmSDK.getGasPrice();
    console.log('Current Gas Price:', gasPrice, 'GWEI');
    const balance = await evmSDK.getNativeBalance();
    console.log('Balance:', balance, 'ETH');

    console.log('\n🔄 Chain Switching:');
    const testChains: Array<keyof typeof CHAINS> = ['POLYGON', 'ARBITRUM', 'BASE'];
    for (const chain of testChains) {
        evmSDK.switchChain(chain);
        const chainBalance = await evmSDK.getNativeBalance();
        const currency = CHAINS[chain]?.nativeCurrency?.symbol || 'N/A';
        console.log(`✅ ${chain}: ${chainBalance} ${currency}`);
    }
  } catch (error) {
    console.log('EVM Read operations failed:', (error as Error).message);
  }

  // ========== DEMO 4: SOLANA OPERATIONS ==========
  console.log('\n4. SOLANA OPERATIONS DEMO');
  console.log('='.repeat(50));

  const solanaSDK = new SolanaSDK(solanaPrivateKey);
  console.log('📍 Solana SDK Info:');
  console.log('Address:', solanaSDK.getAddress());
  
  try {
    console.log('\n📊 Solana Read Operations:');
    const solBalance = await solanaSDK.getBalance(); // Corrected method name
    console.log('SOL Balance:', solBalance);
    const blockhash = await solanaSDK.getRecentBlockhash();
    console.log('Recent Blockhash:', blockhash.substring(0, 20) + '...');
    const slot = await solanaSDK.getSlot();
    console.log('Current Slot:', slot);
  } catch (error) {
    console.log('Solana operations failed:', (error as Error).message);
  }

  // ========== DEMO 5: MULTICALL OPERATIONS ==========
  console.log('\n5. MULTICALL OPERATIONS DEMO');
  console.log('='.repeat(50));
  evmSDK.switchChain('ETHEREUM');
  try {
    const tokens = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    };
    console.log('🧪 Testing Multicall:');
    const calls = Object.entries(tokens).map(([symbol, address]) => ({
      contractAddress: address,
      functionName: 'symbol',
      args: [],
      abi: ['function symbol() view returns (string)']
    }));
    const results = await evmSDK.multicall(calls);
    console.log('Multicall Results:');
    results.forEach((result, index) => {
      const symbol = Object.keys(tokens)[index];
      console.log(result.success ? `✅ ${symbol}: ${result.result}` : `❌ ${symbol}: Failed - ${result.error}`);
    });
  } catch (error) {
    console.log('Multicall failed:', (error as Error).message);
  }

  // ========== DEMO 6: HEALTH CHECKS ==========
  console.log('\n6. HEALTH CHECKS');
  console.log('='.repeat(50));
  try {
    const evmHealth = await evmSDK.healthCheck();
    console.log('EVM Health:', evmHealth.healthy ? '✅ Healthy' : '❌ Unhealthy', `| Latency: ${evmHealth.latency}ms`, `| Block: ${evmHealth.blockNumber}`);
    const solanaHealth = await solanaSDK.healthCheck();
    console.log('Solana Health:', solanaHealth.healthy ? '✅ Healthy' : '❌ Unhealthy', `| Latency: ${solanaHealth.latency}ms`, `| Slot: ${solanaHealth.slot}`);
  } catch (error) {
    console.log('Health checks failed:', (error as Error).message);
  }

  // ========== DEMO 7: ADVANCED FEATURES ==========
  console.log('\n7. ADVANCED FEATURES (EVM)');
  console.log('='.repeat(50));
  try {
    const feeData = await evmSDK.getFeeData();
    console.log('Fee Data (GWEI):', {
      gasPrice: feeData.gasPrice,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    });
  } catch (error) {
    console.log('Advanced features failed:', (error as Error).message);
  }
  
  console.log('\n\n🎉 DEMO COMPLETE 🎉');
}

runDemo().catch(console.error);
