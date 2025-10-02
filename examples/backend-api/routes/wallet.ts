import { Router } from 'express';
import { BackendSDK } from 'xchain-sdk-full';

const router = Router();

// Initialize SDK (use environment variables in production!)
const sdk = new BackendSDK({
  evmPrivateKey: process.env.EVM_PRIVATE_KEY || '0xYOUR_PRIVATE_KEY',
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || 'YOUR_SOLANA_PRIVATE_KEY'
});

// GET /wallet/address - Get server wallet address
router.get('/address', (req, res) => {
  try {
    const addresses = {
      evm: sdk.getEVMAddress(),
      solana: sdk.getSolanaAddress()
    };
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /wallet/balance/:chain/:address? - Get balance
router.get('/balance/:chain/:address?', async (req, res) => {
  try {
    const { chain, address } = req.params;
    let balance;

    if (chain === 'SOLANA') {
      balance = await sdk.getSOLBalance(address);
    } else {
      balance = await sdk.getNativeBalanceEVM(address || sdk.getEVMAddress(), chain as any);
    }

    res.json({ 
      success: true, 
      chain, 
      address: address || 'server', 
      balance 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /wallet/transfer - Transfer native tokens
router.post('/transfer', async (req, res) => {
  try {
    const { to, amount, chain = 'ETHEREUM' } = req.body;

    if (!to || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, amount' 
      });
    }

    const tx = await sdk.transferNativeEVM(to, amount, chain);
    
    res.json({ 
      success: true, 
      message: 'Transfer initiated',
      transaction: tx 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /wallet/transfer-token - Transfer ERC20 tokens
router.post('/transfer-token', async (req, res) => {
  try {
    const { to, amount, tokenAddress, chain = 'ETHEREUM' } = req.body;

    if (!to || !amount || !tokenAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, amount, tokenAddress' 
      });
    }

    const tx = await sdk.transferTokenEVM(tokenAddress, to, amount, chain);
    
    res.json({ 
      success: true, 
      message: 'Token transfer initiated',
      transaction: tx 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /wallet/transfer-sol - Transfer SOL
router.post('/transfer-sol', async (req, res) => {
  try {
    const { to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, amount' 
      });
    }

    const result = await sdk.transferSOL(to, parseFloat(amount));
    
    res.json({ 
      success: true, 
      message: 'SOL transfer initiated',
      transaction: result 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /wallet/health - Health check
router.get('/health', async (req, res) => {
  try {
    const health = await sdk.healthCheck();
    res.json({ 
      success: true, 
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;