export default function PageHead({
  title,
  description,
  badge,
  children
}: {
  title: string;
  description?: string;
  /** e.g. "SSR - dynamic" or "SSG - revalidate 300s" */
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {badge && <span className="render-badge">{badge}</span>}
        {children}
      </div>
    </div>
  );
}
