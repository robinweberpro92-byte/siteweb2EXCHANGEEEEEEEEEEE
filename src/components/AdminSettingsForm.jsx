import { Link } from 'react-router-dom';
import Card from './Card';

export default function AdminSettingsForm() {
  return (
    <Card>
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">Compatibilité</p>
          <h3>Administration centralisée</h3>
          <p className="muted">
            Cette ancienne entrée est conservée pour compatibilité. Toute la configuration est désormais regroupée dans le panel
            admin par onglets avec brouillon local, sauvegarde par section et reset global.
          </p>
        </div>
      </div>

      <div className="step-actions step-actions--left">
        <Link to="/admin" className="button button--primary">
          Ouvrir le panel admin
        </Link>
      </div>
    </Card>
  );
}
