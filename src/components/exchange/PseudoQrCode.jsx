function createCells(value) {
  const input = String(value || '');
  return Array.from({ length: 441 }, (_, index) => {
    const code = input.charCodeAt(index % Math.max(input.length, 1)) || 0;
    return ((code + index * 17) % 7) > 2;
  });
}

export default function PseudoQrCode({ value }) {
  const cells = createCells(value);
  return (
    <div className="pseudo-qr" aria-hidden="true">
      {cells.map((filled, index) => (
        <span key={`${index}-${filled ? '1' : '0'}`} className={filled ? 'is-filled' : ''} />
      ))}
    </div>
  );
}
