import { isLikelyUrl } from '../utils/storage';

export default function BrandMark({ branding, size = 44, className = '' }) {
  const src = branding.logoDataUrl || branding.logoUrl;
  const initials = String(branding.shortName || branding.siteName || 'EX')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 3)
    .toUpperCase();

  if (src && isLikelyUrl(src)) {
    return <img className={`brand-mark brand-mark--image ${className}`.trim()} src={src} alt={branding.siteName} style={{ width: size, height: size }} />;
  }

  return (
    <div className={`brand-mark ${className}`.trim()} style={{ width: size, height: size }} aria-hidden="true">
      <span>{initials}</span>
    </div>
  );
}
