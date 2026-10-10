import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>Not found</h1>
      <p className="muted">That record does not exist, or it was deleted.</p>
      <Link href="/tasks">Back to tasks</Link>
    </div>
  );
}
