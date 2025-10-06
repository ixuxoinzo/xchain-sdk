import 'dotenv/config';
import { EVMSDK } from './evm.js';
import { SolanaSDK } from './solana.js';
import { BackendSDK } from './backend-sdk.js';
import { FrontendSDK } from './frontend-sdk.js';
import { CHAINS } from './chains.js';

// =================================================================================
// HELPER & SETUP
// =================================================================================

function printHeader(section: string, title: string) {
  console.log(`\n${section}. ${title.toUpperCase()}`);
  console.log('='.repeat(50));
}

// =================================================================================
// INITIAL PRIVATE KEY VALIDATION
// =================================================================================
const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;

if (!evmPrivateKey) {
  console.error("❌ FATAL ERROR: EVM_PRIVATE_KEY is not found in the .env file. Please ensure it is set.");
  process.exit(1);
}
if (!solanaPrivateKey) {
  console.error("❌ FATAL ERROR: SOLANA_PRIVATE_KEY is not found in the .env file. Please ensure it is set.");
  process.exit(1);
}

// Initialize SDKs after key validation
const backendSDK = new BackendSDK({
  evmPrivateKey: evmPrivateKey,
  solanaPrivateKey: solanaPrivateKey
});
const evmSDK = new EVMSDK(evmPrivateKey, 'ETHEREUM');
const solanaSDK = new SolanaSDK(solanaPrivateKey);

// =================================================================================
// MAIN DEMO FUNCTION
// =================================================================================

async function runDemo() {
  console.log('🚀 XCHAIN SDK DEMO - MULTI-CHAIN BLOCKCHAIN OPERATIONS\n');

  // ========== DEMO 1: FRONTEND SDK ==========
  printHeader('1', 'Frontend SDK Demo');
  console.log('📱 Detecting wallets in a browser environment...');
  try {
    const evmWallets = FrontendSDK.detectEVMWallets();
    console.log('   - Detected EVM Wallets:', evmWallets.length > 0 ? evmWallets : 'None');
  } catch (error) {
    console.log('   - ⏩ Failed to detect wallets (as expected in a server environment).');
  }

  // ========== DEMO 2: BACKEND SDK ==========
  printHeader('2', 'Backend SDK Demo');
  console.log('✅ Backend SDK initialized successfully:');
  console.log('   - EVM Address:', backendSDK.getEVMAddress());
  console.log('   - Solana Address:', backendSDK.getSolanaAddress());

  // ========== DEMO 3: EVM OPERATIONS (READ) ==========
  printHeader('3', 'EVM Read Operations Demo');
  console.log('📍 EVM SDK Info:');
  console.log('   - Address:', evmSDK.getAddress());
  
  try {
    console.log('\n📊 Basic Read Operations:');
    const balance = await evmSDK.getNativeBalance();
    console.log(`   - ETH Balance: ${balance} ETH`);

    console.log('\n🔄 Chain Switching & Balance Checks:');
    const testChains: Array<keyof typeof CHAINS> = ['POLYGON', 'ARBITRUM', 'BASE'];
    for (const chain of testChains) {
        evmSDK.switchChain(chain);
        const chainBalance = await evmSDK.getNativeBalance();
        const currency = CHAINS[chain]?.nativeCurrency?.symbol || 'N/A';
        console.log(`   - ✅ ${chain.padEnd(10)}: ${chainBalance} ${currency}`);
    }
    evmSDK.switchChain('ETHEREUM'); // Switch back to Ethereum for subsequent demos
  } catch (error) {
    console.error('   - ❌ Failed to perform EVM read operations:', (error as Error).message);
  }

  // ========== DEMO 4: SOLANA OPERATIONS (READ) ==========
  printHeader('4', 'Solana Read Operations Demo');
  console.log('📍 Solana SDK Info:');
  console.log('   - Address:', solanaSDK.getAddress());
  
  try {
    console.log('\n📊 Solana Read Operations:');
    const solBalance = await solanaSDK.getBalance();
    console.log(`   - SOL Balance: ${solBalance}`);
  } catch (error) {
    console.error('   - ❌ Failed to perform Solana operations:', (error as Error).message);
  }

  // ========== DEMO 5: MULTICALL OPERATIONS (EVM) ==========
  printHeader('5', 'Multicall Operations Demo (EVM)');
  evmSDK.switchChain('ETHEREUM');
  try {
    const minimalErc20Abi = ['function symbol() view returns (string)'];
    const tokens = {
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    };
    console.log('🧪 Testing Multicall to fetch token symbols...');
    const calls = Object.entries(tokens).map(([symbol, address]) => ({
      contractAddress: address,
      functionName: 'symbol',
      args: [],
      abi: minimalErc20Abi
    }));
    const results = await evmSDK.multicall(calls);
    console.log('   - Multicall Results:');
    results.forEach((result, index) => {
      const symbol = Object.keys(tokens)[index];
      const resultText = result.success ? result.result[0] : `Failed - ${result.error}`;
      console.log(`     - ✅ ${symbol}: ${resultText}`);
    });
  } catch (error) {
    console.error('   - ❌ Multicall failed:', (error as Error).message);
  }

  // =================================================================================
  // --- NEW FEATURES FROM ROADMAP ---
  // =================================================================================

  // ========== DEMO 6: FULL TRANSACTION HANDLER (EVM - TESTNET) ==========
  printHeader('6', 'Full Transaction Handler (EVM - TESTNET)');
  console.log('!!! Warning: This section is DISABLED. Uncomment the code to run on a testnet like Sepolia !!!');
  /*
  evmSDK.switchChain('SEPOLIA'); // Ensure you are on a testnet with funds
  const testRecipient = '0xFBA061EA80d3593e3AF1430ad2050729b59362D9'; // REPLACE WITH A VALID TESTNET RECIPIENT ADDRESS
  const testAmount = '0.0001';

  try {
    console.log(`\n🧪 Sending Native Token (ETH) on Sepolia...`);
    const nativeTx = await evmSDK.transferNative(testRecipient, testAmount);
    console.log(`✅ Native Tx successful: ${nativeTx.hash}`);

  } catch (error) {
    console.error('   - ❌ Transaction failed (ensure testnet funds and correct address):', (error as Error).message);
  }
  */
  console.log('⏩ (To test, uncomment the code and provide a valid testnet recipient address.)');
  evmSDK.switchChain('ETHEREUM'); // Switch back to Ethereum

  // ========== DEMO 7: BASIC NFT & DATA UTILITIES (EVM) ==========
  printHeader('7', 'Basic NFT & Data Utilities (EVM)');
  evmSDK.switchChain('ETHEREUM');
  try {
    const baycContractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'; // BAYC on Ethereum Mainnet
    const apeId = 8888;

    console.log('\n🧪 Fetching NFT owner...');
    const nftOwner = await evmSDK.getNFTOwner(baycContractAddress, apeId);
    console.log(`✅ Owner of BAYC #${apeId}: ${nftOwner}`);

    console.log('\n🧪 Fetching NFT URI...');
    const nftUri = await evmSDK.getNFTUri(baycContractAddress, apeId);
    console.log(`✅ URI of BAYC #${apeId}: ${nftUri}`);

    console.log('\n🧪 Attempting to fetch transaction history (Placeholder)...');
    console.log('⏩ (Transaction history function requires further implementation in the SDK.)');

  } catch (error) {
    console.error('   - ❌ Failed to perform NFT/Data operations:', (error as Error).message);
  }

  // ========== DEMO 8: CHAINLINK PRICE ORACLE (EVM) ==========
  printHeader('8', 'Chainlink Price Oracle (EVM)');
  evmSDK.switchChain('ETHEREUM');
  try {
    const ethUsdPriceFeedAddress = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'; // ETH/USD Price Feed on Ethereum Mainnet

    console.log('\n🧪 Fetching current ETH/USD price from Chainlink...');
    const price = await evmSDK.getLatestPrice(ethUsdPriceFeedAddress);
    console.log(`✅ Current ETH Price: $${parseFloat(price).toFixed(2)}`);
  } catch (error) {
    console.error('   - ❌ Failed to get price from Chainlink:', (error as Error).message);
  }

  // ========== DEMO 9: COMPREHENSIVE DOCUMENTATION (Non-executable) ==========
  printHeader('9', 'Comprehensive Documentation');
  console.log('📖 Documentation is key for SDK adoption.');
  console.log('   - Ensure the README.md on GitHub is complete and up-to-date.');
  console.log('   - Provide clear usage examples for each function.');
  console.log('   - Consider creating a Wiki or a dedicated docs website.');

  // ========== DEMO 10: HEALTH CHECKS ==========
  printHeader('10', 'Health Checks');
  try {
    evmSDK.switchChain('ETHEREUM');
    const evmHealth = await evmSDK.healthCheck();
    console.log(`   - EVM Health: ${evmHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'} | Latency: ${evmHealth.latency}ms | Block: ${evmHealth.blockNumber}`);
    const solanaHealth = await solanaSDK.healthCheck();
    console.log(`   - Solana Health: ${solanaHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'} | Latency: ${solanaHealth.latency}ms | Slot: ${solanaHealth.slot}`);
  } catch (error) {
    console.error('   - ❌ Health Check failed:', (error as Error).message);
  }

  console.log('\n\n🎉 DEMO COMPLETE 🎉');
}

runDemo().catch(console.error);

