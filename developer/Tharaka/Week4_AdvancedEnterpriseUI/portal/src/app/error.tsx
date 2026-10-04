'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>Something went wrong</h1>
      <p className="muted mono">{error.message}</p>
      <button className="k-button k-button-md k-button-solid k-button-solid-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
