import { isIosDevice, isIosSafariUserAgent, isStandaloneDisplay, shouldOfferInstall } from './pwa-install';

describe('pwa install', () => {
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

  describe('shouldOfferInstall', () => {
    const notInstalled = { installed: false, canNativeInstall: false, ios: false };

    it('offers the install when the browser can prompt natively', () => {
      expect(shouldOfferInstall({ ...notInstalled, canNativeInstall: true })).toBe(true);
    });

    it('offers the iOS instructions without a native prompt', () => {
      expect(shouldOfferInstall({ ...notInstalled, ios: true })).toBe(true);
    });

    it('hides the offer when the browser cannot install the app', () => {
      expect(shouldOfferInstall(notInstalled)).toBe(false);
    });

    it('hides the offer once the app is installed', () => {
      expect(shouldOfferInstall({ installed: true, canNativeInstall: true, ios: false })).toBe(false);
      expect(shouldOfferInstall({ installed: true, canNativeInstall: false, ios: true })).toBe(false);
    });
  });
});
