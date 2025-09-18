/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { FC, useCallback, useEffect, useState } from 'react';
import { CLAIMR_CONTAINER_ID } from './constants';
import { nanoid } from 'nanoid';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

import bs58 from 'bs58';

function get_sign_message(message: string, domain: string, ref_id: string) {
    let full_message = `${message}\n\n`;
    full_message += `URI:\n${domain}\n\n`;
    if (ref_id) {
        full_message += `Referral ID:\n${ref_id}\n\n`;
    }
    full_message += `Nonce:\n${nanoid(16)}\n\n`;
    full_message += `Issued At:\n${new Date().toISOString()}`;
    return full_message;
}

export const MainPage: FC = () => { 
    
    const [connected, set_connected] = useState(false);
    const [signature, set_signature] = useState('');
    const { publicKey, connected: is_connected, disconnect, signMessage, signTransaction } = useWallet();
    const { connection } = useConnection();

    const [active_address, set_active_address] = useState(publicKey?.toString());
    const [_, set_ballance] = useState<number | null>(null);

    const on_request = useCallback(
        async (network: string, request: any, program_id: string, instruction_type: string, args: any[]) => {
            if (!publicKey || !signTransaction) {
                console.log('Wallet not connected or does not support transaction signing');
                return '';
            }

            try {
                const transaction = new Transaction();

                if (instruction_type === 'transfer' && args.length >= 2) {
                    const [recipientAddress, amount] = args;
                    transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: publicKey,
                            toPubkey: new PublicKey(recipientAddress),
                            lamports: amount * LAMPORTS_PER_SOL,
                        })
                    );
                }

                const { blockhash } = await connection.getLatestBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = publicKey;

                const signedTransaction = await signTransaction(transaction);
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());

                await connection.confirmTransaction(signature, 'confirmed');

                return signature;
            } catch (err) {
                console.error('Transaction failed:', err);
                return '';
            }
        },
        [publicKey, signTransaction, connection]
    );

    const fetchBalance = useCallback(async () => {
        if (publicKey) {
            try {
                const balance = await connection.getBalance(publicKey);
                set_ballance(balance / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }
    }, [publicKey, connection]);

    useEffect(() => {
        const signature = localStorage?.getItem('demo-signature');
        if (signature) {
            set_signature(signature);
        }

        const params = new URLSearchParams(window.location.search);

        const process_message = (event: MessageEvent<any>) => {
            console.log(event.data);
        };
        if (params.has('events')) {
            window.addEventListener('message', process_message);
        }
        return () => {
            window.removeEventListener('message', process_message);
        };
    }, []);

    useEffect(() => {
        const process_message = async (event: MessageEvent<any>) => {
            if (event.data.event === 'widget::ready') {
                (window as any).claimr.on_request = on_request;
            }
        };
        window.addEventListener('message', process_message);

        return () => {
            window.removeEventListener('message', process_message);
        };
    }, [on_request]);

    useEffect(() => {
        if (is_connected) {
            set_connected(true);
            fetchBalance();
        }
    }, [is_connected, fetchBalance]);

    useEffect(() => {
        if (
            (connected && !is_connected && localStorage?.getItem('demo-signature')) ||
            (active_address && publicKey && active_address !== publicKey.toString())
        ) {
            set_signature('');
            set_connected(false);
            localStorage?.removeItem('demo-signature');
            (window as any).claimr?.logout();
        }
    }, [connected, is_connected, publicKey, active_address]);

    useEffect(() => {
        set_active_address(publicKey?.toString());
    }, [publicKey]);

    const on_sign_message = async () => {
        if (!signMessage) {
            console.error('Wallet does not support message signing');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const message = get_sign_message(
            `claimr ⚡ dApp example`,
            'https://dapp.claimr.io',
            params.get('ref_id') || ''
        );

        try {
            const encoded_message = new TextEncoder().encode(message);
            const signature = await signMessage(encoded_message);
            if (signature) {
                const bg58_signature = bs58.encode(signature);
                set_signature(bg58_signature);
                localStorage?.setItem('demo-signature', bg58_signature);
                (window as any).claimr?.connect_wallet(publicKey?.toString(), bg58_signature, message, 'solana');
            }
        } catch (err) {
            console.error('Message signing failed:', err);
        }
    };

    const on_disconnect = async () => {
        disconnect();
        set_ballance(null);
    };

    return (
        <div className='page'>
            <header>
                <div className='logo'>Your Solana dApp logo</div>
                <div className='flex-spacer' />
                <div className='wallet-buttons'>
                    <WalletMultiButton />
                    {is_connected && <WalletDisconnectButton />}
                </div>
            </header>
            <div className='banner'>
                <div className='title'>
                    This is a demo <b>Solana dApp</b> with Claimr integration
                </div>
                <p>
                    See how easy it is to add Claimr to your Solana decentralized app — from token distribution to
                    participation verification. A simple example of real integration on Solana blockchain.
                </p>
                <menu>
                    <a
                        className={'button'}
                        href='https://claimr-io.gitbook.io/claimr-help-center'
                        target='_blank'
                        rel='noreferrer'
                    >
                        Read docs
                    </a>
                    <a href='/' target='_blank' rel='noreferrer'>
                        Source
                    </a>
                    <a href='https://claimr.io/terms-and-conditions' target='_blank' rel='noreferrer'>
                        Terms and Conditions
                    </a>
                    <a href='https://claimr.io/privacy-policy' target='_blank' rel='noreferrer'>
                        Privacy Policy
                    </a>
                </menu>
            </div>
            {!signature ? (
                <>
                    <div className='flex-spacer' />
                    <div className='dialog-background'>
                        <div className='dialog-frame'>
                            <div className='dialog-title'>Connect your Solana wallet to continue</div>
                            <div className='dialog-text'>
                                Please connect your Solana cryptocurrency wallet to proceed. This will allow us to
                                securely verify your identity and grant you access to the platform's features.
                            </div>
                            {!is_connected ? (
                                <div className='connect-wallet-container'>
                                    <WalletMultiButton className='custom-wallet-button' />
                                </div>
                            ) : (
                                <div className='wallet-actions'>
                                    <button onClick={on_sign_message} className='button'>
                                        Sign-In with Solana
                                    </button>
                                    <button onClick={on_disconnect} className='button secondary-button'>
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='label'>Widget container</div>
                    <div className='claimr-container'>
                        <div id={CLAIMR_CONTAINER_ID} />
                    </div>
                </>
            )}
            <div className='flex-spacer' />
            <footer>
                <div className='copyright'>
                    Powered by{' '}
                    <a href='https://claimr.io' target='_blank' rel='noreferrer'>
                        ⚡ claimr.io™
                    </a>{' '}
                </div>
            </footer>
        </div>
    );
};
