import { Link } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';

export default function ExchangeForm({ compact = false }) {
  return (
    <Card className="exchange-card">
      <div className="exchange-card__head">
        <div>
          <p className="eyebrow">Compatibilité</p>
          <h3>{compact ? 'Accès rapide' : 'Redirection vers le moteur d’échange'}</h3>
        </div>
        <Badge tone="info">Multi-flows</Badge>
      </div>

      <p className="muted">
        Ce composant historique est conservé pour compatibilité. Le parcours actif repose désormais sur la page Exchange dédiée,
        structurée par étapes, règles métiers centralisées et persistance locale.
      </p>

      <div className="step-actions step-actions--left">
        <Link to="/exchange" className="button button--primary">
          Ouvrir l’exchange
        </Link>
      </div>
    </Card>
  );
}
