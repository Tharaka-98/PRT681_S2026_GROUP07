/** Server-renderable KPI tile. No state, so no 'use client' needed. */
export default function StatTile({
  label,
  value,
  hint,
  tone = 'brand'
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'brand' | 'ok' | 'warn' | 'danger';
}) {
  const toneClass = tone === 'brand' ? '' : ` is-${tone}`;
  return (
    <div className={`tile${toneClass}`}>
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {hint && <div className="tile-hint">{hint}</div>}
    </div>
  );
}
