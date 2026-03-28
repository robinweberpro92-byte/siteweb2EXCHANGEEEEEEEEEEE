import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';
import { formatDateTime, routeLabel, statusTone } from '../../../utils/format';
import { generateId } from '../../../utils/storage';

const TYPES = ['info', 'success', 'warning', 'error'];
const TARGETS = ['all', 'home', 'exchange', 'market', 'dashboard', 'transactions', 'login'];
const DISPLAYS = ['toast', 'banner', 'dashboard'];

export default function NotificationsTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const notifications = data.notifications;
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    message: '',
    duration: 4200,
    target: 'all',
    display: 'toast',
    enabled: true,
    language: 'fr',
  });

  const activeCount = useMemo(() => notifications.items.filter((item) => item.enabled).length, [notifications.items]);

  function updateNotifications(patch) {
    onChangeSection('notifications', { ...notifications, ...patch });
  }

  function updateItem(id, patch) {
    updateNotifications({ items: notifications.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  function removeItem(id) {
    updateNotifications({ items: notifications.items.filter((item) => item.id !== id) });
  }

  function addItem() {
    if (readOnly || !newNotification.message.trim()) return;
    const entry = {
      ...newNotification,
      id: generateId('NTF'),
      createdAt: new Date().toISOString(),
    };
    updateNotifications({ items: [entry, ...notifications.items], history: [entry, ...notifications.history].slice(0, 100) });
    setNewNotification({ type: 'info', message: '', duration: 4200, target: 'all', display: 'toast', enabled: true, language: 'fr' });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Notifications actives" value={String(activeCount)} helper="toutes pages" />
        <AdminMetric label="Historique" value={String(notifications.history.length)} helper="messages conservés" tone="info" />
        <AdminMetric label="Dashboard center" value={notifications.dashboardEnabled ? 'On' : 'Off'} helper="bloc dashboard" tone="success" />
        <AdminMetric label="Annonce globale" value={data.branding.announcementEnabled ? 'On' : 'Off'} helper="navbar banner" tone="warning" />
      </div>

      <AdminSection eyebrow="Création" title="Nouvelle notification" description="Créez un message cohérent avec la page, la langue et le mode d’affichage.">
        <div className="field-grid field-grid--4">
          <AdminField label="Type"><select disabled={readOnly} value={newNotification.type} onChange={(event) => setNewNotification((current) => ({ ...current, type: event.target.value }))}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></AdminField>
          <AdminField label="Page cible"><select disabled={readOnly} value={newNotification.target} onChange={(event) => setNewNotification((current) => ({ ...current, target: event.target.value }))}>{TARGETS.map((target) => <option key={target}>{target}</option>)}</select></AdminField>
          <AdminField label="Affichage"><select disabled={readOnly} value={newNotification.display} onChange={(event) => setNewNotification((current) => ({ ...current, display: event.target.value }))}>{DISPLAYS.map((display) => <option key={display}>{display}</option>)}</select></AdminField>
          <AdminField label="Langue"><select disabled={readOnly} value={newNotification.language} onChange={(event) => setNewNotification((current) => ({ ...current, language: event.target.value }))}><option value="fr">FR</option><option value="en">EN</option><option value="all">all</option></select></AdminField>
          <AdminField label="Durée (ms)"><input disabled={readOnly} type="number" min="0" step="100" value={newNotification.duration} onChange={(event) => setNewNotification((current) => ({ ...current, duration: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Message" className="field--full"><textarea disabled={readOnly} value={newNotification.message} onChange={(event) => setNewNotification((current) => ({ ...current, message: event.target.value }))} /></AdminField>
          {!readOnly ? <div className="field field--action"><span className="field__label">Action</span><button type="button" className="button button--primary" onClick={addItem}>Créer la notification</button></div> : null}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Pilotage" title="Messages actifs & historique" description="Activez, désactivez ou supprimez les messages ciblés par page.">
        <div className="toggle-stack">
          <AdminToggle label="Notifications dashboard activées" checked={notifications.dashboardEnabled} onChange={(checked) => updateNotifications({ dashboardEnabled: checked })} disabled={readOnly} />
        </div>
        {!notifications.items.length ? (
          <AdminEmptyState title="Aucune notification" description="Créez votre premier message à afficher en toast, bandeau ou dashboard." />
        ) : (
          <div className="list-stack">
            {notifications.items.map((item) => (
              <div key={item.id} className="list-row list-row--panel">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone={item.type || 'info'}>{item.type}</Badge>
                      <Badge tone="neutral">{item.display}</Badge>
                      <Badge tone="neutral">{item.language || 'fr'}</Badge>
                      <Badge tone={item.enabled ? 'success' : 'neutral'}>{item.enabled ? 'Actif' : 'Off'}</Badge>
                    </div>
                    <strong>{item.message}</strong>
                    <span>{routeLabel(item.target)} • {formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
                <div className="list-row__actions list-row__actions--stack">
                  <button type="button" className="button button--ghost button--sm" disabled={readOnly} onClick={() => updateItem(item.id, { enabled: !item.enabled })}>{item.enabled ? 'Désactiver' : 'Activer'}</button>
                  {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => removeItem(item.id)}>Supprimer</button> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} /> : null}
    </div>
  );
}
