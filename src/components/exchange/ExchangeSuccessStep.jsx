import { Link } from 'react-router-dom';
import Badge from '../Badge';
import { useApp } from '../../context/AppContext';

export default function ExchangeSuccessStep({ appData, transaction, onRestart }) {
  const { copy, language } = useApp();
  if (!transaction) return null;

  return (
    <div className="exchange-step">
      <div className="success-state">
        <Badge tone="success">{language === 'fr' ? 'Demande reçue' : 'Request received'}</Badge>
        <h3>{copy.exchange.confirmationMessage}</h3>
        <p>{copy.exchange.verificationMessage}</p>
        <div className="summary-list">
          <div className="summary-row"><span>{language === 'fr' ? 'ID transaction' : 'Transaction ID'}</span><strong>{transaction.id}</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Référence' : 'Reference'}</span><strong>{transaction.reference}</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Délai estimé' : 'Estimated delay'}</span><strong>{appData.exchange.estimatedDelay}</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Statut' : 'Status'}</span><strong>{transaction.status}</strong></div>
        </div>
        <div className="step-actions step-actions--center">
          <button type="button" className="button button--ghost" onClick={onRestart}>{language === 'fr' ? 'Créer une nouvelle demande' : 'Create another request'}</button>
          <Link to="/transactions" className="button button--primary">{language === 'fr' ? 'Voir les transactions' : 'View transactions'}</Link>
        </div>
      </div>
    </div>
  );
}
