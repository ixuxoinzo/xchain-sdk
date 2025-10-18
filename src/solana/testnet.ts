import { SolanaSDK } from '../solana.js';

export class SolanaTestnet extends SolanaSDK {
  constructor(privateKey: Uint8Array | string, customRpcUrl?: string) {
    super(privateKey, 'testnet', customRpcUrl, 'confirmed');
  }
}
