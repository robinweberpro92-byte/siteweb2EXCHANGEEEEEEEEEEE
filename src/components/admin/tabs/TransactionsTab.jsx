import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection } from '../AdminFormControls';
import { euro, formatDateTime, statusTone } from '../../../utils/format';
import { downloadCSV, generateId } from '../../../utils/storage';

const STATUS_OPTIONS = ['En attente', 'En cours', 'Confirmée', 'Rejetée'];
const FLOW_OPTIONS = ['PayPal → Crypto', 'Crypto → PayPal', 'Paysafecard → Crypto', 'Paysafecard → PayPal'];

export default function TransactionsTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const rows = data.transactions;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flowFilter, setFlowFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    userName: '',
    userEmail: '',
    type: 'PayPal → Crypto',
    paymentMethod: 'PayPal',
    receiveMethod: 'BTC',
    amountGross: 500,
    fees: 12,
    amountNet: 488,
    asset: 'BTC',
    status: 'En attente',
  });

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || `${row.id} ${row.userName} ${row.userEmail} ${row.type}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesFlow = flowFilter === 'all' || row.type === flowFilter;
      const matchesAsset = assetFilter === 'all' || row.asset === assetFilter;
      return matchesSearch && matchesStatus && matchesFlow && matchesAsset;
    });
  }, [rows, search, statusFilter, flowFilter, assetFilter]);

  const totalVolume = filteredRows.reduce((sum, row) => sum + Number(row.amountGross || 0), 0);
  const pendingCount = filteredRows.filter((row) => row.status === 'En attente').length;
  const confirmedCount = filteredRows.filter((row) => row.status === 'Confirmée').length;
  const assetOptions = Array.from(new Set(rows.map((row) => row.asset).filter(Boolean)));

  function updateTransactions(nextRows) {
    onChangeSection('transactions', nextRows);
  }

  function updateRow(id, patch) {
    updateTransactions(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function deleteRow(id) {
    updateTransactions(rows.filter((row) => row.id !== id));
  }

  function addTransaction() {
    if (readOnly || !newTransaction.userName.trim()) return;
    updateTransactions([
      {
        ...newTransaction,
        id: generateId('TX'),
        flowKey: newTransaction.type.replace(/\s+/g, ''),
        userId: generateId('USR'),
        assetQuantity: 0,
        date: new Date().toISOString(),
        recipient: newTransaction.receiveMethod === 'PayPal' ? newTransaction.userEmail : '',
        reference: 'NEW-LOCAL',
        note: 'Ajout manuel depuis l’admin',
      },
      ...rows,
    ]);
    setNewTransaction({ userName: '', userEmail: '', type: 'PayPal → Crypto', paymentMethod: 'PayPal', receiveMethod: 'BTC', amountGross: 500, fees: 12, amountNet: 488, asset: 'BTC', status: 'En attente' });
  }

  function exportRows() {
    downloadCSV('transactions-export.csv', filteredRows.map((row) => ({
      id: row.id,
      user: row.userName,
      email: row.userEmail,
      type: row.type,
      paymentMethod: row.paymentMethod,
      receiveMethod: row.receiveMethod,
      gross: row.amountGross,
      fees: row.fees,
      net: row.amountNet,
      asset: row.asset,
      status: row.status,
      date: row.date,
    })));
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Total transactions" value={String(filteredRows.length)} helper="Vue filtrée" />
        <AdminMetric label="Volume total" value={euro(totalVolume)} helper="Montant brut cumulé" tone="info" />
        <AdminMetric label="En attente" value={String(pendingCount)} helper="À surveiller" tone="warning" />
        <AdminMetric label="Confirmées" value={String(confirmedCount)} helper="Finalisées" tone="success" />
      </div>

      <AdminSection eyebrow="Ajout manuel" title="Créer une transaction locale" description="Ajoutez une ligne crédible à la table pour enrichir le dashboard, l’historique et les compteurs.">
        <div className="field-grid field-grid--4">
          <AdminField label="Utilisateur"><input disabled={readOnly} value={newTransaction.userName} onChange={(event) => setNewTransaction((current) => ({ ...current, userName: event.target.value }))} /></AdminField>
          <AdminField label="Email"><input disabled={readOnly} value={newTransaction.userEmail} onChange={(event) => setNewTransaction((current) => ({ ...current, userEmail: event.target.value }))} /></AdminField>
          <AdminField label="Type"><select disabled={readOnly} value={newTransaction.type} onChange={(event) => setNewTransaction((current) => ({ ...current, type: event.target.value }))}>{FLOW_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Statut"><select disabled={readOnly} value={newTransaction.status} onChange={(event) => setNewTransaction((current) => ({ ...current, status: event.target.value }))}>{STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Méthode paiement"><input disabled={readOnly} value={newTransaction.paymentMethod} onChange={(event) => setNewTransaction((current) => ({ ...current, paymentMethod: event.target.value }))} /></AdminField>
          <AdminField label="Méthode réception"><input disabled={readOnly} value={newTransaction.receiveMethod} onChange={(event) => setNewTransaction((current) => ({ ...current, receiveMethod: event.target.value }))} /></AdminField>
          <AdminField label="Montant brut"><input disabled={readOnly} type="number" min="0" step="0.01" value={newTransaction.amountGross} onChange={(event) => setNewTransaction((current) => ({ ...current, amountGross: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Frais"><input disabled={readOnly} type="number" min="0" step="0.01" value={newTransaction.fees} onChange={(event) => setNewTransaction((current) => ({ ...current, fees: Number(event.target.value || 0), amountNet: Math.max(0, Number(current.amountGross || 0) - Number(event.target.value || 0)) }))} /></AdminField>
          <AdminField label="Montant net"><input disabled={readOnly} type="number" min="0" step="0.01" value={newTransaction.amountNet} onChange={(event) => setNewTransaction((current) => ({ ...current, amountNet: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Asset"><input disabled={readOnly} value={newTransaction.asset} onChange={(event) => setNewTransaction((current) => ({ ...current, asset: event.target.value }))} /></AdminField>
          {!readOnly ? <div className="field field--action"><span className="field__label">Action</span><button type="button" className="button button--primary" onClick={addTransaction}>Ajouter</button></div> : null}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Table" title="Historique local des transactions" description="Recherche, filtres rapides, export CSV et édition des statuts.">
        <div className="section-toolbar section-toolbar--filters">
          <AdminField label="Recherche" className="field--compact"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, user, email" /></AdminField>
          <AdminField label="Statut" className="field--compact"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous</option>{STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Type" className="field--compact"><select value={flowFilter} onChange={(event) => setFlowFilter(event.target.value)}><option value="all">Tous</option>{FLOW_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Asset" className="field--compact"><select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)}><option value="all">Tous</option>{assetOptions.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          {!readOnly ? <div className="field field--action"><span className="field__label">Export</span><button type="button" className="button button--ghost" onClick={exportRows}>CSV</button></div> : null}
        </div>

        {!filteredRows.length ? (
          <AdminEmptyState title="Aucune transaction" description="Ajoutez une ligne manuelle ou ajustez les filtres." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Type</th>
                  <th>Paiement</th>
                  <th>Réception</th>
                  <th>Brut</th>
                  <th>Net</th>
                  <th>Asset</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.userName}</strong>
                        <span>{row.userEmail}</span>
                      </div>
                    </td>
                    <td>{row.type}</td>
                    <td>{row.paymentMethod}</td>
                    <td>{row.receiveMethod}</td>
                    <td>{euro(row.amountGross)}</td>
                    <td>{euro(row.amountNet)}</td>
                    <td>{row.asset}</td>
                    <td>
                      <select disabled={readOnly} value={row.status} onChange={(event) => updateRow(row.id, { status: event.target.value })}>
                        {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </td>
                    <td>{formatDateTime(row.date)}</td>
                    <td>
                      <div className="inline-actions inline-actions--stack">
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                        {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => deleteRow(row.id)}>Supprimer</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} /> : null}
    </div>
  );
}
