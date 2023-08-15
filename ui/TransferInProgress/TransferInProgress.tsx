import { useBridgeService } from '@bridge/model/BridgeService';
import { FC } from 'react';
import { Button, H2, H3, Spinner } from 'shared/ui';
import styles from './TransferInProgress.module.scss';

export const TransferInProgress: FC = () => {
  const bridge = useBridgeService();
  const isFinished = bridge.state.isTransferFinished;
  return (
    <div className={styles.progress}>
      <Spinner isFinished={isFinished} />
      <H3 className={styles.progress__title}>
        {isFinished
          ? 'Transfer complete!'
          : 'Please wait, transfer in progress'}
      </H3>
      <Button
        background="blue"
        type="additional"
        onClick={() => bridge.useEvmWallet.watchAsset()}
      >
        Add asset to metamask
      </Button>
    </div>
  );
};
