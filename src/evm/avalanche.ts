import { EVMSDK } from '../evm.js';

export class Avalanche extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'AVALANCHE', rpcUrl, path);
  }
}
