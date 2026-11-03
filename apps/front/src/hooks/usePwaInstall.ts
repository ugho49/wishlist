import { useSyncExternalStore } from 'react';

import {
  getPwaInstallServerSnapshot,
  getPwaInstallSnapshot,
  promptPwaInstall,
  subscribePwaInstall,
} from '../pwa/pwa-install';

export function usePwaInstall() {
  const snapshot = useSyncExternalStore(subscribePwaInstall, getPwaInstallSnapshot, getPwaInstallServerSnapshot);

  return {
    installed: snapshot.installed,
    dismissed: snapshot.dismissed,
    canNativeInstall: snapshot.canNativeInstall,
    ios: snapshot.ios,
    promptInstall: promptPwaInstall,
  };
}
