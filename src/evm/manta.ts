import { EVMSDK } from '../evm.js';

export class Manta extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'MANTA', rpcUrl, path);
  }
}
