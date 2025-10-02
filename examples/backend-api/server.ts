import express from 'express';
import { BackendSDK } from 'xchain-sdk-full';

const app = express();
app.use(express.json());

// Initialize SDK
const sdk = new BackendSDK({
  evmPrivateKey: process.env.EVM_PRIVATE_KEY!
});

// API Routes
app.get('/balance/:address', async (req, res) => {
  try {
    const balance = await sdk.getNativeBalanceEVM(req.params.address);
    res.json({ address: req.params.address, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { to, amount, chain = 'ETHEREUM' } = req.body;
    const tx = await sdk.transferNativeEVM(to, amount, chain);
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Wallet API running on port 3000');
  console.log('💰 Server Address:', sdk.getEVMAddress());
});