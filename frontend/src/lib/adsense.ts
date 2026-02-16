declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

let scriptLoadingPromise: Promise<void> | null = null;

export function loadAdSenseScript(clientId: string): Promise<void> {
  if (typeof window === "undefined" || !clientId) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  const existing = document.querySelector<HTMLScriptElement>('script[data-adsbygoogle-script="true"]');
  if (existing) {
    scriptLoadingPromise = Promise.resolve();
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${ADSENSE_SCRIPT_SRC}?client=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-adsbygoogle-script", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google AdSense script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function pushAdSenseAd() {
  if (typeof window === "undefined") return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // Ignore errors from AdSense script; ads are non-critical.
  }
}

