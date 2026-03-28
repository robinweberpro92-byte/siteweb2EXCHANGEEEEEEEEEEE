import { useMemo, useState } from 'react';
import Badge from '../../Badge';
import { AdminEmptyState, AdminField, AdminMetric, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';
import { generateId } from '../../../utils/storage';

const LANG_OPTIONS = ['fr', 'en', 'all'];
const CATEGORIES = ['rapidité', 'sécurité', 'support', 'simplicité', 'mobile', 'frais'];

function recomputeTrust(reviews, currentTrust) {
  const visible = reviews.filter((review) => review.visible !== false);
  const averageRating = visible.length ? Number((visible.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visible.length).toFixed(1)) : 0;
  return {
    ...currentTrust,
    averageRating,
    reviewCount: visible.length,
  };
}

export default function ReviewsTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const reviews = data.reviews || [];
  const [localeFilter, setLocaleFilter] = useState('all');
  const [newReview, setNewReview] = useState({ author: '', rating: 5, language: 'fr', category: 'rapidité', text: '', featured: true, verified: true, visible: true });

  const filtered = useMemo(
    () => reviews.filter((review) => localeFilter === 'all' || review.language === localeFilter || review.language === 'all'),
    [reviews, localeFilter],
  );

  function updateReviews(nextReviews) {
    onChangeSection('reviews', nextReviews);
    onChangeSection('trustIndicators', recomputeTrust(nextReviews, data.trustIndicators));
  }

  function updateReview(id, patch) {
    updateReviews(reviews.map((review) => (review.id === id ? { ...review, ...patch } : review)));
  }

  function deleteReview(id) {
    updateReviews(reviews.filter((review) => review.id !== id));
  }

  function addReview() {
    if (readOnly || !newReview.author.trim() || !newReview.text.trim()) return;
    const entry = {
      id: generateId('REV'),
      author: newReview.author.trim(),
      rating: Number(newReview.rating || 5),
      language: newReview.language,
      category: newReview.category,
      text: newReview.text.trim(),
      featured: newReview.featured,
      verified: newReview.verified,
      visible: newReview.visible,
      order: reviews.length + 1,
      avatar: newReview.author.trim().slice(0, 1).toUpperCase(),
    };
    updateReviews([entry, ...reviews]);
    setNewReview({ author: '', rating: 5, language: 'fr', category: 'rapidité', text: '', featured: true, verified: true, visible: true });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Avis visibles" value={String(reviews.filter((review) => review.visible !== false).length)} helper="preuves sociales publiées" />
        <AdminMetric label="Mise en avant" value={String(reviews.filter((review) => review.featured).length)} helper="landing + login" tone="success" />
        <AdminMetric label="Note moyenne" value={`${Number(data.trustIndicators.averageRating || 0).toFixed(1)}/5`} helper="trust bar" tone="warning" />
        <AdminMetric label="Volume d'avis" value={String(data.trustIndicators.reviewCount || reviews.length)} helper="indicateur public" tone="info" />
      </div>

      <AdminSection eyebrow="Création" title="Ajouter un avis" description="Générez une carte d’avis premium avec langue, catégorie et badge verified.">
        <div className="field-grid field-grid--4">
          <AdminField label="Auteur"><input disabled={readOnly} value={newReview.author} onChange={(event) => setNewReview((current) => ({ ...current, author: event.target.value }))} /></AdminField>
          <AdminField label="Note"><input disabled={readOnly} type="number" min="1" max="5" step="1" value={newReview.rating} onChange={(event) => setNewReview((current) => ({ ...current, rating: Number(event.target.value || 5) }))} /></AdminField>
          <AdminField label="Langue"><select disabled={readOnly} value={newReview.language} onChange={(event) => setNewReview((current) => ({ ...current, language: event.target.value }))}>{LANG_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Catégorie"><select disabled={readOnly} value={newReview.category} onChange={(event) => setNewReview((current) => ({ ...current, category: event.target.value }))}>{CATEGORIES.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
          <AdminField label="Texte" className="field--full"><textarea disabled={readOnly} value={newReview.text} onChange={(event) => setNewReview((current) => ({ ...current, text: event.target.value }))} /></AdminField>
          <div className="toggle-stack field--full">
            <AdminToggle label="Avis visible publiquement" checked={newReview.visible} onChange={(checked) => setNewReview((current) => ({ ...current, visible: checked }))} disabled={readOnly} />
            <AdminToggle label="Mettre en avant" checked={newReview.featured} onChange={(checked) => setNewReview((current) => ({ ...current, featured: checked }))} disabled={readOnly} />
            <AdminToggle label="Badge verified" checked={newReview.verified} onChange={(checked) => setNewReview((current) => ({ ...current, verified: checked }))} disabled={readOnly} />
          </div>
          {!readOnly ? (
            <div className="field field--action">
              <span className="field__label">Action</span>
              <button type="button" className="button button--primary" onClick={addReview}>Ajouter l’avis</button>
            </div>
          ) : null}
        </div>
      </AdminSection>

      <AdminSection
        eyebrow="Gestion"
        title="Avis publiés"
        description="Editez la note, le texte, la langue et les badges directement depuis la liste."
        actions={
          <div className="toolbar-actions">
            <select value={localeFilter} onChange={(event) => setLocaleFilter(event.target.value)}>
              <option value="all">Toutes langues</option>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
            {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => onChangeSection('trustIndicators', recomputeTrust(reviews, data.trustIndicators))}>Recalculer la note</button> : null}
          </div>
        }
      >
        {!filtered.length ? (
          <AdminEmptyState title="Aucun avis" description="Ajoutez des témoignages pour renforcer la preuve sociale." />
        ) : (
          <div className="list-stack">
            {filtered.map((review) => (
              <div key={review.id} className="list-row list-row--panel list-row--expanded">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone="warning">{review.rating}/5</Badge>
                      <Badge tone="neutral">{review.language}</Badge>
                      <Badge tone="info">{review.category}</Badge>
                      {review.featured ? <Badge tone="success">Featured</Badge> : null}
                      {review.verified ? <Badge tone="success">Verified</Badge> : null}
                    </div>
                    <strong>{review.author}</strong>
                    <span>{review.visible === false ? 'Masqué publiquement' : 'Visible publiquement'}</span>
                  </div>
                  <div className="field-grid field-grid--4 compact-fields">
                    <AdminField label="Auteur"><input disabled={readOnly} value={review.author} onChange={(event) => updateReview(review.id, { author: event.target.value, avatar: event.target.value.slice(0, 1).toUpperCase() })} /></AdminField>
                    <AdminField label="Note"><input disabled={readOnly} type="number" min="1" max="5" value={review.rating} onChange={(event) => updateReview(review.id, { rating: Number(event.target.value || 5) })} /></AdminField>
                    <AdminField label="Langue"><select disabled={readOnly} value={review.language || 'fr'} onChange={(event) => updateReview(review.id, { language: event.target.value })}>{LANG_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
                    <AdminField label="Catégorie"><select disabled={readOnly} value={review.category || 'rapidité'} onChange={(event) => updateReview(review.id, { category: event.target.value })}>{CATEGORIES.map((option) => <option key={option}>{option}</option>)}</select></AdminField>
                    <AdminField label="Texte" className="field--full"><textarea disabled={readOnly} value={review.text} onChange={(event) => updateReview(review.id, { text: event.target.value })} /></AdminField>
                  </div>
                  <div className="toggle-stack toggle-stack--inline">
                    <AdminToggle label="Visible" checked={review.visible !== false} onChange={(checked) => updateReview(review.id, { visible: checked })} disabled={readOnly} />
                    <AdminToggle label="Featured" checked={Boolean(review.featured)} onChange={(checked) => updateReview(review.id, { featured: checked })} disabled={readOnly} />
                    <AdminToggle label="Verified" checked={Boolean(review.verified)} onChange={(checked) => updateReview(review.id, { verified: checked })} disabled={readOnly} />
                  </div>
                </div>
                <div className="list-row__actions list-row__actions--stack">
                  {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => deleteReview(review.id)}>Supprimer</button> : null}
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
