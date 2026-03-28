import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { hashValue } from '../../../utils/hash';
import { formatDateTime } from '../../../utils/format';
import { ADMIN_TABS } from '../adminTabs';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';

export default function SecurityTab({ data, dirty, onChangeSection, onSave, onReset, onLogout, onShowToast, readOnly = false }) {
  const { security, adminAccess, adminLogs } = data;
  const [newPin, setNewPin] = useState('');

  const connectionLogs = useMemo(
    () => (adminLogs || []).filter((entry) => entry.action === 'login' || entry.action === 'logout').slice(0, 12),
    [adminLogs],
  );

  function updateSecurity(patch) {
    onChangeSection('security', { ...security, ...patch });
  }

  function updateAdminAccess(patch) {
    onChangeSection('adminAccess', { ...adminAccess, ...patch });
  }

  async function applyPin() {
    if (readOnly || !newPin.trim()) return;
    const pinHash = await hashValue(newPin);
    updateAdminAccess({ pinHash, pinEnabled: true });
    setNewPin('');
    onShowToast?.('Nouveau PIN secondaire préparé dans le brouillon.', 'success');
  }

  function togglePinProtectedTab(tabKey, checked) {
    const nextTabs = checked
      ? Array.from(new Set([...(adminAccess.pinProtectedTabs || []), tabKey]))
      : (adminAccess.pinProtectedTabs || []).filter((item) => item !== tabKey);
    updateAdminAccess({ pinProtectedTabs: nextTabs });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="PIN secondaire" value={adminAccess.pinEnabled ? 'Actif' : 'Désactivé'} helper="protection locale" tone={adminAccess.pinEnabled ? 'warning' : 'neutral'} />
        <AdminMetric label="Tabs protégés" value={String((adminAccess.pinProtectedTabs || []).length)} helper="zones sensibles" tone="danger" />
        <AdminMetric label="Maintenance" value={security.maintenanceMode ? 'On' : 'Off'} helper="site public" tone={security.maintenanceMode ? 'danger' : 'success'} />
        <AdminMetric label="Login public" value={security.loginPageEnabled ? 'Ouvert' : 'Fermé'} helper="accès utilisateur" tone={security.loginPageEnabled ? 'success' : 'warning'} />
      </div>

      <AdminSection eyebrow="Accès sensible" title="PIN secondaire & sessions" description="Cette sécurité reste strictement locale au navigateur. Elle améliore l’ergonomie admin mais ne remplace pas une authentification serveur.">
        <div className="field-grid field-grid--3">
          <AdminField label="Nouveau PIN" hint="Le PIN est hashé avant stockage dans le navigateur.">
            <div className="inline-field-action">
              <input disabled={readOnly} type="password" inputMode="numeric" value={newPin} onChange={(event) => setNewPin(event.target.value)} />
              {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={applyPin}>Mettre à jour</button> : null}
            </div>
          </AdminField>
          <AdminField label="Durée de session (min)"><input disabled={readOnly} type="number" min="5" step="5" value={adminAccess.sessionTimeoutMinutes} onChange={(event) => updateAdminAccess({ sessionTimeoutMinutes: Number(event.target.value || 0) })} /></AdminField>
          <div className="toggle-stack field--full">
            <AdminToggle label="PIN secondaire activé" checked={adminAccess.pinEnabled} onChange={(checked) => updateAdminAccess({ pinEnabled: checked })} disabled={readOnly} />
            <AdminToggle label="Laisser l’admin accessible pendant la maintenance" checked={adminAccess.allowAdminDuringMaintenance} onChange={(checked) => updateAdminAccess({ allowAdminDuringMaintenance: checked })} disabled={readOnly} />
          </div>
        </div>
        <div className="permissions-grid">
          {ADMIN_TABS.filter((tab) => tab.sensitive).map((tab) => (
            <AdminToggle
              key={tab.key}
              label={`PIN requis — ${tab.label}`}
              checked={(adminAccess.pinProtectedTabs || []).includes(tab.key)}
              onChange={(checked) => togglePinProtectedTab(tab.key, checked)}
              disabled={!adminAccess.pinEnabled || readOnly}
            />
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Public access" title="Login & maintenance" description="Contrôlez l’accès public au login et personnalisez l’état de maintenance du site.">
        <div className="toggle-stack">
          <AdminToggle label="Page login utilisateur accessible" checked={security.loginPageEnabled} onChange={(checked) => updateSecurity({ loginPageEnabled: checked })} disabled={readOnly} />
          <AdminToggle label="Maintenance mode" checked={security.maintenanceMode} onChange={(checked) => updateSecurity({ maintenanceMode: checked })} disabled={readOnly} />
        </div>
        <div className="field-grid field-grid--2">
          <AdminField label="Titre maintenance"><input disabled={readOnly} value={security.maintenanceTitle} onChange={(event) => updateSecurity({ maintenanceTitle: event.target.value })} /></AdminField>
          <AdminField label="Message maintenance" className="field--full"><textarea disabled={readOnly} value={security.maintenanceMessage} onChange={(event) => updateSecurity({ maintenanceMessage: event.target.value })} /></AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Historique" title="Connexions admin récentes" description="Vue rapide des ouvertures / fermetures de session localement enregistrées." actions={!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => onChangeSection('adminLogs', [])}>Vider les logs</button> : null}>
        {connectionLogs.length ? (
          <div className="list-stack">
            {connectionLogs.map((entry) => (
              <div key={entry.id} className="list-row list-row--panel">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone={entry.action === 'login' ? 'success' : 'neutral'}>{entry.action}</Badge>
                      <Badge tone="neutral">{entry.role || 'admin'}</Badge>
                    </div>
                    <strong>{entry.name || entry.email || 'Admin'}</strong>
                    <span>{formatDateTime(entry.at)}</span>
                  </div>
                  {entry.detail ? <p className="muted">{entry.detail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState title="Aucune connexion récente" description="Les prochaines ouvertures et fermetures de session apparaîtront ici." />
        )}
        <div className="step-actions">
          <button type="button" className="button button--ghost" onClick={onLogout}>Déconnexion admin</button>
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} saveLabel="Sauvegarder la sécurité" /> : null}
    </div>
  );
}
