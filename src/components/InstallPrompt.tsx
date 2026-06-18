import React, { useEffect, useRef, useState } from "react";
import { FaDownload, FaTimes, FaShareSquare, FaPlus } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "schulhub:install-prompt-dismissed";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // hide for 7 days after dismiss

const isIos = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iPadOnMac =
    navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || iPadOnMac;
};

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if ((window.navigator as any).standalone === true) return true; // iOS Safari flag
  return false;
};

const wasRecentlyDismissed = (): boolean => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
};

const InstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(isStandalone());
  const [dismissed, setDismissed] = useState<boolean>(wasRecentlyDismissed());
  const [showIosModal, setShowIosModal] = useState<boolean>(false);
  const iosModalRef = useRef<HTMLDivElement>(null);

  const t = (() => {
    if (language === "de") {
      return {
        install: "Installieren",
        installApp: "App installieren",
        hint: "Auf dem Home-Bildschirm hinzufügen",
        dismiss: "Schließen",
        iosTitle: "Auf iPhone installieren",
        iosStep1: "Tippe auf das Teilen-Symbol unten in Safari",
        iosStep2: "Wähle „Zum Home-Bildschirm“",
        iosStep3: "Bestätige mit „Hinzufügen“",
        ok: "Verstanden",
      };
    }
    if (language === "en") {
      return {
        install: "Install",
        installApp: "Install app",
        hint: "Add to your home screen",
        dismiss: "Close",
        iosTitle: "Install on iPhone",
        iosStep1: "Tap the Share button at the bottom of Safari",
        iosStep2: "Choose “Add to Home Screen”",
        iosStep3: "Confirm with “Add”",
        ok: "Got it",
      };
    }
    return {
      install: "Инсталирай",
      installApp: "Инсталирай приложението",
      hint: "Добави на началния екран",
      dismiss: "Затвори",
      iosTitle: "Инсталиране на iPhone",
      iosStep1: "Натисни бутона за споделяне долу в Safari",
      iosStep2: "Избери „Към началния екран“",
      iosStep3: "Потвърди с „Add“ / „Добави“",
      ok: "Разбрах",
    };
  })();

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showIosModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowIosModal(false);
    };
    const onClick = (e: MouseEvent) => {
      if (
        iosModalRef.current &&
        !iosModalRef.current.contains(e.target as Node)
      ) {
        setShowIosModal(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showIosModal]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    if (isIos()) {
      setShowIosModal(true);
    }
  };

  if (installed) return null;
  if (dismissed) return null;

  const supportsNativePrompt = !!deferredPrompt;
  const supportsIosInstructions = isIos();
  const visible = supportsNativePrompt || supportsIosInstructions;
  if (!visible) return null;

  return (
    <>
      <div
        className="fixed bottom-4 right-4 z-[400] flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:bottom-6 sm:right-6"
        role="region"
        aria-label={t.installApp}
      >
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105 active:scale-95"
          aria-label={t.installApp}
          title={t.hint}
        >
          <FaDownload className="text-base" />
          <span>{t.install}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label={t.dismiss}
          title={t.dismiss}
        >
          <FaTimes />
        </button>
      </div>

      {showIosModal && (
        <div
          className="fixed inset-0 z-[500] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <div
            ref={iosModalRef}
            className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2
                id="ios-install-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {t.iosTitle}
              </h2>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label={t.dismiss}
              >
                <FaTimes />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  <FaShareSquare />
                </span>
                <span>{t.iosStep1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
                  <FaPlus />
                </span>
                <span>{t.iosStep2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
                  3
                </span>
                <span>{t.iosStep3}</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.02] active:scale-95"
            >
              {t.ok}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
