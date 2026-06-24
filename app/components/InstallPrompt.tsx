"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "glint_install_prompt_dismissed_at";
const DISMISS_DAYS = 7;

function isIos() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isInStandaloneMode() {
  return (
    ("standalone" in window.navigator &&
      (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const DISMISS_KEY = "glint_install_prompt_dismissed_at";
  const DISMISS_DAYS = 14;

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    if (isIos()) {
      setPlatform("ios");
      setShow(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  Install Glint
                </p>
                {platform === "ios" ? (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tap <Share className="h-3 w-3 inline mb-0.5" /> Share, then{" "}
                    <PlusSquare className="h-3 w-3 inline mb-0.5" /> "Add to
                    Home Screen"
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add Glint to your home screen for the full app experience.
                  </p>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {platform === "android" && (
              <Button
                size="sm"
                className="w-full mt-3 gap-2"
                onClick={handleInstall}
              >
                <Download className="h-3.5 w-3.5" /> Install App
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
