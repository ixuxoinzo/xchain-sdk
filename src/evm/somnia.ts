import { EVMSDK } from '../evm.js';

export class Somnia extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'SOMNIA', rpcUrl, path);
  }
}
