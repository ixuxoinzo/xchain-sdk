import { EVMSDK } from '../evm.js';

export class Mantle extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'MANTLE', rpcUrl, path);
  }
}
