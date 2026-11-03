import { useSyncExternalStore } from 'react';

import {
  getPwaInstallServerSnapshot,
  getPwaInstallSnapshot,
  promptPwaInstall,
  shouldOfferInstall,
  subscribePwaInstall,
} from '../pwa/pwa-install';

export function usePwaInstall() {
  const snapshot = useSyncExternalStore(subscribePwaInstall, getPwaInstallSnapshot, getPwaInstallServerSnapshot);

  return {
    canOfferInstall: shouldOfferInstall(snapshot),
    canNativeInstall: snapshot.canNativeInstall,
    ios: snapshot.ios,
    promptInstall: promptPwaInstall,
  };
}
