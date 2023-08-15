import { FC } from 'react';
import { Connect } from '../Connect';
import { SelectNetwork } from '../SelectNetwork';
import { SelectToken } from '../SelectToken';

export const SelectAssets: FC = () => {
  return (
    <>
      <SelectNetwork>
        <SelectToken />
      </SelectNetwork>
      <Connect />
    </>
  );
};
