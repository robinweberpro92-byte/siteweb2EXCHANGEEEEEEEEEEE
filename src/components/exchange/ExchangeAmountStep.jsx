import { formatNumber } from '../../utils/format';
import { useApp } from '../../context/AppContext';

export default function ExchangeAmountStep({ appData, flow, asset, value, onChange, estimate, error, onBack, onNext }) {
  const { language } = useApp();
  const isCryptoAmount = flow.amountInputMode === 'crypto';

  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Montant' : 'Amount'}</p>
          <h3>{flow.amountLabel}</h3>
          <p className="muted">{language === 'fr' ? `Le minimum et le maximum sont contrôlés à partir de la valeur notifiée en ${appData.exchange.primaryCurrency}.` : `Minimum and maximum checks are based on the notified ${appData.exchange.primaryCurrency} value.`}</p>
        </div>
      </div>

      <label className="field">
        <span className="field__label">{flow.amountLabel}</span>
        <input
          type="number"
          min="0"
          step={isCryptoAmount ? '0.000001' : '0.01'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={isCryptoAmount ? `0.00 ${asset?.symbol || ''}` : '0.00'}
        />
        {error ? <small className="field__error">{error}</small> : null}
      </label>

      <div className="exchange-estimate-grid">
        <div className="estimate-item">
          <span>{language === 'fr' ? 'Valeur brute' : 'Gross value'}</span>
          <strong>{estimate.formattedGrossFiat}</strong>
        </div>
        <div className="estimate-item">
          <span>{language === 'fr' ? 'Frais' : 'Fees'}</span>
          <strong>{estimate.formattedFeeAmount}</strong>
        </div>
        <div className="estimate-item">
          <span>{language === 'fr' ? 'Montant net' : 'Net amount'}</span>
          <strong>{estimate.formattedNetFiat}</strong>
        </div>
        {asset ? (
          <div className="estimate-item">
            <span>{flow.receiveMethod === 'Crypto' ? (language === 'fr' ? 'Crypto estimée' : 'Estimated crypto') : (language === 'fr' ? 'Quantité à envoyer' : 'Quantity to send')}</span>
            <strong>
              {flow.amountInputMode === 'crypto'
                ? `${formatNumber(value || 0, appData.exchange.roundingDigits, language)} ${asset.symbol}`
                : `${formatNumber(estimate.cryptoAmount, appData.exchange.roundingDigits, language)} ${asset.symbol}`}
            </strong>
          </div>
        ) : null}
      </div>

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>{language === 'fr' ? 'Retour' : 'Back'}</button>
        <button type="button" className="button button--primary" onClick={onNext}>{language === 'fr' ? 'Continuer' : 'Continue'}</button>
      </div>
    </div>
  );
}
