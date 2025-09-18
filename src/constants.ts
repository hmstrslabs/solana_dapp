export const CLAIMR_CONTAINER_ID = 'CLAIMR_CONTAINER';

export const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL;

export const CLAIMR_CONFIG = {
    domain: 'https://dapp.claimr.io',
    appName: 'claimr ⚡ solana dApp example',
    network: 'solana',
} as const; 