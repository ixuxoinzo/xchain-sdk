import { EVMSDK } from '../evm.js';

export class Blast extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'BLAST', rpcUrl, path);
  }
}
