import { EVMSDK } from '../evm.js';

export class PolygonZkEVM extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'POLYGON_ZKEVM', rpcUrl, path);
  }
}
