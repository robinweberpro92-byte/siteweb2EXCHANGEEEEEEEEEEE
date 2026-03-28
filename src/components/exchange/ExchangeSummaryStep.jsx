import { useApp } from '../../context/AppContext';

export default function ExchangeSummaryStep({ flow, recipient, estimate, reference, onBack, onNext }) {
  const { copy, language } = useApp();
  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Récapitulatif' : 'Summary'}</p>
          <h3>{language === 'fr' ? 'Contrôlez les informations avant de poursuivre' : 'Review your information before continuing'}</h3>
          <p className="muted">{language === 'fr' ? 'Vérifiez calmement vos informations avant de suivre les instructions.' : 'Review your details carefully before following the instructions.'}</p>
        </div>
      </div>

      <div className="summary-list">
        <div className="summary-row"><span>{language === 'fr' ? 'Flux' : 'Flow'}</span><strong>{copy.exchange.flowLabels[flow.key] || flow.label}</strong></div>
        <div className="summary-row"><span>{language === 'fr' ? 'Montant brut' : 'Gross amount'}</span><strong>{estimate.formattedGrossFiat}</strong></div>
        <div className="summary-row"><span>{language === 'fr' ? 'Frais' : 'Fees'}</span><strong>{estimate.formattedFeeAmount}</strong></div>
        <div className="summary-row"><span>{language === 'fr' ? 'Montant net' : 'Net amount'}</span><strong>{estimate.formattedNetFiat}</strong></div>
        {flow.paymentMethod === 'Crypto' || flow.receiveMethod === 'Crypto' ? (
          <div className="summary-row">
            <span>{flow.receiveMethod === 'Crypto' ? (language === 'fr' ? 'Crypto estimée' : 'Estimated crypto') : (language === 'fr' ? 'Crypto à envoyer' : 'Crypto to send')}</span>
            <strong>{estimate.formattedCryptoAmount}</strong>
          </div>
        ) : null}
        <div className="summary-row"><span>{language === 'fr' ? 'Destination' : 'Destination'}</span><strong>{recipient}</strong></div>
        <div className="summary-row"><span>{language === 'fr' ? 'Référence' : 'Reference'}</span><strong>{reference}</strong></div>
      </div>

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>{language === 'fr' ? 'Retour' : 'Back'}</button>
        <button type="button" className="button button--primary" onClick={onNext}>{language === 'fr' ? 'Voir les instructions' : 'View instructions'}</button>
      </div>
    </div>
  );
}
