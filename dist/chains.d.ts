export declare const CHAINS: {
    readonly ETHEREUM: {
        readonly id: 1;
        readonly name: "Ethereum";
        readonly rpc: string;
        readonly explorer: "https://etherscan.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly OPTIMISM: {
        readonly id: 10;
        readonly name: "Optimism";
        readonly rpc: "https://mainnet.optimism.io";
        readonly explorer: "https://optimistic.etherscan.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly ARBITRUM: {
        readonly id: 42161;
        readonly name: "Arbitrum One";
        readonly rpc: "https://arb1.arbitrum.io/rpc";
        readonly explorer: "https://arbiscan.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly BASE: {
        readonly id: 8453;
        readonly name: "Base";
        readonly rpc: "https://mainnet.base.org";
        readonly explorer: "https://basescan.org";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly POLYGON: {
        readonly id: 137;
        readonly name: "Polygon POS";
        readonly rpc: string;
        readonly explorer: "https://polygonscan.com";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "MATIC";
            readonly symbol: "MATIC";
            readonly decimals: 18;
        };
    };
    readonly POLYGON_ZKEVM: {
        readonly id: 1101;
        readonly name: "Polygon zkEVM";
        readonly rpc: "https://zkevm-rpc.com";
        readonly explorer: "https://zkevm.polygonscan.com";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly ZKSYNC: {
        readonly id: 324;
        readonly name: "zkSync Era";
        readonly rpc: "https://mainnet.era.zksync.io";
        readonly explorer: "https://explorer.zksync.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly LINEA: {
        readonly id: 59144;
        readonly name: "Linea";
        readonly rpc: "https://rpc.linea.build";
        readonly explorer: "https://lineascan.build";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly SCROLL: {
        readonly id: 534352;
        readonly name: "Scroll";
        readonly rpc: "https://rpc.scroll.io";
        readonly explorer: "https://scrollscan.com";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly MANTLE: {
        readonly id: 5000;
        readonly name: "Mantle";
        readonly rpc: "https://rpc.mantle.xyz";
        readonly explorer: "https://mantlescan.info";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Mantle";
            readonly symbol: "MNT";
            readonly decimals: 18;
        };
    };
    readonly METIS: {
        readonly id: 1088;
        readonly name: "Metis";
        readonly rpc: "https://andromeda.metis.io/?owner=1088";
        readonly explorer: "https://andromeda-explorer.metis.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Metis";
            readonly symbol: "METIS";
            readonly decimals: 18;
        };
    };
    readonly BLAST: {
        readonly id: 81457;
        readonly name: "Blast";
        readonly rpc: "https://rpc.blast.io";
        readonly explorer: "https://blastscan.io";
        readonly type: "EVM";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    readonly SOLANA: {
        readonly id: 101;
        readonly name: "Solana";
        readonly rpc: string;
        readonly explorer: "https://explorer.solana.com";
        readonly type: "SOLANA";
        readonly nativeCurrency: {
            readonly name: "Solana";
            readonly symbol: "SOL";
            readonly decimals: 9;
        };
    };
};
export type Chain = keyof typeof CHAINS;
export type ChainType = 'EVM' | 'SOLANA';
export declare const EVM_CHAINS: Record<string, (typeof CHAINS)[keyof typeof CHAINS]>;
export declare const SOLANA_CHAINS: Record<string, (typeof CHAINS)[keyof typeof CHAINS]>;
export declare function getChainById(chainId: number): Chain | undefined;
export declare function getChainRPC(chain: Chain): string;
export declare function getChainExplorer(chain: Chain): string;
export declare function isValidChain(chain: string): chain is Chain;
//# sourceMappingURL=chains.d.ts.map