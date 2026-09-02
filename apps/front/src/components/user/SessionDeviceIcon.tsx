import type { SvgIconProps } from '@mui/material';

import DevicesIcon from '@mui/icons-material/Devices';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import { match } from 'ts-pattern';

import { UserSessionDeviceType } from '../../gql';

export type SessionDeviceIconProps = {
  type: UserSessionDeviceType;
  fontSize?: SvgIconProps['fontSize'];
};

export const SessionDeviceIcon = ({ type, fontSize }: SessionDeviceIconProps) =>
  match(type)
    .with(UserSessionDeviceType.Mobile, () => <PhoneIphoneIcon fontSize={fontSize} />)
    .with(UserSessionDeviceType.Tablet, () => <TabletMacIcon fontSize={fontSize} />)
    .with(UserSessionDeviceType.Desktop, () => <LaptopMacIcon fontSize={fontSize} />)
    .with(UserSessionDeviceType.Unknown, () => <DevicesIcon fontSize={fontSize} />)
    .exhaustive();
