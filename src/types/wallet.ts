import { PublicKey } from '@solana/web3.js';

export interface WalletContextType {
    wallet: any;
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    balance: number | null;
    refreshBalance: () => Promise<void>;
}

export interface WalletProviderProps {
    children: React.ReactNode;
}

export type SupportedWalletName = 'Phantom' | 'Solflare' | 'Slope' | 'Sollet' | 'MathWallet';
