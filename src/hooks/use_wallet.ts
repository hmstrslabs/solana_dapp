import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';

export const useWallet = () => {
    const { connection } = useConnection();
    const wallet = useSolanaWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!wallet.publicKey) {
            setBalance(null);
            return;
        }

        try {
            setLoading(true);
            const lamports = await connection.getBalance(wallet.publicKey);
            setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(null);
        } finally {
            setLoading(false);
        }
    }, [connection, wallet.publicKey]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        ...wallet,
        balance,
        loading,
        refreshBalance: fetchBalance,
    };
};
