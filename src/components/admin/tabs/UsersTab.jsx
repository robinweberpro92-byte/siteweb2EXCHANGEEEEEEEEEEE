import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection } from '../AdminFormControls';
import { euro, formatDateTime, statusTone } from '../../../utils/format';
import { generateId, validateEmail } from '../../../utils/storage';
import { hashValue } from '../../../utils/hash';

const STATUS_OPTIONS = ['Actif', 'Suspendu', 'Vérifié'];
const KYC_OPTIONS = ['Non vérifié', 'En cours', 'Vérifié'];
const TAG_OPTIONS = ['VIP', 'Standard', 'Review', 'Pro'];

export default function UsersTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const users = data.users;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', balance: 0, status: 'Actif', kyc: 'Non vérifié', tag: 'Standard', notes: '' });

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesKyc = kycFilter === 'all' || user.kyc === kycFilter;
      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [users, search, statusFilter, kycFilter]);

  const activeUsers = users.filter((user) => user.status === 'Actif' || user.status === 'Vérifié').length;
  const totalBalance = users.reduce((sum, user) => sum + Number(user.balance || 0), 0);

  function updateUsers(nextUsers) {
    onChangeSection('users', nextUsers);
  }

  function updateUser(id, patch) {
    updateUsers(users.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  function deleteUser(id) {
    updateUsers(users.filter((user) => user.id !== id));
  }

  async function addUser() {
    if (readOnly || !newUser.name.trim() || !validateEmail(newUser.email) || !newUser.password.trim()) return;
    const passwordHash = await hashValue(newUser.password);
    updateUsers([
      {
        id: generateId('USR'),
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        balance: Number(newUser.balance || 0),
        status: newUser.status,
        kyc: newUser.kyc,
        tag: newUser.tag,
        notes: newUser.notes,
      },
      ...users,
    ]);
    setNewUser({ name: '', email: '', password: '', balance: 0, status: 'Actif', kyc: 'Non vérifié', tag: 'Standard', notes: '' });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Utilisateurs" value={String(users.length)} helper="Base locale" />
        <AdminMetric label="Actifs" value={String(activeUsers)} helper="Actif ou vérifié" tone="success" />
        <AdminMetric label="Solde simulé" value={euro(totalBalance)} helper="Somme des soldes" tone="warning" />
        <AdminMetric label="KYC vérifié" value={String(users.filter((user) => user.kyc === 'Vérifié').length)} helper="Conformité" tone="info" />
      </div>

      <AdminSection eyebrow="Ajout" title="Ajouter un utilisateur" description="Le nouvel utilisateur est immédiatement disponible pour la connexion locale et l’historique des transactions.">
        <div className="field-grid field-grid--3">
          <AdminField label="Nom"><input disabled={readOnly} value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} /></AdminField>
          <AdminField label="Email" error={newUser.email && !validateEmail(newUser.email) ? 'Adresse email invalide.' : ''}><input disabled={readOnly} value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} /></AdminField>
          <AdminField label="Mot de passe temporaire"><input disabled={readOnly} type="password" value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} /></AdminField>
          <AdminField label="Solde estimé"><input disabled={readOnly} type="number" min="0" step="0.01" value={newUser.balance} onChange={(event) => setNewUser((current) => ({ ...current, balance: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Statut"><select disabled={readOnly} value={newUser.status} onChange={(event) => setNewUser((current) => ({ ...current, status: event.target.value }))}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></AdminField>
          <AdminField label="KYC"><select disabled={readOnly} value={newUser.kyc} onChange={(event) => setNewUser((current) => ({ ...current, kyc: event.target.value }))}>{KYC_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Tag"><select disabled={readOnly} value={newUser.tag} onChange={(event) => setNewUser((current) => ({ ...current, tag: event.target.value }))}>{TAG_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Note interne" className="field--full"><textarea disabled={readOnly} value={newUser.notes} onChange={(event) => setNewUser((current) => ({ ...current, notes: event.target.value }))} /></AdminField>
          {!readOnly ? (
            <div className="field field--action">
              <span className="field__label">Action</span>
              <button type="button" className="button button--primary" onClick={addUser} disabled={!newUser.name.trim() || !validateEmail(newUser.email) || !newUser.password.trim()}>
                Ajouter l’utilisateur
              </button>
            </div>
          ) : null}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Gestion" title="Base utilisateurs locale" description="Recherche, filtres et édition rapide du statut, du KYC, du tag, du solde et des notes.">
        <div className="section-toolbar section-toolbar--filters">
          <AdminField label="Recherche" className="field--compact"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou email" /></AdminField>
          <AdminField label="Statut" className="field--compact"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous</option>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></AdminField>
          <AdminField label="KYC" className="field--compact"><select value={kycFilter} onChange={(event) => setKycFilter(event.target.value)}><option value="all">Tous</option>{KYC_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></AdminField>
        </div>

        {!filteredUsers.length ? (
          <AdminEmptyState title="Aucun utilisateur" description="Ajustez les filtres ou créez un nouvel utilisateur local." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Inscription</th>
                  <th>Dernière activité</th>
                  <th>Solde</th>
                  <th>Statut</th>
                  <th>KYC</th>
                  <th>Tag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><input disabled={readOnly} value={user.name} onChange={(event) => updateUser(user.id, { name: event.target.value })} /></td>
                    <td><input disabled={readOnly} value={user.email} onChange={(event) => updateUser(user.id, { email: event.target.value })} /></td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td>{formatDateTime(user.lastActivity)}</td>
                    <td><input disabled={readOnly} type="number" min="0" step="0.01" value={user.balance} onChange={(event) => updateUser(user.id, { balance: Number(event.target.value || 0) })} /></td>
                    <td><select disabled={readOnly} value={user.status} onChange={(event) => updateUser(user.id, { status: event.target.value })}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                    <td><select disabled={readOnly} value={user.kyc} onChange={(event) => updateUser(user.id, { kyc: event.target.value })}>{KYC_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                    <td><select disabled={readOnly} value={user.tag || 'Standard'} onChange={(event) => updateUser(user.id, { tag: event.target.value })}>{TAG_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                    <td>
                      <div className="inline-actions inline-actions--stack">
                        <Badge tone={statusTone(user.status)}>{user.status}</Badge>
                        {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => deleteUser(user.id)}>Supprimer</button> : null}
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
