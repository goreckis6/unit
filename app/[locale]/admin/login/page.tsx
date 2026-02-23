'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/twojastara/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/twojastara');
      router.refresh();
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-subtitle">Sign in to manage your site</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">{error}</div>
          )}
          <div className="admin-login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary admin-login-btn"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <Link href="/" className="admin-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
