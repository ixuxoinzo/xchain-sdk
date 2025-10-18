import { SolanaSDK } from '../solana.js';

export class Solana extends SolanaSDK {
  constructor(privateKey: Uint8Array | string, customRpcUrl?: string) {
    super(privateKey, 'mainnet', customRpcUrl, 'confirmed');
  }
}
