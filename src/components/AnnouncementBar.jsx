import { useState } from 'react';

export default function AnnouncementBar({ text, tone = 'info' }) {
  const [hidden, setHidden] = useState(false);

  if (!text || hidden) return null;

  return (
    <div className={`announcement announcement--${tone}`}>
      <div className="container announcement__inner">
        <span>{text}</span>
        <button type="button" className="announcement__close" onClick={() => setHidden(true)} aria-label="Dismiss announcement">
          ×
        </button>
      </div>
    </div>
  );
}
