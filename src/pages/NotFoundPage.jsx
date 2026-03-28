import { Link } from 'react-router-dom';
import Card from '../components/Card';

export default function NotFoundPage() {
  return (
    <section className="container section centered-page">
      <Card className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Page introuvable</h1>
        <p className="muted">Cette route n’existe pas dans la configuration actuelle de l’application.</p>
        <Link to="/" className="button button--primary">Retour à l’accueil</Link>
      </Card>
    </section>
  );
}
