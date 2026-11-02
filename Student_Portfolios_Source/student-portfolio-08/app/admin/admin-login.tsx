'use client';

import { useState, type FormEvent } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('student8techxera@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-badge">
            <Lock size={26} />
          </div>
          <h2>Admin Authentication</h2>
          <p>Portfolio Content Management & Configuration Console</p>
        </div>

        {error && (
          <div className="admin-login-error" role="alert">
            <span>⚠</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-user">
              <User size={15} /> Admin Email
            </label>
            <input
              id="admin-user"
              type="email"
              autoComplete="username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="student8techxera@gmail.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-pass">
              <KeyRound size={15} /> Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} /> Verifying JWT...
              </>
            ) : (
              <>
                <ShieldCheck size={18} /> Authenticate & Access Admin
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="back-link">
            <ArrowLeft size={16} /> Back to Portfolio
          </a>
        </div>
      </div>

      <style jsx>{`
        .admin-login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #090e0c;
          padding: 24px;
          font-family: 'DM Mono', Consolas, monospace;
          color: #d6e7da;
        }

        .admin-login-card {
          width: 100%;
          max-width: 440px;
          background: #111a14;
          border: 1px solid #283e30;
          border-radius: 12px;
          padding: 36px 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .admin-icon-badge {
          width: 58px;
          height: 58px;
          background: #1c3325;
          color: #9adb9e;
          border: 1px solid #365e43;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .admin-login-header h2 {
          font-size: 22px;
          font-weight: 600;
          color: #f0f7f2;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .admin-login-header p {
          font-size: 13px;
          color: #8aa296;
          margin: 0;
          line-height: 1.5;
        }

        .admin-login-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(220, 53, 69, 0.15);
          border: 1px solid #dc3545;
          color: #ff9b9b;
          padding: 12px 14px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #a4beae;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          background: #0b120d;
          border: 1px solid #2d4536;
          border-radius: 6px;
          padding: 12px 14px;
          color: #e5f2e8;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus {
          border-color: #9adb9e;
          box-shadow: 0 0 0 2px rgba(154, 219, 158, 0.2);
          outline: none;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          padding-right: 42px;
        }

        .toggle-password-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #7b9485;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }

        .toggle-password-btn:hover {
          color: #9adb9e;
        }

        .admin-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: #234731;
          color: #c9f5cf;
          border: 1px solid #457855;
          border-radius: 6px;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.2s, border-color 0.2s;
        }

        .admin-submit-btn:hover:not(:disabled) {
          background: #2d5a3f;
          border-color: #9adb9e;
        }

        .admin-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .admin-login-hint {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px dashed #283e30;
          font-size: 12px;
          color: #7a9384;
          line-height: 1.6;
        }

        .admin-login-hint code {
          background: #17261d;
          padding: 2px 6px;
          border-radius: 4px;
          color: #9adb9e;
        }

        .admin-login-hint small {
          display: block;
          margin-top: 6px;
          color: #61776a;
        }

        .admin-login-footer {
          margin-top: 20px;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8aa296;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #9adb9e;
        }
      `}</style>
    </div>
  );
}

