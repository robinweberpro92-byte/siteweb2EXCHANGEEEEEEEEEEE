import Badge from '../Badge';
import AdminUnsavedBadge from './AdminUnsavedBadge';

export function AdminSection({ eyebrow, title, description, actions, children }) {
  return (
    <section className="admin-card">
      <div className="admin-card__head">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3>{title}</h3>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        {actions ? <div className="admin-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminField({ label, hint, error, children, className = '' }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <small className="field__hint">{hint}</small> : null}
      {error ? <small className="field__error">{error}</small> : null}
    </label>
  );
}

export function AdminToggle({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className={`toggle-row ${disabled ? 'is-disabled' : ''}`}>
      <div>
        <strong>{label}</strong>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <button
        type="button"
        className={`toggle ${checked ? 'toggle--active' : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        disabled={disabled}
      >
        <span />
      </button>
    </div>
  );
}

export function AdminMetric({ label, value, helper, tone = 'info' }) {
  return (
    <div className="metric-card">
      <Badge tone={tone}>{label}</Badge>
      <strong>{value}</strong>
      {helper ? <span>{helper}</span> : null}
    </div>
  );
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export function AdminSaveBar({ dirty, onSave, onReset, disabled = false, saveLabel = 'Sauvegarder', resetLabel = 'Réinitialiser' }) {
  return (
    <div className="save-bar">
      <div className="save-bar__status">
        <AdminUnsavedBadge dirty={dirty} />
      </div>
      <div className="save-bar__actions">
        <button type="button" className="button button--ghost" onClick={onReset}>
          {resetLabel}
        </button>
        <button type="button" className="button button--primary" onClick={onSave} disabled={disabled}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function MiniBars({ items = [] }) {
  if (!items.length) return <div className="mini-bars mini-bars--empty" />;
  const max = Math.max(...items, 1);
  return (
    <div className="mini-bars">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} style={{ height: `${Math.max(10, (item / max) * 100)}%` }} />
      ))}
    </div>
  );
}
