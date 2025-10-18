import 'dotenv/config';

export const CHAINS = {
  // ========== EVM CHAINS ==========
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    rpc: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  OPTIMISM: {
    id: 10,
    name: 'Optimism',
    rpc: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum One',
    rpc: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  BASE: {
    id: 8453,
    name: 'Base',
    rpc: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  POLYGON: {
    id: 137,
    name: 'Polygon POS',
    rpc: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  POLYGON_ZKEVM: {
    id: 1101,
    name: 'Polygon zkEVM',
    rpc: process.env.POLYGON_ZKEVM_RPC_URL || 'https://zkevm-rpc.com',
    explorer: 'https://zkevm.polygonscan.com',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  ZKSYNC: {
    id: 324,
    name: 'zkSync Era',
    rpc: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
    explorer: 'https://explorer.zksync.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  LINEA: {
    id: 59144,
    name: 'Linea',
    rpc: process.env.LINEA_RPC_URL || 'https://rpc.linea.build',
    explorer: 'https://lineascan.build',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  SCROLL: {
    id: 534352,
    name: 'Scroll',
    rpc: process.env.SCROLL_RPC_URL || 'https://rpc.scroll.io',
    explorer: 'https://scrollscan.com',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  MANTLE: {
    id: 5000,
    name: 'Mantle',
    rpc: process.env.MANTLE_RPC_URL || 'https://rpc.mantle.xyz',
    explorer: 'https://mantlescan.info',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18
    }
  },
  METIS: {
    id: 1088,
    name: 'Metis',
    rpc: process.env.METIS_RPC_URL || 'https://andromeda.metis.io/?owner=1088',
    explorer: 'https://andromeda-explorer.metis.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18
    }
  },
  BLAST: {
    id: 81457,
    name: 'Blast',
    rpc: process.env.BLAST_RPC_URL || 'https://rpc.blast.io',
    explorer: 'https://blastscan.io',
    type: 'EVM' as const,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  AVALANCHE: {
      id: 43114,
      name: 'Avalanche C-Chain',
      rpc: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
      explorer: 'https://snowtrace.io',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
      }
  },
  BSC: {
      id: 56,
      name: 'BNB Smart Chain',
      rpc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
      explorer: 'https://bscscan.com',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
  },
  FANTOM: {
      id: 250,
      name: 'Fantom Opera',
      rpc: process.env.FANTOM_RPC_URL || 'https://rpc.ftm.tools/',
      explorer: 'https://ftmscan.com',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Fantom',
        symbol: 'FTM',
        decimals: 18
      }
  },
  CELO: {
      id: 42220,
      name: 'Celo',
      rpc: process.env.CELO_RPC_URL || 'https://forno.celo.org',
      explorer: 'https://celoscan.io',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Celo',
        symbol: 'CELO',
        decimals: 18
      }
  },
  MOONBEAM: {
      id: 1284,
      name: 'Moonbeam',
      rpc: process.env.MOONBEAM_RPC_URL || 'https://rpc.api.moonbeam.network',
      explorer: 'https://moonscan.io',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Glimmer',
        symbol: 'GLMR',
        decimals: 18
      }
  },
  MOONRIVER: {
      id: 1285,
      name: 'Moonriver',
      rpc: process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network',
      explorer: 'https://moonriver.moonscan.io',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Moonriver',
        symbol: 'MOVR',
        decimals: 18
      }
  },
  CRONOS: {
      id: 25,
      name: 'Cronos',
      rpc: process.env.CRONOS_RPC_URL || 'https://evm.cronos.org',
      explorer: 'https://cronoscan.com',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Cronos',
        symbol: 'CRO',
        decimals: 18
      }
  },
  AURORA: {
      id: 1313161554,
      name: 'Aurora',
      rpc: process.env.AURORA_RPC_URL || 'https://mainnet.aurora.dev',
      explorer: 'https://aurorascan.dev',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
  },
  GNOSIS: {
      id: 100,
      name: 'Gnosis Chain',
      rpc: process.env.GNOSIS_RPC_URL || 'https://rpc.gnosischain.com',
      explorer: 'https://gnosisscan.io',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'xDAI',
        symbol: 'xDAI',
        decimals: 18
      }
  },
  MONAD: {
      id: 143,
      name: 'Monad Mainnet',
      rpc: process.env.MONAD_RPC_URL || 'https://api.monad.xyz', // Placeholder, verify official RPC
      explorer: process.env.MONAD_EXPLORER_URL || 'https://explorer.monad.xyz', // Placeholder, verify official Explorer
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Monad',
        symbol: 'MON',
        decimals: 18
      }
  },
  SOMNIA: {
      id: 5031,
      name: 'Somnia Mainnet',
      rpc: process.env.SOMNIA_RPC_URL || 'https://api.infra.mainnet.somnia.network',
      explorer: process.env.SOMNIA_EXPLORER_URL || 'https://explorer.somnia.network',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Somnia',
        symbol: 'SOMI',
        decimals: 18
      }
  },
  MANTA: {
      id: 169,
      name: 'Manta Pacific',
      rpc: process.env.MANTA_RPC_URL || 'https://pacific-rpc.manta.network/http',
      explorer: 'https://pacific-explorer.manta.network',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
  },
  OPBNB: {
      id: 204,
      name: 'opBNB Mainnet',
      rpc: process.env.OPBNB_RPC_URL || 'https://opbnb-mainnet-rpc.bnbchain.org',
      explorer: 'https://mainnet.opbnbscan.com',
      type: 'EVM' as const,
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
  },

  // ========== SOLANA CHAINS ==========
  SOLANA: {
    id: 101,
    name: 'Solana',
    rpc: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    explorer: 'https://explorer.solana.com',
    type: 'SOLANA' as const,
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    }
  },
 SOLANA_DEVNET: {
  id: 102,
  name: 'Solana Devnet',
  rpc: process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
  explorer: 'https://explorer.solana.com?cluster=devnet',
  type: 'SOLANA' as const,
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9
  }
},
 SOLANA_TESTNET: {
  id: 103,
  name: 'Solana Testnet',
  rpc: process.env.SOLANA_TESTNET_RPC_URL || 'https://api.testnet.solana.com',
  explorer: 'https://explorer.solana.com?cluster=testnet',
  type: 'SOLANA' as const,
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9
  }
}
} as const;

export type Chain = keyof typeof CHAINS;

type AllChainConfig = typeof CHAINS[keyof typeof CHAINS];
export type ChainType = AllChainConfig['type'];

function filterChainsByType<T extends ChainType>(type: T): Record<string, Extract<AllChainConfig, { type: T }>> {
  return Object.entries(CHAINS)
    .filter(([_, config]) => config.type === type)
    .reduce((acc, [key, config]) => ({ ...acc, [key]: config }), {}) as any;
}

export const EVM_CHAINS = filterChainsByType('EVM');
export const SOLANA_CHAINS = filterChainsByType('SOLANA');

export function getChainById(chainId: number): Chain | undefined {
  return Object.entries(CHAINS).find(([_, config]) => config.id === chainId)?.[0] as Chain | undefined;
}

export function getChainRPC(chain: Chain): string {
  return CHAINS[chain].rpc;
}

export function getChainExplorer(chain: Chain): string {
  return CHAINS[chain].explorer;
}

export function isValidChain(chain: string): chain is Chain {
  return chain in CHAINS;
}
