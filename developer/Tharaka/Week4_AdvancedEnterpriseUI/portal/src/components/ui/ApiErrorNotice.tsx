export default function ApiErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="alert alert-error">
      <strong>Could not reach the API.</strong> Start the backend first:{' '}
      <code className="mono">cd TaskManagerAPI &amp;&amp; dotnet run</code>
      <div className="mono" style={{ marginTop: 6, opacity: 0.8 }}>{message}</div>
    </div>
  );
}
