import { EVMSDK } from '../evm.js';

export class ZkSync extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'ZKSYNC', rpcUrl, path);
  }
}
