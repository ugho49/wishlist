const STORAGE_KEY = 'wl_pwa_install_dismissed';

export type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
};

export type PwaInstallSnapshot = {
  installed: boolean;
  dismissed: boolean;
  canNativeInstall: boolean;
  ios: boolean;
};

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const serverSnapshot: PwaInstallSnapshot = {
  installed: false,
  dismissed: false,
  canNativeInstall: false,
  ios: false,
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let dismissedInMemory = false;
let installedInMemory = false;
let listening = false;
let currentSnapshot: PwaInstallSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function defaultStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage;
  } catch {
    return null;
  }
}

export function readInstallPromptDismissed(storage: ReadableStorage | null = defaultStorage()): boolean {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markInstallPromptDismissed(storage: WritableStorage | null = defaultStorage()): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, '1');
  } catch {
    // Private mode or blocked storage: the in-memory flag still covers this session.
  }
}

export function isPhoneUserAgent(userAgent: string): boolean {
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) {
    return false;
  }

  // Android tablets omit "Mobile".
  if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
    return false;
  }

  return /iPhone|iPod|Android.+Mobile|Windows Phone|IEMobile|webOS/i.test(userAgent);
}

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

function isElementTreeVisible(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;

  while (current) {
    if (current.getAttribute('aria-hidden') === 'true' || current.hasAttribute('hidden')) {
      return false;
    }

    // Closed MUI drawers stay mounted on mobile and keep role="dialog".
    if (current.classList.contains('MuiModal-hidden')) {
      return false;
    }

    const view = current.ownerDocument.defaultView;
    if (view) {
      const style = view.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
    }

    current = current.parentElement;
  }

  return true;
}

export function hasBlockingDialog(doc: Document = document): boolean {
  return Array.from(doc.querySelectorAll<HTMLElement>('[role="dialog"]')).some(dialog => {
    if (dialog.getAttribute('aria-labelledby') === 'install-app-title') {
      return false;
    }

    return isElementTreeVisible(dialog);
  });
}

export function shouldAutoPrompt(input: {
  isPhone: boolean;
  installed: boolean;
  dismissed: boolean;
  canNativeInstall: boolean;
  isIos: boolean;
}): boolean {
  if (!input.isPhone || input.installed || input.dismissed) {
    return false;
  }

  // iOS has no beforeinstallprompt. Other phones wait for the native event so
  // the popup can actually start the installation.
  return input.canNativeInstall || input.isIos;
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
    dismissed: dismissedInMemory || readInstallPromptDismissed(),
    canNativeInstall: deferredPrompt !== null,
    ios: isIosDevice(window.navigator.userAgent, window.navigator.maxTouchPoints, window.navigator.platform),
  };
}

export function getPwaInstallSnapshot(): PwaInstallSnapshot {
  const next = readSnapshot();

  if (
    currentSnapshot.installed === next.installed &&
    currentSnapshot.dismissed === next.dismissed &&
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

export function dismissInstallPrompt(): void {
  dismissedInMemory = true;
  markInstallPromptDismissed();
  emit();
}

export function initPwaInstallListener(): void {
  if (listening || typeof window === 'undefined') {
    return;
  }

  listening = true;

  window.addEventListener('beforeinstallprompt', event => {
    // Keep the event so the settings action can call prompt() later.
    // Preventing the default also hides the browser mini-infobar, which would
    // show again after the in-app popup has already been dismissed.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedInMemory = true;
    dismissInstallPrompt();
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
      dismissInstallPrompt();
    } else {
      emit();
    }

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
