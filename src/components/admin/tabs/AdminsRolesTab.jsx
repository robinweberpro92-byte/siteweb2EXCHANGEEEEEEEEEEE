import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { PERMISSION_KEYS } from '../../../config/defaultConfig';
import { hashValue } from '../../../utils/hash';
import { roleTone } from '../../../utils/format';
import { generateId, validateEmail } from '../../../utils/storage';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];

export default function AdminsRolesTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false, resolveRoleDefinition }) {
  const admins = data.admins || [];
  const roleEntries = Object.entries(data.adminRoles || {});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedId, setExpandedId] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'viewer', status: 'active', notes: '' });

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesQuery = !query || admin.name.toLowerCase().includes(query) || admin.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [admins, search, roleFilter]);

  function updateAdmins(nextAdmins) {
    onChangeSection('admins', nextAdmins);
  }

  function updateAdmin(id, patch) {
    updateAdmins(admins.map((admin) => (admin.id === id ? { ...admin, ...patch } : admin)));
  }

  function updatePermission(id, key, checked) {
    updateAdmins(
      admins.map((admin) => (
        admin.id === id
          ? { ...admin, permissions: { ...(admin.permissions || {}), [key]: checked } }
          : admin
      )),
    );
  }

  function changeRole(id, role) {
    const roleDefinition = resolveRoleDefinition?.(role);
    updateAdmin(id, {
      role,
      level: roleDefinition?.level || 0,
      permissions: roleDefinition?.permissions || {},
    });
  }

  async function addAdmin() {
    if (readOnly || !newAdmin.name.trim() || !validateEmail(newAdmin.email) || !newAdmin.password.trim()) return;
    const roleDefinition = resolveRoleDefinition?.(newAdmin.role);
    const passwordHash = await hashValue(newAdmin.password);
    const entry = {
      id: generateId('ADM'),
      name: newAdmin.name.trim(),
      email: newAdmin.email.trim().toLowerCase(),
      passwordHash,
      pinHash: '',
      role: newAdmin.role,
      level: roleDefinition?.level || 0,
      status: newAdmin.status,
      permissions: roleDefinition?.permissions || {},
      createdAt: new Date().toISOString(),
      lastLogin: '',
      notes: newAdmin.notes,
    };
    updateAdmins([entry, ...admins]);
    setNewAdmin({ name: '', email: '', password: '', role: 'viewer', status: 'active', notes: '' });
  }

  async function resetPassword(admin) {
    const nextPassword = passwordDrafts[admin.id];
    if (!nextPassword?.trim()) return;
    const passwordHash = await hashValue(nextPassword);
    updateAdmin(admin.id, { passwordHash });
    setPasswordDrafts((current) => ({ ...current, [admin.id]: '' }));
  }

  function deleteAdmin(admin) {
    if (admin.role === 'owner') return;
    updateAdmins(admins.filter((item) => item.id !== admin.id));
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Admins actifs" value={String(admins.filter((admin) => admin.status === 'active').length)} helper="comptes opérationnels" />
        <AdminMetric label="Rôles" value={String(roleEntries.length)} helper="presets disponibles" tone="info" />
        <AdminMetric label="Owners" value={String(admins.filter((admin) => admin.role === 'owner').length)} helper="niveau critique" tone="danger" />
        <AdminMetric label="Lecture seule" value={String(admins.filter((admin) => admin.role === 'viewer' || admin.role === 'analyst').length)} helper="analyst + viewer" tone="neutral" />
      </div>

      <AdminSection eyebrow="Rôles" title="Bibliothèque des grades" description="Chaque preset embarque un niveau, une tonalité et un ensemble de permissions cohérent.">
        <div className="role-grid">
          {roleEntries.map(([key, role]) => (
            <div key={key} className="sub-card role-card">
              <div className="section-head section-head--compact">
                <div>
                  <p className="eyebrow">{key}</p>
                  <h4>{role.label}</h4>
                </div>
                <Badge tone={role.tone || roleTone(key)}>L{role.level}</Badge>
              </div>
              <p className="muted">{role.description}</p>
              <div className="inline-badges inline-badges--wrap">
                {Object.entries(role.permissions || {}).filter(([, enabled]) => enabled).slice(0, 8).map(([permission]) => (
                  <Badge key={permission} tone="neutral">{permission}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Création" title="Ajouter un administrateur" description="Créez un nouveau compte local avec rôle, mot de passe hashé et permissions issues du preset sélectionné.">
        <div className="field-grid field-grid--3">
          <AdminField label="Nom"><input disabled={readOnly} value={newAdmin.name} onChange={(event) => setNewAdmin((current) => ({ ...current, name: event.target.value }))} /></AdminField>
          <AdminField label="Email" error={newAdmin.email && !validateEmail(newAdmin.email) ? 'Adresse invalide.' : ''}><input disabled={readOnly} value={newAdmin.email} onChange={(event) => setNewAdmin((current) => ({ ...current, email: event.target.value }))} /></AdminField>
          <AdminField label="Mot de passe"><input disabled={readOnly} type="password" value={newAdmin.password} onChange={(event) => setNewAdmin((current) => ({ ...current, password: event.target.value }))} /></AdminField>
          <AdminField label="Rôle"><select disabled={readOnly} value={newAdmin.role} onChange={(event) => setNewAdmin((current) => ({ ...current, role: event.target.value }))}>{roleEntries.map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}</select></AdminField>
          <AdminField label="Statut"><select disabled={readOnly} value={newAdmin.status} onChange={(event) => setNewAdmin((current) => ({ ...current, status: event.target.value }))}>{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></AdminField>
          <AdminField label="Notes" className="field--full"><textarea disabled={readOnly} value={newAdmin.notes} onChange={(event) => setNewAdmin((current) => ({ ...current, notes: event.target.value }))} /></AdminField>
          {!readOnly ? <div className="field field--action"><span className="field__label">Action</span><button type="button" className="button button--primary" onClick={addAdmin}>Créer l’admin</button></div> : null}
        </div>
      </AdminSection>

      <AdminSection
        eyebrow="Gestion"
        title="Comptes administrateur"
        description="Filtrez les admins, changez leur rôle, ajustez les permissions fines ou réinitialisez leur mot de passe."
        actions={
          <div className="toolbar-actions">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un nom ou un email" />
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">Tous les rôles</option>
              {roleEntries.map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}
            </select>
          </div>
        }
      >
        {!filteredAdmins.length ? (
          <AdminEmptyState title="Aucun admin" description="Ajoutez un nouveau profil ou ajustez vos filtres." />
        ) : (
          <div className="list-stack">
            {filteredAdmins.map((admin) => {
              const roleDefinition = resolveRoleDefinition?.(admin.role);
              const isExpanded = expandedId === admin.id;
              return (
                <div key={admin.id} className="list-row list-row--panel list-row--expanded">
                  <div className="list-row__main">
                    <div className="list-row__head">
                      <div className="inline-badges">
                        <Badge tone={roleDefinition?.tone || roleTone(admin.role)}>{roleDefinition?.label || admin.role}</Badge>
                        <Badge tone={admin.status === 'active' ? 'success' : admin.status === 'suspended' ? 'danger' : 'neutral'}>{admin.status}</Badge>
                        <Badge tone="neutral">L{admin.level || roleDefinition?.level || 0}</Badge>
                      </div>
                      <strong>{admin.name}</strong>
                      <span>{admin.email}</span>
                    </div>
                    <div className="field-grid field-grid--4 compact-fields">
                      <AdminField label="Nom"><input disabled={readOnly} value={admin.name} onChange={(event) => updateAdmin(admin.id, { name: event.target.value })} /></AdminField>
                      <AdminField label="Email"><input disabled={readOnly} value={admin.email} onChange={(event) => updateAdmin(admin.id, { email: event.target.value.toLowerCase() })} /></AdminField>
                      <AdminField label="Rôle"><select disabled={readOnly} value={admin.role} onChange={(event) => changeRole(admin.id, event.target.value)}>{roleEntries.map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}</select></AdminField>
                      <AdminField label="Statut"><select disabled={readOnly} value={admin.status || 'active'} onChange={(event) => updateAdmin(admin.id, { status: event.target.value })}>{STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select></AdminField>
                      <AdminField label="Nouveau mot de passe"><input disabled={readOnly} type="password" value={passwordDrafts[admin.id] || ''} onChange={(event) => setPasswordDrafts((current) => ({ ...current, [admin.id]: event.target.value }))} /></AdminField>
                      {!readOnly ? <div className="field field--action"><span className="field__label">Sécurité</span><button type="button" className="button button--ghost" onClick={() => resetPassword(admin)}>Réinitialiser</button></div> : null}
                      <AdminField label="Notes" className="field--full"><textarea disabled={readOnly} value={admin.notes || ''} onChange={(event) => updateAdmin(admin.id, { notes: event.target.value })} /></AdminField>
                    </div>
                    <div className="list-row__footer">
                      <button type="button" className="button button--ghost button--sm" onClick={() => setExpandedId(isExpanded ? '' : admin.id)}>{isExpanded ? 'Masquer les permissions' : 'Voir les permissions'}</button>
                      <span className="muted">Dernière connexion : {admin.lastLogin || 'Jamais'}</span>
                    </div>
                    {isExpanded ? (
                      <div className="permissions-grid">
                        {PERMISSION_KEYS.map((permission) => (
                          <AdminToggle
                            key={`${admin.id}-${permission}`}
                            label={permission}
                            checked={Boolean(admin.permissions?.[permission])}
                            onChange={(checked) => updatePermission(admin.id, permission, checked)}
                            disabled={readOnly}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="list-row__actions list-row__actions--stack">
                    {!readOnly && admin.role !== 'owner' ? <button type="button" className="button button--ghost button--sm" onClick={() => deleteAdmin(admin)}>Supprimer</button> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} saveLabel="Sauvegarder les admins" /> : null}
    </div>
  );
}
