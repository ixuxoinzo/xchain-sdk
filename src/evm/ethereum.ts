import { EVMSDK } from '../evm.js';

export class Ethereum extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'ETHEREUM', rpcUrl, path);
  }
}
