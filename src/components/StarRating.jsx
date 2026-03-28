export default function StarRating({ rating = 5, compact = false }) {
  return (
    <div className={`star-rating ${compact ? 'star-rating--compact' : ''}`} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < Math.round(rating) ? 'is-filled' : ''}>★</span>
      ))}
    </div>
  );
}
