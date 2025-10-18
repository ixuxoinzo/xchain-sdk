import { EVMSDK } from '../evm.js';

export class Bsc extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'BSC', rpcUrl, path);
  }
}
