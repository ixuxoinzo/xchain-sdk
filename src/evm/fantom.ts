import { EVMSDK } from '../evm.js';

export class Fantom extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'FANTOM', rpcUrl, path);
  }
}
