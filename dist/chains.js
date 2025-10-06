export const CHAINS = {
    // ========== EVM CHAINS ==========
    ETHEREUM: {
        id: 1,
        name: 'Ethereum',
        rpc: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    OPTIMISM: {
        id: 10,
        name: 'Optimism',
        rpc: 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    ARBITRUM: {
        id: 42161,
        name: 'Arbitrum One',
        rpc: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    BASE: {
        id: 8453,
        name: 'Base',
        rpc: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        type: 'EVM',
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
        type: 'EVM',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    },
    POLYGON_ZKEVM: {
        id: 1101,
        name: 'Polygon zkEVM',
        rpc: 'https://zkevm-rpc.com',
        explorer: 'https://zkevm.polygonscan.com',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    ZKSYNC: {
        id: 324,
        name: 'zkSync Era',
        rpc: 'https://mainnet.era.zksync.io',
        explorer: 'https://explorer.zksync.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    LINEA: {
        id: 59144,
        name: 'Linea',
        rpc: 'https://rpc.linea.build',
        explorer: 'https://lineascan.build',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    SCROLL: {
        id: 534352,
        name: 'Scroll',
        rpc: 'https://rpc.scroll.io',
        explorer: 'https://scrollscan.com',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    MANTLE: {
        id: 5000,
        name: 'Mantle',
        rpc: 'https://rpc.mantle.xyz',
        explorer: 'https://mantlescan.info',
        type: 'EVM',
        nativeCurrency: {
            name: 'Mantle',
            symbol: 'MNT',
            decimals: 18
        }
    },
    METIS: {
        id: 1088,
        name: 'Metis',
        rpc: 'https://andromeda.metis.io/?owner=1088',
        explorer: 'https://andromeda-explorer.metis.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Metis',
            symbol: 'METIS',
            decimals: 18
        }
    },
    BLAST: {
        id: 81457,
        name: 'Blast',
        rpc: 'https://rpc.blast.io',
        explorer: 'https://blastscan.io',
        type: 'EVM',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    // ========== SOLANA ==========
    SOLANA: {
        id: 101,
        name: 'Solana',
        rpc: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        explorer: 'https://explorer.solana.com',
        type: 'SOLANA',
        nativeCurrency: {
            name: 'Solana',
            symbol: 'SOL',
            decimals: 9
        }
    }
};
export const EVM_CHAINS = Object.entries(CHAINS)
    .filter(([_, config]) => config.type === 'EVM')
    .reduce((acc, [key, config]) => ({ ...acc, [key]: config }), {});
export const SOLANA_CHAINS = Object.entries(CHAINS)
    .filter(([_, config]) => config.type === 'SOLANA')
    .reduce((acc, [key, config]) => ({ ...acc, [key]: config }), {});
export function getChainById(chainId) {
    return Object.entries(CHAINS).find(([_, config]) => config.id === chainId)?.[0];
}
export function getChainRPC(chain) {
    return CHAINS[chain].rpc;
}
export function getChainExplorer(chain) {
    return CHAINS[chain].explorer;
}
export function isValidChain(chain) {
    return chain in CHAINS;
}
//# sourceMappingURL=chains.js.map