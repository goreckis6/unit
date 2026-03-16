'use client';

import { useEffect, useState } from 'react';
import { BASE_URL } from '@/lib/hreflang';

type TxtFile = {
  id: string;
  hash: string;
  displayName: string;
  createdAt: string;
};

export default function TxtFilesPage() {
  const [displayName, setDisplayName] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<TxtFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successUrl, setSuccessUrl] = useState('');

  useEffect(() => {
    fetch('/api/twojastara/txt-files', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFiles(data);
      })
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessUrl('');
    const name = displayName.trim();
    if (!name) {
      setError('Enter a filename (e.g. site.txt)');
      return;
    }
    if (!name.endsWith('.txt')) {
      setError('Filename must end with .txt');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/twojastara/txt-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, content }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSuccessUrl(data.url);
      setFiles((prev) => [{ id: data.hash, hash: data.hash, displayName: name, createdAt: new Date().toISOString() }, ...prev]);
      setDisplayName('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        TXT Files
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Create TXT files. When saved, each file is available at{' '}
        <code style={{ fontSize: '0.85rem' }}>{BASE_URL}/&#123;hash&#125;.txt</code>
      </p>

      <form onSubmit={handleSave} style={{ maxWidth: 600, marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="displayName" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Filename
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="site.txt"
            className="admin-form-input"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="File content..."
            className="admin-form-textarea"
            style={{ width: '100%', minHeight: 160 }}
          />
        </div>
        {error && (
          <div role="alert" style={{ color: 'var(--error-color)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        {successUrl && (
          <div
            role="status"
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--success-color)',
              borderRadius: 8,
              fontSize: '0.9rem',
            }}
          >
            <strong>Saved.</strong> URL:{' '}
            <a href={successUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
              {successUrl}
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(successUrl)}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem' }}
            >
              Copy
            </button>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save TXT File'}
        </button>
      </form>

      <section>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Existing files</h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : files.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No files yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map((f) => {
              const url = `${BASE_URL}/${f.hash}.txt`;
              return (
                <li
                  key={f.id}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{f.displayName}</span>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {url}
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="btn btn-secondary btn-sm"
                  >
                    Copy URL
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
