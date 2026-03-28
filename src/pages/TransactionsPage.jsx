import { useMemo, useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useApp } from '../context/AppContext';
import { euro, formatDateTime, statusTone } from '../utils/format';

export default function TransactionsPage() {
  const { config, auth, copy, language } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [asset, setAsset] = useState('all');

  const rows = useMemo(() => {
    const source = auth.isGuest
      ? config.transactions.filter((transaction) => transaction.userId === auth.userId)
      : auth.role === 'user'
        ? config.transactions.filter((transaction) => transaction.userEmail.toLowerCase() === auth.email.toLowerCase())
        : config.transactions;

    return source.filter((transaction) => {
      const query = search.trim().toLowerCase();
      const matchesQuery = !query || `${transaction.id} ${transaction.userName} ${transaction.userEmail} ${transaction.type}`.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || transaction.status === status;
      const matchesAsset = asset === 'all' || transaction.asset === asset;
      return matchesQuery && matchesStatus && matchesAsset;
    });
  }, [config.transactions, auth.email, auth.role, auth.userId, auth.isGuest, search, status, asset]);

  const assetOptions = Array.from(new Set(config.transactions.map((transaction) => transaction.asset).filter(Boolean)));
  const totalNet = rows.reduce((sum, item) => sum + Number(item.amountNet || 0), 0);
  const pendingCount = rows.filter((item) => String(item.status).toLowerCase().includes('attente') || String(item.status).toLowerCase().includes('cours')).length;

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">{copy.nav.transactions}</span>
        <h1>{copy.transactions.title}</h1>
        <p>{copy.transactions.subtitle}</p>
      </div>

      <div className="dashboard-grid dashboard-grid--metrics compact-grid">
        <Card className="stat-card stat-card--dashboard"><span>{language === 'fr' ? 'Dossiers filtrés' : 'Filtered requests'}</span><strong>{rows.length}</strong><small>{language === 'fr' ? 'dans cette vue' : 'in this view'}</small></Card>
        <Card className="stat-card stat-card--dashboard"><span>{language === 'fr' ? 'Volume net' : 'Net volume'}</span><strong>{euro(totalNet, 'EUR', language)}</strong><small>EUR</small></Card>
        <Card className="stat-card stat-card--dashboard"><span>{language === 'fr' ? 'En attente' : 'Pending'}</span><strong>{pendingCount}</strong><small>{language === 'fr' ? 'à surveiller' : 'to monitor'}</small></Card>
      </div>

      <Card className="toolbar-card">
        <div className="section-toolbar section-toolbar--filters">
          <label className="field field--compact">
            <span className="field__label">{language === 'fr' ? 'Recherche' : 'Search'}</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === 'fr' ? 'ID, nom, email, type' : 'ID, name, email, type'} />
          </label>
          <label className="field field--compact">
            <span className="field__label">{language === 'fr' ? 'Statut' : 'Status'}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{language === 'fr' ? 'Tous' : 'All'}</option>
              <option value="En attente">{language === 'fr' ? 'En attente' : 'Pending'}</option>
              <option value="En cours">{language === 'fr' ? 'En cours' : 'In progress'}</option>
              <option value="Confirmée">{language === 'fr' ? 'Confirmée' : 'Confirmed'}</option>
              <option value="Rejetée">{language === 'fr' ? 'Rejetée' : 'Rejected'}</option>
            </select>
          </label>
          <label className="field field--compact">
            <span className="field__label">Asset</span>
            <select value={asset} onChange={(event) => setAsset(event.target.value)}>
              <option value="all">{language === 'fr' ? 'Tous' : 'All'}</option>
              {assetOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{language === 'fr' ? 'Type' : 'Type'}</th>
                <th>{language === 'fr' ? 'Paiement' : 'Payment'}</th>
                <th>{language === 'fr' ? 'Réception' : 'Receive'}</th>
                <th>{language === 'fr' ? 'Net' : 'Net'}</th>
                <th>Asset</th>
                <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th>{language === 'fr' ? 'Date' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.paymentMethod}</td>
                  <td>{transaction.receiveMethod}</td>
                  <td>{euro(transaction.amountNet, 'EUR', language)}</td>
                  <td>{transaction.asset}</td>
                  <td><Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge></td>
                  <td>{formatDateTime(transaction.date, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-history-cards">
          {rows.map((transaction) => (
            <div key={`${transaction.id}-card`} className="history-card">
              <div className="history-card__top">
                <strong>{transaction.id}</strong>
                <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
              </div>
              <p>{transaction.type}</p>
              <div className="history-card__grid">
                <div><span>{language === 'fr' ? 'Paiement' : 'Payment'}</span><strong>{transaction.paymentMethod}</strong></div>
                <div><span>{language === 'fr' ? 'Réception' : 'Receive'}</span><strong>{transaction.receiveMethod}</strong></div>
                <div><span>Net</span><strong>{euro(transaction.amountNet, 'EUR', language)}</strong></div>
                <div><span>Date</span><strong>{formatDateTime(transaction.date, language)}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
