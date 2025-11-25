import { useState, useEffect } from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  actionUrl?: string;
  actionText?: string;
  storageKey?: string;
}

export default function ErrorBanner({ message, onDismiss, actionUrl, actionText, storageKey = "error_banner_dismissed" }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });

  useEffect(() => {
    if (dismissed) {
      localStorage.setItem(storageKey, "true");
    }
  }, [dismissed, storageKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <div>
          <strong>⚠️ Setup Required</strong>
          <p>{message}</p>
          {actionUrl && (
            <a href={actionUrl} target="_blank" rel="noreferrer" className="btn primary small">
              {actionText || "Fix Now"}
            </a>
          )}
        </div>
        <button className="btn ghost small" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}

