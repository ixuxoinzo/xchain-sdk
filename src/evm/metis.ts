import { EVMSDK } from '../evm.js';

export class Metis extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'METIS', rpcUrl, path);
  }
}
