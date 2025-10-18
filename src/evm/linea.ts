import { EVMSDK } from '../evm.js';

export class Linea extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'LINEA', rpcUrl, path);
  }
}
