'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AdminLoginProps {
  initialError?: string;
}

export default function AdminLogin({ initialError }: AdminLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = (await res.json()) as { error?: string; success?: boolean };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      // Successful JWT login -> refresh page to load the editor
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Top Eyebrow */}
        <div className="admin-login-top">
          <div className="admin-badge">
            <ShieldCheck size={14} />
            <span>ADMIN SECURITY GATEWAY</span>
          </div>
          <Link href="/" className="admin-back-link">
            <ArrowLeft size={14} />
            <span>Public Site</span>
          </Link>
        </div>

        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-logo-mark">
            <span>S4</span>
          </div>
          <h1>ADMIN SIGN IN</h1>
          <p>Sign in with your verified administrator credentials to access the portfolio editor.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="admin-form">
          <label className="admin-field">
            <span className="field-label">Administrator Email</span>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>
          </label>

          <label className="admin-field">
            <span className="field-label">Password</span>
            <div className="input-group">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={busy || !email || !password}
          >
            {busy ? (
              <span>Authenticating…</span>
            ) : (
              <>
                <span>Sign In to Editor</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <span>Protected route: <code>/admin</code></span>
          <span className="separator">&middot;</span>
          <Link href="/">Back to Portfolio</Link>
        </div>
      </div>
    </div>
  );
}
