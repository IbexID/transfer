import { useBridgeService } from '@bridge/model/BridgeService';
import { getGas } from '@bridge/utils/get-gas';
import BigNumber from 'bignumber.js';
import { transferStore } from 'entities/Transfer/model';
import { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'shared/lib';
import { Button, InputLabel, notify, Spinner } from 'shared/ui';
import styles from './TransferSummary.module.scss';
import { compareBalance } from 'shared/lib/utils/compareBalance';

const Input = ({ value, label }: { value: string; label: string }) => (
  <InputLabel
    className={styles.summary__input}
    isNoneTranslate
    label={label}
    type={'text'}
    content="text"
    readOnly
    defaultValue={value}
  ></InputLabel>
);

export const TransferSummary: FC = () => {
  const bridge = useBridgeService();
  const everWallet = bridge.useEverWallet;
  const dispatch = useAppDispatch();
  const [attachedAmount, setAttachedAmount] = useState('0');
  const { data } = useAppSelector((state) => state.bridgeService);

  const prevStep = () => {
    dispatch(transferStore.actions.setPrevStep());
  };

  const onReject = (e?: any) => {
    notify.create({ message: e.message, type: 'error' });
    prevStep();
  };

  const transfer = async () => {
    dispatch(transferStore.actions.setNextStep());
    await bridge.transferToEvm(
      (e) => onReject(e),
      () => {
        bridge.setState({ isTransferFinished: true });
        notify.create({ message: 'Transfer successful', type: 'success' });
      },
    );
  };

  useEffect(() => {
    getGas(bridge).then((r) => setAttachedAmount(r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEnoughEvers =
    +new BigNumber(everWallet.balance)
      .shiftedBy(-everWallet.coin.decimals)
      .toFixed() >= +attachedAmount;

  return (
    <div className={styles.summary}>
      <Input value={bridge.useEverWallet.address} label="From" />
      <Input value={bridge.useEvmWallet.address} label="To" />
      <div className={styles.summary__row}>
        <Input
          value={`${bridge.data.amount} ${bridge.data.token.symbol}`}
          label="Amount"
        />
        <Input value={`${attachedAmount} EVER`} label="Attached amount" />
      </div>
      <div className={styles.summary__buttons}>
        <Button
          className={styles.summary__button}
          background="blue"
          type="main"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          className={styles.summary__button}
          background="blue"
          type="main"
          onClick={transfer}
          disabled={
            bridge.state.isFetching ||
            bridge.state.isCalculating ||
            !!bridge.state.evmPendingWithdrawal ||
            !bridge.data.amount ||
            !compareBalance(data.token, data.amount) ||
            bridge.isBalanceLoading ||
            !isEnoughEvers
          }
        >
          Transfer
        </Button>
        {bridge.state.isProcessing && <Spinner isFinished={false} isWhite />}
      </div>
    </div>
  );
};
