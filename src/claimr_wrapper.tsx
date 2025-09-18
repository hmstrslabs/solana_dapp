import { FC, Fragment, ReactNode, useCallback, useEffect } from 'react';
import { CLAIMR_CONTAINER_ID } from './constants';

const SCRIPT_ID = 'claimr-script';

interface Props {
    children: ReactNode;
}

export const ClaimrWrapper: FC<Props> = ({ children }) => {
    const handle_script_creation = useCallback(() => {
        let script = document.getElementById(SCRIPT_ID);

        if (!script) {
            script = document.createElement('script');

            script.setAttribute('id', SCRIPT_ID);
            script.setAttribute('data-container', CLAIMR_CONTAINER_ID);
            script.setAttribute('src', 'https://widgets.claimr.io/claimr.min.js');
            script.setAttribute('data-organization', 'claimr');
            script.setAttribute('data-campaign', 'solana-dapp');
            script.setAttribute('data-autoresize', 'true');
            script.setAttribute('data-platform', 'dapp');

            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        handle_script_creation();
    }, [handle_script_creation]);

    return <Fragment>{children}</Fragment>;
};
