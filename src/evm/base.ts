import { EVMSDK } from '../evm.js';

export class Base extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'BASE', rpcUrl, path);
  }
}
