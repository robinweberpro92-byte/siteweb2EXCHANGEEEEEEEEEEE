import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { AdminEmptyState, AdminField, AdminMetric, AdminSection } from '../AdminFormControls';
import { formatDateTime } from '../../../utils/format';

export default function LogsTab({ data }) {
  const [severity, setSeverity] = useState('all');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data.adminLogs || []).filter((entry) => {
      const matchesSeverity = severity === 'all' || (entry.severity || 'info') === severity;
      const haystack = `${entry.action || ''} ${entry.section || ''} ${entry.detail || ''} ${entry.email || ''} ${entry.name || ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesSeverity && matchesQuery;
    });
  }, [data.adminLogs, severity, search]);

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Total logs" value={String((data.adminLogs || []).length)} helper="historique local" />
        <AdminMetric label="Critiques" value={String((data.adminLogs || []).filter((entry) => entry.severity === 'danger').length)} helper="actions sensibles" tone="danger" />
        <AdminMetric label="Connexions" value={String((data.adminLogs || []).filter((entry) => entry.action === 'login').length)} helper="ouvertures de session" tone="info" />
        <AdminMetric label="Sauvegardes" value={String((data.adminLogs || []).filter((entry) => String(entry.action || '').includes('save')).length)} helper="writes admin" tone="success" />
      </div>

      <AdminSection eyebrow="Historique" title="Journal des actions" description="Filtrez les logs par criticité ou recherchez un mot-clé.">
        <div className="section-toolbar section-toolbar--filters">
          <AdminField label="Recherche" className="field--compact"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Action, section, admin…" /></AdminField>
          <AdminField label="Criticité" className="field--compact">
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="all">Toutes</option>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="danger">danger</option>
              <option value="success">success</option>
            </select>
          </AdminField>
        </div>

        {!rows.length ? (
          <AdminEmptyState title="Aucun log correspondant" description="Élargissez les filtres ou poursuivez l’activité admin pour alimenter ce journal." />
        ) : (
          <div className="list-stack">
            {rows.map((entry) => (
              <div key={entry.id} className="list-row list-row--panel">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone={entry.severity || 'info'}>{entry.severity || 'info'}</Badge>
                      <Badge tone="neutral">{entry.section}</Badge>
                      <Badge tone="neutral">{entry.role || 'admin'}</Badge>
                    </div>
                    <strong>{entry.action}</strong>
                    <span>{entry.name || entry.email || 'Admin'} • {formatDateTime(entry.at)}</span>
                  </div>
                  {entry.detail ? <p className="muted">{entry.detail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
