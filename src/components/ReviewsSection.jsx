import Card from './Card';
import Badge from './Badge';
import StarRating from './StarRating';
import { useApp } from '../context/AppContext';

function initials(author) {
  return String(author || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase();
}

export default function ReviewsSection({ limit = 6, compact = false, title, subtitle }) {
  const { config, visibleReviews, language } = useApp();
  const items = visibleReviews.slice(0, limit);

  return (
    <section className="reviews-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Preuve sociale' : 'Social proof'}</p>
          <h3>{title || (language === 'fr' ? 'Avis clients mis en avant' : 'Highlighted customer reviews')}</h3>
          <p className="muted">
            {subtitle || (language === 'fr'
              ? 'Des retours lisibles, cohérents et crédibles pour renforcer la confiance sans surcharger la landing.'
              : 'Readable, credible customer feedback used as trust-building proof without clutter.')}
          </p>
        </div>
        <div className="reviews-summary">
          <StarRating rating={config.trustIndicators.averageRating} compact />
          <strong>{config.trustIndicators.averageRating.toFixed(1)}/5</strong>
          <span>{config.trustIndicators.reviewCount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} reviews</span>
        </div>
      </div>

      <div className={`reviews-grid ${compact ? 'reviews-grid--compact' : ''}`}>
        {items.map((review) => (
          <Card key={review.id} className="review-card">
            <div className="review-card__head">
              <div className="review-card__author">
                <div className="review-avatar" style={{ background: review.avatarTone || 'var(--primary)' }}>
                  {initials(review.author)}
                </div>
                <div>
                  <strong>{review.author}</strong>
                  <span>{review.role}</span>
                </div>
              </div>
              {review.verified ? <Badge tone="success">Verified</Badge> : null}
            </div>
            <StarRating rating={review.rating} compact />
            <p>{review.text}</p>
            <div className="review-card__foot">
              <span>{review.category}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
