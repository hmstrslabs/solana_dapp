import { FC } from 'react';
import { ClaimrWrapper } from './claimr_wrapper';
import { MainPage } from './main_page';

export const ExampleApp: FC = () => {
    return (
        <ClaimrWrapper>
            <MainPage />
        </ClaimrWrapper>
    );
};

export default ExampleApp;
