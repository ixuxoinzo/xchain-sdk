import { EVMSDK } from '../evm.js';

export class Cronos extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'CRONOS', rpcUrl, path);
  }
}
