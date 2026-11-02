'use client';
import { useState } from 'react';
import { Shield, KeyRound, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials.');
      }

      // Successful login - reload to let server component render editor
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Masthead Header */}
        <div className="admin-login-head">
          <div className="admin-badge">
            <Shield size={13} />
            <span>JWT AUTHENTICATION</span>
          </div>
          <h1>Editorial Admin</h1>
          <p>Sign in with your admin credentials to manage and publish the journal.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-error-notice" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label htmlFor="admin-email">Admin Email</label>
            <div className="admin-input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">Admin Password</label>
            <div className="admin-input-wrap">
              <KeyRound size={16} className="input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            <span>{loading ? 'Authenticating…' : 'Sign in to Admin Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link */}
        <div className="admin-login-footer">
          <a href="/">← Return to Public Journal</a>
        </div>
      </div>
    </div>
  );
}

