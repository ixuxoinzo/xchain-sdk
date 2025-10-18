import { SolanaSDK } from '../solana.js';

export class SolanaDevnet extends SolanaSDK {
  constructor(privateKey: Uint8Array | string, customRpcUrl?: string) {
    super(privateKey, 'devnet', customRpcUrl, 'confirmed');
  }
}
