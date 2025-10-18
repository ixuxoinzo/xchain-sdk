import { EVMSDK } from '../evm.js';

export class Monad extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'MONAD', rpcUrl, path);
  }
}
