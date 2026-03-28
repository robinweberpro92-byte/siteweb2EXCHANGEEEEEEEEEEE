import { useApp } from '../../context/AppContext';

export default function ExchangeRecipientStep({ flow, value, onChange, error, onBack, onNext }) {
  const { language } = useApp();
  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Destination' : 'Destination'}</p>
          <h3>{flow.recipientLabel}</h3>
          <p className="muted">{language === 'fr' ? 'Cette destination restera visible jusqu’à la confirmation finale.' : 'This destination will remain visible until final confirmation.'}</p>
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
