import AssetIcon from '../AssetIcon';
import { useApp } from '../../context/AppContext';

export default function ExchangeAssetStep({ assets, value, onChange, error, onBack, onNext }) {
  const { language } = useApp();
  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Actif' : 'Asset'}</p>
          <h3>{language === 'fr' ? 'Sélectionnez la crypto' : 'Select the asset'}</h3>
          <p className="muted">{language === 'fr' ? 'Les actifs visibles dans cette étape dépendent du marché, des wallets configurés et des règles d’échange.' : 'Visible assets depend on market visibility, configured wallets and exchange rules.'}</p>
        </div>
      </div>

      <div className="asset-grid">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            type="button"
            className={`asset-choice ${value === asset.symbol ? 'is-selected' : ''}`}
            onClick={() => onChange(asset.symbol)}
          >
            <AssetIcon asset={asset} size={42} />
            <div>
              <strong>{asset.name}</strong>
              <span>{asset.symbol}</span>
            </div>
          </button>
        ))}
      </div>

      {error ? <p className="field__error field__error--inline">{error}</p> : null}

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>{language === 'fr' ? 'Retour' : 'Back'}</button>
        <button type="button" className="button button--primary" onClick={onNext}>{language === 'fr' ? 'Continuer' : 'Continue'}</button>
      </div>
    </div>
  );
}
