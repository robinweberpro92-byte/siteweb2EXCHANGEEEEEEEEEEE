import { useApp } from '../../context/AppContext';

export default function ExchangeRecipientStep({ flow, value, onChange, error, onBack, onNext }) {
  const { language } = useApp();
  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Destination' : 'Destination'}</p>
          <h3>{flow.recipientLabel}</h3>
          <p className="muted">{language === 'fr' ? 'Cette information est utilisée dans le récapitulatif final et dans le suivi de transaction.' : 'This information is reused in the final summary and transaction tracking.'}</p>
        </div>
      </div>

      <label className="field">
        <span className="field__label">{flow.recipientLabel}</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={flow.recipientPlaceholder} />
        {error ? <small className="field__error">{error}</small> : null}
      </label>

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>{language === 'fr' ? 'Retour' : 'Back'}</button>
        <button type="button" className="button button--primary" onClick={onNext}>{language === 'fr' ? 'Continuer' : 'Continue'}</button>
      </div>
    </div>
  );
}
