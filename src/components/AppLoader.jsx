import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';

export default function AppLoader({ branding, text, enabled = true }) {
  const [visible, setVisible] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  if (!visible) return null;

  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="app-loader__glow" />
      <div className="app-loader__content">
        <div className="app-loader__mark">
          <BrandMark branding={branding} size={84} />
        </div>
        <strong>{branding.siteName}</strong>
        <p>{text}</p>
        <div className="app-loader__progress">
          <span />
        </div>
      </div>
    </div>
  );
}
