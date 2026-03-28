export default function AdminToast({ message, tone = 'info' }) {
  return <div className={`admin-toast admin-toast--${tone}`}>{message}</div>;
}
