import { EVMSDK } from '../evm.js';

export class Arbitrum extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'ARBITRUM', rpcUrl, path);
  }
}
