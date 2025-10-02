import express from 'express';
import cors from 'cors';
import walletRoutes from './routes/wallet.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallet', walletRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 XChain SDK Wallet API',
    version: '1.0.0',
    endpoints: {
      'GET /api/wallet/address': 'Get server wallet addresses',
      'GET /api/wallet/balance/:chain/:address?': 'Get balance',
      'POST /api/wallet/transfer': 'Transfer native tokens',
      'POST /api/wallet/transfer-token': 'Transfer ERC20 tokens', 
      'POST /api/wallet/transfer-sol': 'Transfer SOL',
      'GET /api/wallet/health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 XChain SDK Wallet API started!');
  console.log(`📍 http://localhost:${PORT}`);
  console.log('📚 Check / for available endpoints');
});