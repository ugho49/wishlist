import { useEffect, useState } from 'react';

import { usePwaInstall } from '../../hooks/usePwaInstall';
import {
  dismissInstallPrompt,
  hasBlockingDialog,
  isIosSafariUserAgent,
  isPhoneUserAgent,
  shouldAutoPrompt,
} from '../../pwa/pwa-install';
import { InstallAppDialog } from './InstallAppDialog';

const AUTO_PROMPT_DELAY_MS = 2500;

type PromptSession = {
  mode: 'native' | 'ios';
};

export const PwaInstallPrompt = () => {
  const { installed, dismissed, canNativeInstall, ios, promptInstall } = usePwaInstall();
  const [session, setSession] = useState<PromptSession | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const eligible = shouldAutoPrompt({
      isPhone: isPhoneUserAgent(window.navigator.userAgent),
      installed,
      dismissed,
      canNativeInstall,
      isIos: ios,
    });

    if (!eligible) {
      return;
    }

    let timeoutId = 0;
    let intervalId = 0;
    let opened = false;

    const openOnce = () => {
      if (opened || hasBlockingDialog()) {
        return;
      }

      opened = true;
      window.clearInterval(intervalId);
      dismissInstallPrompt();
      setSession({ mode: canNativeInstall ? 'native' : 'ios' });
    };

    timeoutId = window.setTimeout(() => {
      openOnce();

      if (!opened) {
        intervalId = window.setInterval(openOnce, 1000);
      }
    }, AUTO_PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [installed, dismissed, canNativeInstall, ios]);

  const handleInstall = async () => {
    setInstalling(true);

    try {
      const outcome = await promptInstall();

      if (outcome !== 'unavailable') {
        setSession(null);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <InstallAppDialog
      open={session !== null}
      mode={session?.mode ?? 'native'}
      showSafariHint={session?.mode === 'ios' && !isIosSafariUserAgent(window.navigator.userAgent)}
      installing={installing}
      onClose={() => setSession(null)}
      onInstall={() => void handleInstall()}
    />
  );
};
