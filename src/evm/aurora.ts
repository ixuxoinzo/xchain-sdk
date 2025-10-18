import { EVMSDK } from '../evm.js';

export class Aurora extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'AURORA', rpcUrl, path);
  }
}
