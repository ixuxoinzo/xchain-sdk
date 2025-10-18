import { EVMSDK } from '../evm.js';

export class Gnosis extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'GNOSIS', rpcUrl, path);
  }
}
