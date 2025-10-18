import { EVMSDK } from '../evm.js';

export class Scroll extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'SCROLL', rpcUrl, path);
  }
}
