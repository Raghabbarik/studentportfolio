'use client';

import React, { useState, useEffect } from 'react';
import type { Profile } from '../../lib/portfolio';
import AdminPanel from './admin-panel';
import './admin.css';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const ADMIN_CONTACT_EMAIL = 'student10techxera@gmail.com';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [token, setToken] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Verify existing session on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Portfolio';
    }
    async function checkSession() {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('student10_admin_token') : '';

        const res = await fetch('/api/admin/session', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });
        const data = (await res.json()) as any;

        if (data.authenticated) {
          setToken(storedToken || 'cookie-session');
          // Fetch current portfolio data
          await loadPortfolioData(storedToken || '');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  const loadPortfolioData = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = (await res.json()) as any;
      if (data.profile) {
        setProfile(data.profile);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await res.json()) as any;

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Store token
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('student10_admin_token', data.token);
      }

      await loadPortfolioData(data.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch { }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student10_admin_token');
    }
    setToken('');
    setIsAuthenticated(false);
  };

  // Loading indicator while checking session
  if (isAuthenticated === null) {
    return (
      <div className="admin-root admin-login-wrap">
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(45, 212, 191, 0.2)',
              borderTopColor: '#2dd4bf',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>Verifying admin session...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render full Admin Panel
  if (isAuthenticated && profile) {
    return (
      <AdminPanel
        initialProfile={profile}
        token={token}
        adminEmail={ADMIN_CONTACT_EMAIL}
        initialUpdatedAt={updatedAt}
        onLogout={handleLogout}
      />
    );
  }

  // Otherwise render Admin Login Page
  return (
    <div className="admin-root admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-badge-icon">
            <ShieldCheck size={28} />
          </div>
          <h1>Student 10 Admin</h1>
          <p>Enter your credentials to access the portfolio control center.</p>
        </div>

        {errorMsg && (
          <div className="admin-error-alert">
            <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <div className="admin-input-wrap">
              <Mail size={16} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                className="admin-input"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap">
              <Lock size={16} className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                className="admin-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="admin-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-btn-primary"
          >
            {isLoading ? (
              'Authenticating with JWT...'
            ) : (
              <>
                Sign In to Admin Panel <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <a href="/" className="admin-back-link">
          ← Return to Public Portfolio
        </a>
      </div>
    </div>
  );
}

