'use client';
import {useState} from 'react';
import {Shield,Lock,Mail,Eye,EyeOff,ArrowRight,ArrowLeft,CheckCircle2,AlertCircle} from 'lucide-react';

export default function AdminLogin({defaultEmail = ''}: {defaultEmail?: string}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email.trim(), password: password.trim()})
      });

      const data = await res.json() as {success?: boolean; error?: string};

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials.');
      }

      setSuccess(true);
      // Reload page with authenticated session
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-container">
        
        {/* Top Back Link */}
        <div className="adm-login-back">
          <a href="/" className="adm-login-back-btn">
            <ArrowLeft size={16} /> Return to Portfolio
          </a>
        </div>

        {/* Card */}
        <div className="adm-login-card">
          <div className="adm-login-header">
            <div className="adm-login-badge">
              <Shield size={24} />
            </div>
            <h1>Admin Portal</h1>
            <p>Enter your administrator credentials to sign in and manage your portfolio.</p>
          </div>

          {error && (
            <div className="adm-login-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="adm-login-alert success">
              <CheckCircle2 size={18} />
              <span>Authentication successful! Opening editor…</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="adm-login-form">
            <label className="adm-login-field">
              <span className="adm-login-label">Admin Email</span>
              <div className="adm-login-input-wrap">
                <Mail size={18} className="adm-login-icon" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={busy}
                />
              </div>
            </label>

            <label className="adm-login-field">
              <span className="adm-login-label">Password</span>
              <div className="adm-login-input-wrap">
                <Lock size={18} className="adm-login-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="adm-login-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="adm-login-submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="adm-spinner" /> Signing in…
                </>
              ) : (
                <>
                  Sign In to Admin Panel <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="adm-login-footer">
            <span>Locked &amp; Secured with SQLite Database</span>
          </div>
        </div>

      </div>
    </div>
  );
}
