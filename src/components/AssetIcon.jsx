function Glyph({ symbol }) {
  switch (symbol) {
    case 'BTC':
      return <text x="50%" y="58%" textAnchor="middle" fontSize="40" fontWeight="700" fill="currentColor">₿</text>;
    case 'ETH':
      return (
        <>
          <path d="M32 18 48 8l16 10-16 10-16-10Z" fill="currentColor" opacity="0.95" />
          <path d="M32 36 48 28l16 8-16 28-16-28Z" fill="currentColor" opacity="0.75" />
        </>
      );
    case 'USDT':
      return (
        <>
          <circle cx="48" cy="48" r="26" fill="none" stroke="currentColor" strokeWidth="6" />
          <text x="50%" y="56%" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor">T</text>
        </>
      );
    case 'LTC':
      return <text x="50%" y="58%" textAnchor="middle" fontSize="38" fontWeight="700" fill="currentColor">Ł</text>;
    case 'SOL':
      return (
        <>
          <rect x="24" y="22" width="48" height="10" rx="5" fill="currentColor" opacity="0.96" />
          <rect x="24" y="42" width="48" height="10" rx="5" fill="currentColor" opacity="0.8" />
          <rect x="24" y="62" width="48" height="10" rx="5" fill="currentColor" opacity="0.64" />
        </>
      );
    case 'BNB':
      return (
        <>
          <path d="M48 18 58 28 48 38 38 28 48 18Z" fill="currentColor" />
          <path d="M31 35 40 44 31 53 22 44 31 35Z" fill="currentColor" opacity="0.76" />
          <path d="M65 35 74 44 65 53 56 44 65 35Z" fill="currentColor" opacity="0.76" />
          <path d="M48 50 60 62 48 74 36 62 48 50Z" fill="currentColor" opacity="0.88" />
        </>
      );
    case 'XRP':
      return (
        <>
          <path d="M26 31c6 0 9 2 14 7s8 7 14 7h16" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M70 65c-6 0-9-2-14-7s-8-7-14-7H26" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    default:
      return <text x="50%" y="58%" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor">{symbol.slice(0, 1)}</text>;
  }
}

export default function AssetIcon({ asset, size = 40 }) {
  if (asset.iconUrl) {
    return <img src={asset.iconUrl} alt={asset.symbol} className="asset-icon asset-icon--image" style={{ width: size, height: size }} />;
  }

  return (
    <div className="asset-icon" style={{ width: size, height: size, color: asset.accent || '#5f8cff' }} aria-hidden="true">
      <svg viewBox="0 0 96 96" role="img" aria-label={asset.symbol}>
        <circle cx="48" cy="48" r="42" fill="currentColor" opacity="0.12" />
        <Glyph symbol={asset.symbol} />
      </svg>
    </div>
  );
}
