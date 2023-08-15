import { FC } from 'react';
import { BridgeServiceContextProvider } from '@bridge/model/BridgeService';
import { useAppSelector } from 'shared/lib';
import { SelectAssets } from './ui/SelectAssets';
import { TransferSummary } from './ui/TransferSummary';
import { TransferInProgress } from './ui/TransferInProgress';

export const TransferTvmEvm: FC = () => {
  const transferStep = useAppSelector((state) => state.transfer.step);
  return (
    <BridgeServiceContextProvider>
      {transferStep === 1 && <SelectAssets />}
      {transferStep === 2 && <TransferSummary />}
      {transferStep === 3 && <TransferInProgress />}
    </BridgeServiceContextProvider>
  );
};
