import { useBridgeService } from '@bridge/model/BridgeService';
import { CrosschainBridgeStep } from '@bridge/types';
import { transferStore } from 'entities/Transfer/model';
import { FC } from 'react';
import { useAppDispatch, useAppSelector, useTranslate } from 'shared/lib';
import { compareBalance } from 'shared/lib/utils/compareBalance';
import { notify, Spinner } from 'shared/ui';
import styles from './Connect.module.scss';
import { ButtonMain } from 'shared/ui/buttons/ButtonMain';
import { usePaymentEnv } from 'entities/Viewer/model/store';

export const Connect: FC = () => {
  const bridge = useBridgeService();
  const rightWallet = bridge.useEvmWallet;
  const evmWallet = useAppSelector((state) => state.evmWallet);
  const everWallet = useAppSelector((state) => state.everWallet);
  const { data } = useAppSelector((state) => state.bridgeService);
  const { isTestPayment } = usePaymentEnv();
  const { t } = useTranslate();
  const dispatch = useAppDispatch();

  const transT = (name: string) => {
    return t('profile.Transfer.' + name);
  };

  const connectToWallet = async () => {
    bridge.setIsBalanceLoading(true);
    try {
      await rightWallet.connectMetamask();
    } catch {
      return 1;
    }
    if (!rightWallet.address) {
      notify.create({
        message: 'Authorize via Metamask extension',
        type: 'error',
      });
    }
    await bridge.setData({ rightNetwork: rightWallet.network });
    await bridge.init(
      everWallet.data.account.address.toString(),
      bridge.data.amount,
      '0',
      'everscaleToEvm',
      isTestPayment,
    );
    bridge.setIsBalanceLoading(false);
  };

  const nextStep = async () => {
    bridge.setState({
      step: CrosschainBridgeStep.TRANSFER,
      isTransferFinished: false,
    });
    dispatch(transferStore.actions.setNextStep());
  };

  return (
    <div>
      {evmWallet?.state.isConnected ? (
        <ButtonMain
          className={styles.connect__button}
          disabled={
            bridge.state.isFetching ||
            bridge.state.isCalculating ||
            !!bridge.state.evmPendingWithdrawal ||
            !bridge.data.amount ||
            !compareBalance(data.token, data.amount) ||
            bridge.data.amount === '0' ||
            bridge.isBalanceLoading
          }
          onClick={nextStep}
        >
          {bridge.state.isFetching || bridge.isBalanceLoading ? (
            <Spinner isSmall isWhite isFinished={false} />
          ) : (
            t('common.Transfer')
          )}
        </ButtonMain>
      ) : (
        <ButtonMain
          disabled={evmWallet.state?.isConnecting}
          className={styles.connect__button}
          onClick={connectToWallet}
        >
          {transT('Connect Metamask')}
        </ButtonMain>
      )}
    </div>
  );
};

export default Connect;
