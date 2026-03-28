export default function ExchangeProgress({ steps, currentIndex }) {
  return (
    <div className="exchange-progress" aria-label="Progression de l’échange">
      {steps.map((step, index) => (
        <div key={step.key} className={`exchange-progress__item ${index <= currentIndex ? 'is-active' : ''} ${index === currentIndex ? 'is-current' : ''}`}>
          <span>{index + 1}</span>
          <div>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
