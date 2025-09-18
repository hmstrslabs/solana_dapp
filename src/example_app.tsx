import '@solana/wallet-adapter-react-ui/styles.css';

import { FC } from 'react';
import { SolanaWalletProvider } from './context/wallet_context';
import { ClaimrWrapper } from './claimr_wrapper';
import { MainPage } from './main_page';

export const ExampleApp: FC = () => {
    return (
        <SolanaWalletProvider>
            <ClaimrWrapper>
                <MainPage />
            </ClaimrWrapper>
        </SolanaWalletProvider>
    );
};

export default ExampleApp;
