export type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
};

export type PwaInstallSnapshot = {
  installed: boolean;
  canNativeInstall: boolean;
  ios: boolean;
};

const serverSnapshot: PwaInstallSnapshot = {
  installed: false,
  canNativeInstall: false,
  ios: false,
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedInMemory = false;
let listening = false;
let currentSnapshot: PwaInstallSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

export function isIosDevice(userAgent: string, maxTouchPoints = 0, platform = ''): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return true;
  }

  // iPadOS 13+ reports a Macintosh user agent.
  return platform === 'MacIntel' && maxTouchPoints > 1;
}

export function isIosSafariUserAgent(userAgent: string, maxTouchPoints = 0, platform = ''): boolean {
  if (!isIosDevice(userAgent, maxTouchPoints, platform)) {
    return false;
  }

  if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA|DuckDuckGo|Instagram|FBAN|FBAV|Line\//i.test(userAgent)) {
    return false;
  }

  return /Safari/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isStandaloneDisplay(displayModeMatches: boolean, navigatorStandalone?: boolean): boolean {
  return displayModeMatches || navigatorStandalone === true;
}

export function shouldOfferInstall(snapshot: PwaInstallSnapshot): boolean {
  if (snapshot.installed) {
    return false;
  }

  // Chromium only fires beforeinstallprompt while the app is not installed yet.
  // iOS has no such event, so the offer stays until the app runs standalone.
  return snapshot.canNativeInstall || snapshot.ios;
}

function isDisplayModeInstalled(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  const displayModeMatches = window.matchMedia(
    '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)',
  ).matches;
  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isStandaloneDisplay(displayModeMatches, navigatorStandalone);
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readSnapshot(): PwaInstallSnapshot {
  if (typeof window === 'undefined') {
    return serverSnapshot;
  }

  return {
    installed: installedInMemory || isDisplayModeInstalled(),
    canNativeInstall: deferredPrompt !== null,
    ios: isIosDevice(window.navigator.userAgent, window.navigator.maxTouchPoints, window.navigator.platform),
  };
}

export function getPwaInstallSnapshot(): PwaInstallSnapshot {
  const next = readSnapshot();

  if (
    currentSnapshot.installed === next.installed &&
    currentSnapshot.canNativeInstall === next.canNativeInstall &&
    currentSnapshot.ios === next.ios
  ) {
    return currentSnapshot;
  }

  currentSnapshot = next;
  return currentSnapshot;
}

export function getPwaInstallServerSnapshot(): PwaInstallSnapshot {
  return serverSnapshot;
}

export function subscribePwaInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function initPwaInstallListener(): void {
  if (listening || typeof window === 'undefined') {
    return;
  }

  listening = true;

  window.addEventListener('beforeinstallprompt', event => {
    // Keep the event so the profile banner can call prompt() later, and hide
    // the browser mini-infobar in favour of that banner.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedInMemory = true;
    emit();
  });
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const promptEvent = deferredPrompt;

  if (!promptEvent) {
    return 'unavailable';
  }

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    deferredPrompt = null;

    if (choice.outcome === 'accepted') {
      installedInMemory = true;
    }

    emit();
    return choice.outcome;
  } catch {
    deferredPrompt = null;
    emit();
    return 'unavailable';
  }
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.MODE === 'test') {
    return;
  }

  const register = () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // The browser menu can still offer installation when registration fails.
    });
  };

  if (document.readyState === 'complete') {
    register();
    return;
  }

  window.addEventListener('load', register, { once: true });
}

export function startPwa(): void {
  initPwaInstallListener();
  registerServiceWorker();
}
