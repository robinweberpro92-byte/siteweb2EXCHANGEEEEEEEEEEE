import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ReviewsSection from '../components/ReviewsSection';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { auth, config, ready, loginAdmin, loginUser, continueAsGuest, copy, language } = useApp();
  const [userEmail, setUserEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('owner@clyra.exchange');
  const [adminPassword, setAdminPassword] = useState('control2026!');
  const [userMessage, setUserMessage] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeAdmins = useMemo(() => config.admins.filter((admin) => admin.status === 'active'), [config.admins]);

  if (!ready) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card auth-card--large">
          <p className="eyebrow">{copy.common.login}</p>
          <h1>Loading…</h1>
        </Card>
      </section>
    );
  }

  if (auth.role === 'admin') return <Navigate to="/admin" replace />;
  if (auth.role === 'user' || auth.isGuest) return <Navigate to="/dashboard" replace />;

  async function handleUserSubmit(event) {
    event.preventDefault();
    setUserMessage('');
    const result = loginUser(userEmail);
    if (!result.ok) {
      setUserMessage(result.message);
    }
  }

  async function handleAdminSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setAdminMessage('');
    const result = await loginAdmin(adminEmail, adminPassword);
    setLoading(false);
    if (!result.ok) {
      setAdminMessage(result.message);
    }
  }

  return (
    <section className="container section page-intro login-page login-page--rich">
      <div className="page-head">
        <span className="eyebrow">{copy.common.login}</span>
        <h1>{copy.login.title}</h1>
        <p>{copy.login.subtitle}</p>
      </div>

      <div className="login-grid login-grid--3col">
        <Card className="auth-card auth-card--feature">
          <div className="hero-badges hero-badges--small">
            <Badge tone="info">{language === 'fr' ? 'Accès rapide' : 'Fast access'}</Badge>
            <Badge tone="success">{config.theme.mode === 'dark' ? 'Dark' : 'Light'}</Badge>
          </div>
          <h3>{copy.login.guestTitle}</h3>
          <p className="muted">{copy.login.guestSubtitle}</p>
          <div className="summary-list summary-list--spaced">
            <div className="summary-row"><span>{language === 'fr' ? 'Échange' : 'Exchange'}</span><strong>{language === 'fr' ? 'Disponible' : 'Available'}</strong></div>
            <div className="summary-row"><span>{language === 'fr' ? 'Marché' : 'Market'}</span><strong>{language === 'fr' ? 'Disponible' : 'Available'}</strong></div>
            <div className="summary-row"><span>{language === 'fr' ? 'Dashboard' : 'Dashboard'}</span><strong>{language === 'fr' ? 'Vue limitée' : 'Limited view'}</strong></div>
          </div>
          <button type="button" className="button button--primary button--full" onClick={() => continueAsGuest({ displayName: language === 'fr' ? 'Invité' : 'Guest' })}>
            {copy.common.continueAsGuest}
          </button>
        </Card>

        <Card className="auth-card">
          <p className="eyebrow">{language === 'fr' ? 'Accès utilisateur' : 'User access'}</p>
          <h3>{language === 'fr' ? 'Ouvrir le dashboard' : 'Open the dashboard'}</h3>
          <p className="muted">{language === 'fr' ? 'Utilisez l’adresse email d’un utilisateur local créé dans l’onglet Utilisateurs.' : 'Use the email of a local user created from the Users admin tab.'}</p>
          {config.security.loginPageEnabled ? (
            <form className="form-grid" onSubmit={handleUserSubmit}>
              <label>
                <span>Email</span>
                <input value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="utilisateur@example.com" />
              </label>
              <button type="submit" className="button button--primary button--full">{language === 'fr' ? 'Accéder au dashboard' : 'Access dashboard'}</button>
            </form>
          ) : (
            <div className="login-hint">{copy.login.disabledMessage}</div>
          )}
          {userMessage ? <div className="login-hint login-hint--danger">{userMessage}</div> : null}
        </Card>

        <Card className="auth-card">
          <p className="eyebrow">{language === 'fr' ? 'Administration' : 'Administration'}</p>
          <h3>{copy.login.adminTitle}</h3>
          <p className="muted">{copy.login.adminSubtitle}</p>
          <div className="summary-row summary-row--hint"><span>{language === 'fr' ? 'Admins actifs' : 'Active admins'}</span><strong>{activeAdmins.length}</strong></div>
          <form className="form-grid" onSubmit={handleAdminSubmit}>
            <label>
              <span>Email</span>
              <input value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
            </label>
            <label>
              <span>{language === 'fr' ? 'Mot de passe' : 'Password'}</span>
              <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} />
            </label>
            <button type="submit" className="button button--primary button--full" disabled={loading}>
              {loading ? (language === 'fr' ? 'Connexion…' : 'Signing in…') : copy.login.adminTitle}
            </button>
          </form>
          {adminMessage ? <div className="login-hint login-hint--danger">{adminMessage}</div> : null}
        </Card>
      </div>

      <section className="section">
        <ReviewsSection limit={3} compact title={language === 'fr' ? 'Ce que disent les utilisateurs' : 'What users are saying'} subtitle={language === 'fr' ? 'La preuve sociale renforce la confiance même avant la connexion.' : 'Social proof reinforces trust even before sign in.'} />
      </section>
    </section>
  );
}
