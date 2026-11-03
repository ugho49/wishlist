import {
  hasBlockingDialog,
  isIosDevice,
  isIosSafariUserAgent,
  isPhoneUserAgent,
  isStandaloneDisplay,
  markInstallPromptDismissed,
  readInstallPromptDismissed,
  shouldAutoPrompt,
} from './pwa-install';

describe('pwa install', () => {
  describe('localStorage dismissal', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('stores a single dismissal flag', () => {
      expect(readInstallPromptDismissed()).toBe(false);

      markInstallPromptDismissed();

      expect(localStorage.getItem('wl_pwa_install_dismissed')).toBe('1');
      expect(readInstallPromptDismissed()).toBe(true);
    });

    it('ignores storage that throws', () => {
      const storage = {
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => {
          throw new Error('denied');
        },
      };

      expect(readInstallPromptDismissed(storage)).toBe(false);
      expect(() => markInstallPromptDismissed(storage)).not.toThrow();
    });

    it('treats a missing storage as not dismissed', () => {
      expect(readInstallPromptDismissed(null)).toBe(false);
      expect(() => markInstallPromptDismissed(null)).not.toThrow();
    });
  });

  describe('isPhoneUserAgent', () => {
    it.each([
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    ])('detects a phone: %s', userAgent => {
      expect(isPhoneUserAgent(userAgent)).toBe(true);
    });

    it.each([
      'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 11; KFTRWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/108.1 like Chrome/108.0 Safari/537.36',
    ])('ignores tablets and desktops: %s', userAgent => {
      expect(isPhoneUserAgent(userAgent)).toBe(false);
    });
  });

  describe('isIosDevice', () => {
    it('detects iPhone and iPad user agents', () => {
      expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)')).toBe(true);
      expect(isIosDevice('Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)')).toBe(true);
    });

    it('detects iPadOS masquerading as a Mac', () => {
      expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5, 'MacIntel')).toBe(true);
    });

    it('does not treat a desktop Mac as iOS', () => {
      expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0, 'MacIntel')).toBe(false);
    });
  });

  describe('isIosSafariUserAgent', () => {
    it('accepts mobile Safari', () => {
      const safari =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

      expect(isIosSafariUserAgent(safari)).toBe(true);
    });

    it('rejects Chrome on iOS', () => {
      const chrome =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1';

      expect(isIosSafariUserAgent(chrome)).toBe(false);
    });
  });

  describe('isStandaloneDisplay', () => {
    it('is installed when the display mode matches or iOS reports standalone', () => {
      expect(isStandaloneDisplay(true, false)).toBe(true);
      expect(isStandaloneDisplay(false, true)).toBe(true);
      expect(isStandaloneDisplay(false, false)).toBe(false);
      expect(isStandaloneDisplay(false, undefined)).toBe(false);
    });
  });

  describe('hasBlockingDialog', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('ignores the closed mobile drawer that stays mounted', () => {
      document.body.innerHTML = `
        <div class="MuiModal-root MuiDrawer-root MuiModal-hidden">
          <div role="dialog">Menu</div>
        </div>
      `;

      expect(hasBlockingDialog()).toBe(false);
    });

    it('ignores a dialog hidden with visibility or aria-hidden', () => {
      document.body.innerHTML = `
        <div style="visibility: hidden"><div role="dialog" id="hidden-visibility">Menu</div></div>
        <div role="dialog" aria-hidden="true" id="hidden-aria">Photo</div>
      `;

      expect(hasBlockingDialog()).toBe(false);
    });

    it('waits while another dialog is actually visible', () => {
      document.body.innerHTML = '<div role="dialog">Ajouter une photo</div>';

      expect(hasBlockingDialog()).toBe(true);
    });

    it('does not treat the install dialog as blocking', () => {
      document.body.innerHTML = '<div role="dialog" aria-labelledby="install-app-title">Installer</div>';

      expect(hasBlockingDialog()).toBe(false);
    });
  });

  describe('shouldAutoPrompt', () => {
    const ready = {
      isPhone: true,
      installed: false,
      dismissed: false,
      canNativeInstall: true,
      isIos: false,
    };

    it('shows once on a phone that can install natively', () => {
      expect(shouldAutoPrompt(ready)).toBe(true);
    });

    it('shows the iOS instructions without a native prompt', () => {
      expect(shouldAutoPrompt({ ...ready, canNativeInstall: false, isIos: true })).toBe(true);
    });

    it('waits for the native event on Android', () => {
      expect(shouldAutoPrompt({ ...ready, canNativeInstall: false, isIos: false })).toBe(false);
    });

    it('does not show on desktop, when installed, or after dismissal', () => {
      expect(shouldAutoPrompt({ ...ready, isPhone: false })).toBe(false);
      expect(shouldAutoPrompt({ ...ready, installed: true })).toBe(false);
      expect(shouldAutoPrompt({ ...ready, dismissed: true })).toBe(false);
    });
  });
});
