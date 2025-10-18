import { EVMSDK } from '../evm.js';

export class Optimism extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'OPTIMISM', rpcUrl, path);
  }
}
