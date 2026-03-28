import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { formatDateTime, statusTone } from '../../../utils/format';
import { AdminEmptyState, AdminField, AdminMetric, AdminSection } from '../AdminFormControls';

export default function PasswordResetsTab({ data, readOnly = false, currentAdmin, onShowToast, onResolvePasswordReset, onRemovePasswordReset }) {
  const requests = data.passwordResets?.items || [];
  const [draftPasswords, setDraftPasswords] = useState({});
  const [search, setSearch] = useState('');
  const [workingId, setWorkingId] = useState('');

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => !query || request.email.toLowerCase().includes(query));
  }, [requests, search]);

  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const resolvedCount = requests.filter((request) => request.status === 'resolved').length;

  async function resolveRequest(request) {
    const nextPassword = String(draftPasswords[request.id] || '').trim();
    if (!nextPassword) {
      onShowToast?.('Saisissez un mot de passe temporaire avant validation.', 'warning');
      return;
    }
    setWorkingId(request.id);
    const result = await onResolvePasswordReset?.(request.id, nextPassword, currentAdmin);
    setWorkingId('');
    if (!result?.ok) {
      onShowToast?.(result?.message || 'Impossible de traiter la demande.', 'danger');
      return;
    }
    setDraftPasswords((current) => ({ ...current, [request.id]: '' }));
    onShowToast?.('Demande traitée. Communiquez le mot de passe temporaire via votre canal de support.', 'success', 4200);
  }

  function deleteRequest(id) {
    onRemovePasswordReset?.(id);
    onShowToast?.('Demande supprimée.', 'info');
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Demandes" value={String(requests.length)} helper="historique local" />
        <AdminMetric label="En attente" value={String(pendingCount)} helper="à traiter" tone="warning" />
        <AdminMetric label="Résolues" value={String(resolvedCount)} helper="clôturées" tone="success" />
        <AdminMetric label="Support" value={currentAdmin?.email || '—'} helper="agent courant" tone="info" />
      </div>

      <AdminSection
        eyebrow="Support"
        title="Demandes de réinitialisation"
        description="Traitez les demandes locales sans jamais afficher le mot de passe actuel des comptes."
        actions={<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrer par email" />}
      >
        {!filteredRequests.length ? (
          <AdminEmptyState title="Aucune demande" description="Les nouvelles demandes de réinitialisation apparaîtront ici." />
        ) : (
          <div className="list-stack">
            {filteredRequests.map((request) => (
              <div key={request.id} className="list-row list-row--panel">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone={statusTone(request.status)}>{request.status}</Badge>
                      <Badge tone={request.knownAccount ? 'success' : 'warning'}>{request.knownAccount ? 'Compte connu' : 'Compte introuvable'}</Badge>
                    </div>
                    <strong>{request.email}</strong>
                    <span>{formatDateTime(request.requestedAt)}</span>
                  </div>
                  <div className="field-grid field-grid--4 compact-fields">
                    <AdminField label="Email"><input disabled value={request.email} /></AdminField>
                    <AdminField label="Demandé le"><input disabled value={formatDateTime(request.requestedAt)} /></AdminField>
                    <AdminField label="Traité par"><input disabled value={request.handledBy || '—'} /></AdminField>
                    <AdminField label="Traité le"><input disabled value={request.handledAt ? formatDateTime(request.handledAt) : '—'} /></AdminField>
                    <AdminField label="Mot de passe temporaire" className="field--full" hint="Le mot de passe temporaire est hashé avant stockage.">
                      <input
                        type="password"
                        disabled={readOnly || request.status === 'resolved'}
                        value={draftPasswords[request.id] || ''}
                        onChange={(event) => setDraftPasswords((current) => ({ ...current, [request.id]: event.target.value }))}
                        placeholder="Définir un mot de passe temporaire"
                      />
                    </AdminField>
                  </div>
                </div>
                <div className="list-row__actions list-row__actions--stack">
                  {!readOnly && request.status !== 'resolved' ? (
                    <button type="button" className="button button--primary button--sm" disabled={workingId === request.id} onClick={() => resolveRequest(request)}>
                      {workingId === request.id ? 'Traitement…' : 'Marquer comme traité'}
                    </button>
                  ) : null}
                  {!readOnly ? (
                    <button type="button" className="button button--ghost button--sm" onClick={() => deleteRequest(request.id)}>
                      Supprimer
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
