'use client';

import { useCallback, useEffect, useState } from 'react';

type KeyStatus = {
  storedInDatabase: boolean;
  environmentFallbackAvailable: boolean;
  effectiveConfigured: boolean;
};

type ApiKeysStatus = {
  ollama: KeyStatus;
  anthropic: KeyStatus;
  deepl: KeyStatus;
  updatedAt: string | null;
};

const KEY_HELP =
  'Keys saved here are stored in the database and override environment variables. Leave blank and click Save to skip changing that provider. Use “Clear DB key” to remove the stored value and fall back to env again. Test API runs a tiny request: if the password field has text, that key is tested (before save); otherwise the key from DB or env is used.';

export default function ApiKeysPage() {
  const [status, setStatus] = useState<ApiKeysStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [ollamaInput, setOllamaInput] = useState('');
  const [anthropicInput, setAnthropicInput] = useState('');
  const [deeplInput, setDeeplInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [testingOllama, setTestingOllama] = useState(false);
  const [testingAnthropic, setTestingAnthropic] = useState(false);
  const [testingDeepl, setTestingDeepl] = useState(false);
  const [testOllamaNote, setTestOllamaNote] = useState('');
  const [testAnthropicNote, setTestAnthropicNote] = useState('');
  const [testDeeplNote, setTestDeeplNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch('/api/twojastara/settings/api-keys', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStatus(data as ApiKeysStatus);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSection(which: 'ollama' | 'anthropic' | 'deepl') {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (which === 'ollama' && ollamaInput.trim()) body.ollamaApiKey = ollamaInput.trim();
      if (which === 'anthropic' && anthropicInput.trim()) body.anthropicApiKey = anthropicInput.trim();
      if (which === 'deepl' && deeplInput.trim()) body.deeplApiKey = deeplInput.trim();
      if (Object.keys(body).length === 0) {
        setMessage('Enter a new key or use Clear to remove the database value.');
        return;
      }
      const res = await fetch('/api/twojastara/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMessage(data.message || 'Saved');
      if (which === 'ollama') setOllamaInput('');
      if (which === 'anthropic') setAnthropicInput('');
      if (which === 'deepl') setDeeplInput('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function testOllamaApi() {
    setError('');
    setTestOllamaNote('');
    setTestingOllama(true);
    try {
      const body: Record<string, unknown> = { provider: 'ollama' };
      if (ollamaInput.trim()) body.ollamaApiKey = ollamaInput.trim();
      const res = await fetch('/api/twojastara/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        setTestOllamaNote(
          [data.message, data.model && `Model: ${data.model}`, data.responsePreview && `Preview: ${data.responsePreview}`]
            .filter(Boolean)
            .join(' · ')
        );
      } else {
        setError(data.error || 'Ollama test failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ollama test failed');
    } finally {
      setTestingOllama(false);
    }
  }

  async function testAnthropicApi() {
    setError('');
    setTestAnthropicNote('');
    setTestingAnthropic(true);
    try {
      const body: Record<string, unknown> = { provider: 'anthropic' };
      if (anthropicInput.trim()) body.anthropicApiKey = anthropicInput.trim();
      const res = await fetch('/api/twojastara/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        setTestAnthropicNote(
          [data.message, data.model && `Model: ${data.model}`, data.responsePreview && `Preview: ${data.responsePreview}`]
            .filter(Boolean)
            .join(' · ')
        );
      } else {
        setError(data.error || 'Anthropic test failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Anthropic test failed');
    } finally {
      setTestingAnthropic(false);
    }
  }

  async function clearOllama() {
    if (!confirm('Remove Ollama key from database? The app will use OLLAMA_API_KEY from the environment if set.')) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/twojastara/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearOllama: true }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Clear failed');
      setMessage('Ollama DB key cleared');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Clear failed');
    } finally {
      setSaving(false);
    }
  }

  async function clearAnthropic() {
    if (!confirm('Remove Anthropic key from database? The app will use ANTHROPIC_API_KEY from the environment if set.')) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/twojastara/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAnthropic: true }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Clear failed');
      setMessage('Anthropic DB key cleared');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Clear failed');
    } finally {
      setSaving(false);
    }
  }

  async function clearDeepl() {
    if (!confirm('Remove DeepL key from database? The app will use DEEPL_API_KEY from the environment if set.')) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/twojastara/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearDeepl: true }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Clear failed');
      setMessage('DeepL DB key cleared');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Clear failed');
    } finally {
      setSaving(false);
    }
  }

  async function testDeeplApi() {
    setError('');
    setTestDeeplNote('');
    setTestingDeepl(true);
    try {
      const body: Record<string, unknown> = { provider: 'deepl' };
      if (deeplInput.trim()) body.deeplApiKey = deeplInput.trim();
      const res = await fetch('/api/twojastara/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        setTestDeeplNote(
          [data.message, data.responsePreview && `Preview: ${data.responsePreview}`].filter(Boolean).join(' · ')
        );
      } else {
        setError(data.error || 'DeepL test failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DeepL test failed');
    } finally {
      setTestingDeepl(false);
    }
  }

  function badge(ok: boolean, label: string) {
    return (
      <span
        style={{
          marginLeft: '0.5rem',
          padding: '0.15rem 0.5rem',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 600,
          background: ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)',
          color: ok ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>API Keys</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 720 }}>{KEY_HELP}</p>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>}
      {!loading && status && (
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Ollama Cloud</strong>
            {badge(status.ollama.effectiveConfigured, status.ollama.effectiveConfigured ? 'ready' : 'not configured')}
          </p>
          <ul style={{ margin: '0 0 1rem 1.25rem' }}>
            <li>Key in database: {status.ollama.storedInDatabase ? 'yes (hidden)' : 'no'}</li>
            <li>Env fallback (OLLAMA_API_KEY): {status.ollama.environmentFallbackAvailable ? 'set' : 'not set'}</li>
          </ul>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Anthropic (Claude)</strong>
            {badge(status.anthropic.effectiveConfigured, status.anthropic.effectiveConfigured ? 'ready' : 'not configured')}
          </p>
          <ul style={{ margin: '0 0 1rem 1.25rem' }}>
            <li>Key in database: {status.anthropic.storedInDatabase ? 'yes (hidden)' : 'no'}</li>
            <li>Env fallback (ANTHROPIC_API_KEY): {status.anthropic.environmentFallbackAvailable ? 'set' : 'not set'}</li>
          </ul>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>DeepL</strong>
            {badge(status.deepl?.effectiveConfigured, status.deepl?.effectiveConfigured ? 'ready' : 'not configured')}
          </p>
          <ul style={{ margin: '0 0 0 1.25rem' }}>
            <li>Key in database: {status.deepl?.storedInDatabase ? 'yes (hidden)' : 'no'}</li>
            <li>Env fallback (DEEPL_API_KEY): {status.deepl?.environmentFallbackAvailable ? 'set' : 'not set'}</li>
          </ul>
          {status.updatedAt && (
            <p style={{ marginTop: '1rem' }}>Last settings update: {new Date(status.updatedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {error && (
        <div className="validation-message warning" role="alert" style={{ marginBottom: '1rem', maxWidth: 600 }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ marginBottom: '1rem', color: 'var(--accent-success, #22c55e)', maxWidth: 600 }}>{message}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 600 }}>
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Ollama Cloud API key</h2>
          <input
            type="password"
            autoComplete="off"
            value={ollamaInput}
            onChange={(e) => setOllamaInput(e.target.value)}
            placeholder="Paste new key to store in DB…"
            className="admin-form-input"
            style={{ width: '100%', marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => saveSection('ollama')}>
              Save Ollama key
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving || testingOllama}
              onClick={testOllamaApi}
              title={
                ollamaInput.trim()
                  ? 'Test the key in the field above (not saved yet)'
                  : 'Test the key from database or OLLAMA_API_KEY'
              }
            >
              {testingOllama ? 'Testing…' : 'Test API'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={clearOllama}>
              Clear DB key (use env)
            </button>
          </div>
          {testOllamaNote && (
            <p style={{ marginTop: '0.75rem', color: 'var(--accent-success, #22c55e)', fontSize: '0.9rem' }}>
              {testOllamaNote}
            </p>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Anthropic API key</h2>
          <input
            type="password"
            autoComplete="off"
            value={anthropicInput}
            onChange={(e) => setAnthropicInput(e.target.value)}
            placeholder="Paste new key to store in DB…"
            className="admin-form-input"
            style={{ width: '100%', marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => saveSection('anthropic')}>
              Save Anthropic key
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving || testingAnthropic}
              onClick={testAnthropicApi}
              title={
                anthropicInput.trim()
                  ? 'Test the key in the field above (not saved yet)'
                  : 'Test the key from database or ANTHROPIC_API_KEY'
              }
            >
              {testingAnthropic ? 'Testing…' : 'Test API'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={clearAnthropic}>
              Clear DB key (use env)
            </button>
          </div>
          {testAnthropicNote && (
            <p style={{ marginTop: '0.75rem', color: 'var(--accent-success, #22c55e)', fontSize: '0.9rem' }}>
              {testAnthropicNote}
            </p>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>DeepL API key</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Free-plan keys end with <code>:fx</code> (uses api-free.deepl.com). Supports ~30 languages — fast, no chunking needed.
          </p>
          <input
            type="password"
            autoComplete="off"
            value={deeplInput}
            onChange={(e) => setDeeplInput(e.target.value)}
            placeholder="Paste new key to store in DB…"
            className="admin-form-input"
            style={{ width: '100%', marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => saveSection('deepl')}>
              Save DeepL key
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving || testingDeepl}
              onClick={testDeeplApi}
              title={deeplInput.trim() ? 'Test the key in the field above (not saved yet)' : 'Test the key from database or DEEPL_API_KEY'}
            >
              {testingDeepl ? 'Testing…' : 'Test API'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={clearDeepl}>
              Clear DB key (use env)
            </button>
          </div>
          {testDeeplNote && (
            <p style={{ marginTop: '0.75rem', color: 'var(--accent-success, #22c55e)', fontSize: '0.9rem' }}>
              {testDeeplNote}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
