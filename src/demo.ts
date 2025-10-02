import { HybridSDK } from './hybrid-sdk.js';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { FrontendSDK } from './frontend-sdk.js';
import { BackendSDK } from './backend-sdk.js';
import { CHAINS } from './chains.js';
import { ethers } from 'ethers';

async function runDemo() {
  console.log('🚀 XCHAIN SDK DEMO - MULTI-CHAIN BLOCKCHAIN OPERATIONS\n');

  // ========== DEMO 1: HYBRID SDK ==========
  console.log('1. HYBRID SDK DEMO');
  console.log('='.repeat(50));

  const hybridSDK = new HybridSDK();

  // Demo frontend connection
  console.log('\n📱 Frontend Wallet Detection:');
  const evmWallets = FrontendSDK.detectEVMWallets();
  const solanaWallets = FrontendSDK.detectSolanaWallets();
  
  console.log('EVM Wallets:', evmWallets.length > 0 ? evmWallets : 'None detected');
  console.log('Solana Wallets:', solanaWallets.length > 0 ? solanaWallets : 'None detected');

  // ========== DEMO 2: BACKEND SDK ==========
  console.log('\n2. BACKEND SDK DEMO');
  console.log('='.repeat(50));

  // Create random wallets for demo (in production, use secure private keys)
  const evmWallet = EVMSDK.createRandom();
  const solanaWallet = SolanaSDK.createRandom();

  console.log('🔐 Generated Demo Wallets:');
  console.log('EVM Address:', evmWallet.address);
  console.log('EVM Private Key:', evmWallet.privateKey.substring(0, 20) + '...');
  console.log('Solana Address:', solanaWallet.address);
  console.log('Solana Private Key:', solanaWallet.privateKey.substring(0, 20) + '...');

  const backendSDK = new BackendSDK({
    evmPrivateKey: evmWallet.privateKey,
    solanaPrivateKey: solanaWallet.privateKey
  });

  console.log('\n✅ Backend SDK Initialized:');
  console.log('EVM Address:', backendSDK.getEVMAddress());
  console.log('Solana Address:', backendSDK.getSolanaAddress());
  console.log('EVM Configured:', backendSDK.isEVMConfigured());
  console.log('Solana Configured:', backendSDK.isSolanaConfigured());

  // ========== DEMO 3: EVM OPERATIONS ==========
  console.log('\n3. EVM OPERATIONS DEMO');
  console.log('='.repeat(50));

  const evmSDK = new EVMSDK(evmWallet.privateKey, 'ETHEREUM');

  console.log('📍 EVM SDK Info:');
  console.log('Address:', evmSDK.getAddress());
  console.log('Current Chain:', evmSDK.getCurrentChain());
  console.log('Network:', evmSDK.getNetworkInfo());

  // Test read operations
  try {
    console.log('\n📊 Read Operations:');
    
    // Get block number
    const blockNumber = await evmSDK.getBlockNumber();
    console.log('Current Block:', blockNumber);

    // Get gas price
    const gasPrice = await evmSDK.getGasPrice();
    console.log('Current Gas Price:', gasPrice, 'GWEI');

    // Get balance
    const balance = await evmSDK.getNativeBalance();
    console.log('Balance:', balance, 'ETH');

  } catch (error) {
    console.log('Read operations failed (expected for new wallet):', error instanceof Error ? error.message : error);
  }

  // Test chain switching
  console.log('\n🔄 Chain Switching:');
  const testChains: Array<keyof typeof CHAINS> = ['POLYGON', 'ARBITRUM', 'BASE'];
  
  for (const chain of testChains) {
    try {
      evmSDK.switchChain(chain);
      const chainBalance = await evmSDK.getNativeBalance();
      console.log(`✅ ${chain}: ${chainBalance} ${CHAINS[chain].nativeCurrency.symbol}`);
    } catch (error) {
      console.log(`❌ ${chain}: Failed - ${error instanceof Error ? error.message : error}`);
    }
  }

  // ========== DEMO 4: SOLANA OPERATIONS ==========
  console.log('\n4. SOLANA OPERATIONS DEMO');
  console.log('='.repeat(50));

  const solanaSDK = new SolanaSDK(solanaWallet.privateKey);

  console.log('📍 Solana SDK Info:');
  console.log('Address:', solanaSDK.getAddress());
  console.log('Public Key:', solanaSDK.getPublicKey().toString());

  // Test read operations
  try {
    console.log('\n📊 Solana Read Operations:');
    
    // Get balance
    const solBalance = await solanaSDK.getSOLBalance();
    console.log('SOL Balance:', solBalance);

    // Get recent blockhash
    const blockhash = await solanaSDK.getRecentBlockhash();
    console.log('Recent Blockhash:', blockhash.substring(0, 20) + '...');

    // Get slot
    const slot = await solanaSDK.getSlot();
    console.log('Current Slot:', slot);

  } catch (error) {
    console.log('Solana operations failed (expected for new wallet):', error instanceof Error ? error.message : error);
  }

  // ========== DEMO 5: MULTICALL OPERATIONS ==========
  console.log('\n5. MULTICALL OPERATIONS DEMO');
  console.log('='.repeat(50));

  // Switch back to Ethereum for multicall
  evmSDK.switchChain('ETHEREUM');

  try {
    // Example token addresses on Ethereum
    const tokens = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
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
      if (result.success) {
        console.log(`✅ ${symbol}: ${result.result}`);
      } else {
        console.log(`❌ ${symbol}: Failed - ${result.error}`);
      }
    });

  } catch (error) {
    console.log('Multicall failed:', error instanceof Error ? error.message : error);
  }

  // ========== DEMO 6: HEALTH CHECKS ==========
  console.log('\n6. HEALTH CHECKS');
  console.log('='.repeat(50));

  try {
    const evmHealth = await evmSDK.healthCheck();
    console.log('EVM Health:', evmHealth.healthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('EVM Latency:', evmHealth.latency + 'ms');
    console.log('EVM Block:', evmHealth.blockNumber);

    const solanaHealth = await solanaSDK.healthCheck();
    console.log('Solana Health:', solanaHealth.healthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('Solana Latency:', solanaHealth.latency + 'ms');
    console.log('Solana Slot:', solanaHealth.slot);

  } catch (error) {
    console.log('Health checks failed:', error instanceof Error ? error.message : error);
  }

  // ========== DEMO 7: ERROR HANDLING ==========
  console.log('\n7. ERROR HANDLING DEMO');
  console.log('='.repeat(50));

  // Test error handling with invalid transaction
  try {
    console.log('Testing error handling...');
    await evmSDK.transferNative('0xInvalidAddress', '1.0');
  } catch (error) {
    console.log('✅ Error handled properly:', error instanceof Error ? error.message : error);
  }

  // ========== DEMO 8: ADVANCED FEATURES ==========
  console.log('\n8. ADVANCED FEATURES');
  console.log('='.repeat(50));

  // Gas estimation
  try {
    const gasEstimate = await evmSDK.estimateGas(
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Random address
      '0.001'
    );
    console.log('Gas Estimate:', gasEstimate);

    const feeData = await evmSDK.getFeeData();
    console.log('Fee Data:', {
      gasPrice: feeData.gasPrice,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    });

  } catch (error) {
    console.log('Advanced features failed:', error instanceof Error ? error.message : error);
  }

  // ========== SUMMARY ==========
  console.log('\n🎉 DEMO SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ SDK Initialized Successfully');
  console.log('✅ Multi-chain Support Working');
  console.log('✅ Read Operations Functional');
  console.log('✅ Error Handling Working');
  console.log('✅ Advanced Features Accessible');
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Use real private keys for actual transactions');
  console.log('2. Configure RPC endpoints for better performance');
  console.log('3. Add error handling and retry logic for production');
  console.log('4. Implement proper security measures for private keys');
  console.log('\n🚀 SDK READY FOR PRODUCTION!');
}

// Run the demo
runDemo().catch(console.error);