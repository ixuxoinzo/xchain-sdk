import { FrontendSDK, BackendSDK, HybridSDK, EVMSDK, SolanaSDK } from 'xchain-sdk-full';

// 1. Frontend Example
async function frontendExample() {
  console.log('🖥️ FRONTEND EXAMPLE');
  const sdk = new FrontendSDK();
  
  try {
    const wallet = await sdk.connectEVM();
    console.log('Connected:', wallet.address);
    
    const balance = await sdk.getNativeBalanceEVM();
    console.log('Balance:', balance);
  } catch (error) {
    console.log('No wallet connected, using demo mode');
  }
}

// 2. Backend Example  
async function backendExample() {
  console.log('🖥️ BACKEND EXAMPLE');
  
  // Use environment variables in real app!
  const sdk = new BackendSDK({
    evmPrivateKey: process.env.EVM_PRIVATE_KEY || '0x...'
  });
  
  console.log('Server Address:', sdk.getEVMAddress());
  
  const balance = await sdk.getNativeBalanceEVM();
  console.log('Server Balance:', balance);
}

// 3. Quick Start
async function quickStart() {
  console.log('🚀 QUICK START');
  
  const sdk = new HybridSDK();
  console.log('✅ SDK Ready!');
  
  // Create demo wallets
  const evmWallet = EVMSDK.createRandom();
  const solanaWallet = SolanaSDK.createRandom();
  
  console.log('Demo EVM Address:', evmWallet.address);
  console.log('Demo Solana Address:', solanaWallet.address);
}

// Run all examples
async function main() {
  await frontendExample();
  await backendExample(); 
  await quickStart();
}

main().catch(console.error);