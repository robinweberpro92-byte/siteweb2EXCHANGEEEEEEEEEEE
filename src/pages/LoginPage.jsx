import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card';
import GuestBadge from '../components/GuestBadge';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { auth, config, ready, copy, language, loginAccount, registerAccount, requestPasswordReset, continueAsGuest } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ tone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const signupEnabled = useMemo(() => config.security.loginPageEnabled !== false, [config.security.loginPageEnabled]);

  if (!ready) {
    return (
      <section className="container section centered-page">
        <Card className="auth-panel auth-panel--single">
          <h1>Loading…</h1>
        </Card>
      </section>
    );
  }

  if (auth.role === 'admin') return <Navigate to="/secure-access" replace />;
  if (auth.loggedIn) return <Navigate to="/" replace />;

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback({ tone: '', message: '' });
    const result = await loginAccount(email, password);
    setLoading(false);
    if (!result.ok) {
      setFeedback({ tone: 'danger', message: result.message });
    }
  }

  async function handleCreate() {
    if (!signupEnabled) {
      setFeedback({ tone: 'warning', message: copy.login.disabledMessage });
      return;
    }
    setLoading(true);
    setFeedback({ tone: '', message: '' });
    const result = await registerAccount({ email, password });
    setLoading(false);
    if (!result.ok) {
      setFeedback({ tone: 'danger', message: result.message });
    }
  }

  async function handleForgotPassword(event) {
    if (event?.preventDefault) event.preventDefault();
    const result = await requestPasswordReset(resetEmail || email);
    if (!result.ok) {
      setFeedback({ tone: 'danger', message: result.message });
      return;
    }
    setFeedback({ tone: 'info', message: language === 'fr' ? 'Demande envoyée. Le support examinera votre adresse et reviendra vers vous.' : 'Request sent. Support will review your address and follow up.' });
    setShowForgot(false);
    setResetEmail('');
  }

  return (
    <section className="container section auth-page">
      <div className="auth-page__inner">
        <Card className="auth-panel auth-panel--single">
          <div className="auth-panel__header">
            <div>
              <p className="eyebrow">{copy.common.login}</p>
              <h1>{copy.login.title}</h1>
              <p className="muted">{copy.login.subtitle}</p>
            </div>
            <GuestBadge />
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>

            <label className="field">
              <span className="field__label">{language === 'fr' ? 'Mot de passe' : 'Password'}</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={language === 'fr' ? 'Votre mot de passe' : 'Your password'}
              />
            </label>

            <div className="auth-actions-row">
              <button type="submit" className="button button--primary button--full" disabled={loading || !email || !password}>
                {loading ? (language === 'fr' ? 'Connexion…' : 'Signing in…') : (language === 'fr' ? 'Se connecter' : 'Sign in')}
              </button>
              <button type="button" className="button button--ghost button--full" disabled={loading || !email || !password} onClick={handleCreate}>
                {language === 'fr' ? 'Créer un compte' : 'Create account'}
              </button>
            </div>

            <button type="button" className="auth-link" onClick={() => setShowForgot((current) => !current)}>
              {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
            </button>

            {showForgot ? (
              <div className="forgot-box">
                <label className="field field--compact">
                  <span className="field__label">Email</span>
                  <input value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="name@example.com" />
                </label>
                <button type="button" className="button button--soft button--full" onClick={handleForgotPassword}>
                  {language === 'fr' ? 'Envoyer la demande' : 'Send request'}
                </button>
                <p className="muted">{language === 'fr' ? 'Le support traitera votre demande dès que possible.' : 'Support will review your request as soon as possible.'}</p>
              </div>
            ) : null}

            {feedback.message ? <div className={`login-hint login-hint--${feedback.tone || 'info'}`}>{feedback.message}</div> : null}
          </form>

          <div className="auth-divider"><span>{language === 'fr' ? 'ou' : 'or'}</span></div>

          <button
            type="button"
            className="button button--soft button--full"
            onClick={() => continueAsGuest({ displayName: language === 'fr' ? 'Invité' : 'Guest' })}
          >
            {copy.common.continueAsGuest}
          </button>

          <div className="auth-panel__footer">
            <div>
              <strong>{language === 'fr' ? 'Support' : 'Support'}</strong>
              <span>{config.branding.supportEmail}</span>
            </div>
            <div>
              <strong>{language === 'fr' ? 'Récupération' : 'Recovery'}</strong>
              <span>{language === 'fr' ? 'Demande traitée par le support' : 'Handled by support'}</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
