import { EVMSDK } from '../evm.js';

export class OpBNB extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'OPBNB', rpcUrl, path);
  }
}
