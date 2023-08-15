import { FC, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { mapChainTokens } from '@bridge/utils/mapTokens';
import { isGoodBignumber } from '@bridge/utils/is-good-bignumber';
import { BridgeAsset } from '@bridge/model/BridgeAssetsService/interfaces';
import { useSelectors } from '@bridge/model/BridgeService/selectors';
import { useBridgeService } from '@bridge/model/BridgeService';
import { getBridgeAsset } from '@bridge/model/BridgeAssetsService/context';
import { useAppSelector, useTranslate } from 'shared/lib/hooks';
import { Input } from 'shared/ui/form-fields';
import { DropmenuSelect, ISelectMenu } from 'shared/ui/DropmenuSelect';
import { compareBalance } from 'shared/lib/utils/compareBalance';
import styles from './SelectToken.module.scss';
import { usePaymentEnv } from 'entities/Viewer/model/store';

export const SelectToken: FC = () => {
  const { isTestPayment, defaultTokenSymbol } = usePaymentEnv();
  const { t } = useTranslate();
  const transT = (name: string) => {
    return t('profile.Transfer.' + name);
  };

  const bridge = useBridgeService();
  const { isBalanceLoading, setIsBalanceLoading } = bridge;
  const useEvmWallet = bridge.useEvmWallet;
  const useEverWallet = bridge.useEverWallet;
  const { setAsset } = useSelectors();
  const assets = getBridgeAsset(setAsset, useEverWallet, useEvmWallet);
  const { data } = useAppSelector((state) => state.bridgeService);

  const tokensList_ = useMemo(
    () =>
      mapChainTokens(
        assets.tokens,
        data?.leftNetwork?.chainId,
        defaultTokenSymbol,
      ),
    [assets.tokens, data?.leftNetwork?.chainId, defaultTokenSymbol],
  );

  const [chosenToken, setChosenToken] = useState<ISelectMenu<BridgeAsset>>(
    isTestPayment ? tokensList_[0] : undefined,
  );

  const onChange = (value: string) => {
    bridge.setData({ amount: value });
  };

  const getMaxValue = () => {
    try {
      const decimals = chosenToken.prop.decimals;
      const value = new BigNumber(chosenToken.prop.balance || 0);
      if (!isGoodBignumber(value)) {
        return '0';
      }
      if (chosenToken.prop.decimals !== undefined && decimals !== undefined) {
        return value
          .shiftedBy(-chosenToken.prop.decimals)
          .dp(decimals, BigNumber.ROUND_DOWN)
          .toFixed();
      }
      return '0';
    } catch {
      return '0';
    }
  };

  const onMaximize = (): void => {
    onChange(getMaxValue());
  };

  const selectedToken: ISelectMenu<BridgeAsset> = isBalanceLoading
    ? chosenToken
    : { id: data.token?.root };

  const areWalletsConnected =
    bridge.useEverWallet.isConnected && bridge.useEvmWallet.isConnected;

  const shouldDisplayBalanceError =
    areWalletsConnected &&
    bridge.data.amount &&
    !compareBalance(data.token, data.amount) &&
    !isBalanceLoading;

  const selectToken = async (value: ISelectMenu<BridgeAsset>) => {
    if (!value?.id) return;
    setIsBalanceLoading(true);
    setChosenToken(value);
    bridge.setData({ selectedToken: value.prop.data.root });
    await bridge.setToken(
      value.prop.data.chainId as string,
      defaultTokenSymbol,
    );
    setIsBalanceLoading(false);
  };

  useEffect(() => {
    selectToken(tokensList_[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTokenSymbol]);

  return (
    <div className={styles.network__dropdownWrapper}>
      <DropmenuSelect
        key={data?.rightNetwork?.chainId + isTestPayment}
        data={tokensList_}
        maxAmount={isBalanceLoading ? '0' : getMaxValue()}
        select={selectedToken}
        selected={selectToken}
        style="additional-dark"
      />
      <Input
        inputMode="decimal"
        className={styles.transfer__input}
        content="withdrawal"
        placeholder={transT('Enter withdrawal amount')}
        type="number"
        onChange={
          bridge.state.isFetching || bridge.state.isLocked
            ? undefined
            : onChange
        }
        defaultValue={bridge.data.amount}
        setDefaultValue={
          bridge.state.isFetching || bridge.state.isLocked
            ? () => {}
            : onMaximize
        }
        isNoneErrorIcon
      />
      {shouldDisplayBalanceError && <p>Not enough balance</p>}
    </div>
  );
};
