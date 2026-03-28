import Badge from '../Badge';
import { FLOW_DEFINITIONS } from '../../utils/exchange';
import { useApp } from '../../context/AppContext';

export default function ExchangeLandingStep({ appData, onSelect }) {
  const { copy, language } = useApp();

  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Flux disponibles' : 'Available flows'}</p>
          <h3>{language === 'fr' ? 'Choisissez le type d’opération' : 'Choose the operation type'}</h3>
          <p className="muted">{language === 'fr' ? 'Les cartes affichées ci-dessous suivent directement les combinaisons activées dans l’admin.' : 'The cards below directly follow the combinations enabled from the admin panel.'}</p>
        </div>
      </div>

      <div className="flow-grid">
        {FLOW_DEFINITIONS.filter((flow) => appData.exchange.flowAvailability[flow.key]).map((flow) => (
          <button key={flow.key} type="button" className="flow-card" onClick={() => onSelect(flow.key)}>
            <div className="flow-card__head">
              <Badge tone="info">{copy.exchange.flowLabels[flow.key] || flow.label}</Badge>
              <span>{flow.paymentMethod}</span>
            </div>
            <strong>{copy.exchange.flowLabels[flow.key] || flow.label}</strong>
            <p>
              {language === 'fr'
                ? `${flow.paymentMethod} en source, ${flow.receiveMethod} en destination. Le formulaire et les instructions s’adaptent automatiquement.`
                : `${flow.paymentMethod} as source, ${flow.receiveMethod} as destination. The form and instructions adapt automatically.`}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
