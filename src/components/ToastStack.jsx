import Badge from './Badge';

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts?.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone || 'info'}`}>
          <div className="toast__body">
            <Badge tone={toast.tone || 'info'}>{toast.tone || 'info'}</Badge>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="icon-button" onClick={() => onDismiss(toast.id)} aria-label="Fermer">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
