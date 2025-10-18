import { EVMSDK } from '../evm.js';

export class Celo extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'CELO', rpcUrl, path);
  }
}
