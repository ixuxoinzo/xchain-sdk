export { Ethereum } from './ethereum.js';
export { Optimism } from './optimism.js';
export { Arbitrum } from './arbitrum.js';
export { Base } from './base.js';
export { Polygon } from './polygon.js';
export { PolygonZkEVM } from './polygon-zkevm.js';
export { ZkSync } from './zksync.js';
export { Linea } from './linea.js';
export { Scroll } from './scroll.js';
export { Mantle } from './mantle.js';
export { Metis } from './metis.js';
export { Blast } from './blast.js';
export { Avalanche } from './avalanche.js';
export { Bsc } from './bsc.js';
export { Fantom } from './fantom.js';
export { Celo } from './celo.js';
export { Moonbeam } from './moonbeam.js';
export { Moonriver } from './moonriver.js';
export { Cronos } from './cronos.js';
export { Aurora } from './aurora.js';
export { Gnosis } from './gnosis.js';
export { Monad } from './monad.js';
export { Somnia } from './somnia.js';
export { Manta } from './manta.js';
export { OpBNB } from './opbnb.js';

// Re-export base EVMSDK, ABIs, and Addresses from the main evm.ts file
export {
  EVMSDK,
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V3_ROUTER_ABI,
  MULTICALL_ABI,
  CONTRACT_ADDRESSES
} from '../evm.js';
