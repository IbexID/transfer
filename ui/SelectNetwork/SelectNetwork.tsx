import { ReactNode, FC, useEffect } from 'react';
import { _dropdownEvmNetworks, networks } from '@bridge/config';
import { NetworkShape } from '@bridge/types';
import { useBridgeService } from '@bridge/model/BridgeService';
import { actionLog } from 'shared/lib/utils/log';
import { useAppSelector } from 'shared/lib/hooks';
import { DropmenuSelect, ISelectMenu } from 'shared/ui/DropmenuSelect';
import styles from './SelectNetwork.module.scss';
import { Button } from 'shared/ui';
import { addresses } from '@blockchain/constant';

export const SelectNetwork: FC<{ children: ReactNode }> = ({ children }) => {
  const bridge = useBridgeService();
  const useEvmWallet = bridge.useEvmWallet;
  const useEverWallet = bridge.useEverWallet;
  const evmWallet = useAppSelector((state) => state.evmWallet);
  const everWallet = useAppSelector((state) => state.everWallet);
  const { data } = useAppSelector((state) => state.bridgeService);

  useEffect(() => {
    useEverWallet.connect();
    /* metamask */
    if (window && window.ethereum) {
      const selectedAddress = window.ethereum.selectedAddress;
      if (selectedAddress) {
        bridge.setData({ rightAddress: selectedAddress });
      }
      /* wallet connect */
    } else {
      const address = useEvmWallet.address;
      bridge.setData({ rightAddress: address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!useEverWallet]);

  const changeTargetNetwork = async (value: ISelectMenu<NetworkShape>) => {
    const network = value.prop;
    useEvmWallet.changeNetwork(network.chainId);
    bridge.setData({ rightNetwork: network });
  };

  useEffect(() => {
    const isTvm = everWallet?.data.account;
    if (isTvm) {
      actionLog(evmWallet.data);
      bridge.changeNetwork('left', networks[0]);
      bridge.setData({ leftAddress: isTvm.address.toString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [everWallet.data.account]);

  const selectedNetwork: ISelectMenu = data.rightNetwork
    ? {
        id: data.rightNetwork.id,
        label: data.rightNetwork.name,
      }
    : {
        id: _dropdownEvmNetworks[0].id,
        label: _dropdownEvmNetworks[0].label,
      };
  const evernet =
    typeof window !== 'undefined'
      ? localStorage.getItem('payment_mode') ?? 'main'
      : 'main';

  return (
    <div className={styles.network}>
      {children}
      <div className={styles.network__dropdownWrapper}>
        <h4 className={styles.network__title}>Select Destination Blockchain</h4>
        <DropmenuSelect
          style="additional-dark"
          select={selectedNetwork}
          data={_dropdownEvmNetworks}
          selected={changeTargetNetwork}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          background="blue"
          type="additional"
          onClick={() => bridge.useEvmWallet.watchAsset()}
        >
          Add asset to metamask
        </Button>
        <Button
          background="blue"
          type="additional"
          onClick={() =>
            bridge.useEverWallet.addAsset(addresses[evernet].tokenRoot)
          }
        >
          Add asset to everwallet
        </Button>
      </div>
    </div>
  );
};
