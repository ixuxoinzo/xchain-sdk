import { EVMSDK } from '../evm.js';

export class Polygon extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'POLYGON', rpcUrl, path);
  }
}
