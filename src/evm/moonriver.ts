import { EVMSDK } from '../evm.js';

export class Moonriver extends EVMSDK {
  constructor(privateKey: string, rpcUrl?: string, path?: string) {
    super(privateKey, 'MOONRIVER', rpcUrl, path);
  }
}
