'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  Save,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Code,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { Profile } from '../../lib/portfolio';

const DEFAULT_ADMIN_EMAIL = 'student1techxera@gmail.com';
const ACCENT_PRESETS = [
  { name: 'Electric Blue', hex: '#3157eb' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Royal Purple', hex: '#8b5cf6' },
  { name: 'Crimson Rose', hex: '#f43f5e' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Slate Obsidian', hex: '#1e293b' },
];

export default function AdminPanel() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [token, setToken] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rawJson, setRawJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'skills' | 'projects' | 'journey' | 'json'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Check auth status on mount
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('admin_jwt_token');
      try {
        const res = await fetch('/api/admin/verify', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.authenticated) {
            setIsAuthenticated(true);
            setAdminEmail(data.user?.email || '');
            if (storedToken) setToken(storedToken);
            loadPortfolioData(storedToken || '');
            return;
          }
        }
      } catch (err) {
        console.warn('Verify error:', err);
      }
      setIsAuthenticated(false);
    }
    verifyAuth();
  }, []);

  // Fetch current portfolio data
  const loadPortfolioData = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        setProfile(data);
        setRawJson(JSON.stringify(data, null, 2));
      } else {
        // Fallback to sample endpoint
        const fallback = await fetch('/api/profile');
        if (fallback.ok) {
          const data = (await fallback.json()) as any;
          setProfile(data.profile || data);
          setRawJson(JSON.stringify(data.profile || data, null, 2));
        }
      }
    } catch (e) {
      console.error('Failed to load portfolio data:', e);
    }
  }, []);

  // Handle Login
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setToken(data.token);
        setAdminEmail(data.user?.email || emailInput);
        localStorage.setItem('admin_jwt_token', data.token);
        setIsAuthenticated(true);
        loadPortfolioData(data.token);
      } else {
        setLoginError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setLoginError('Network error while logging in.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.removeItem('admin_jwt_token');
    setToken('');
    setIsAuthenticated(false);
  }

  // Save changes to portfolio-data.json
  async function handleSave(dataToSave?: Profile) {
    setIsSaving(true);
    setSaveMessage(null);

    const payload = dataToSave || profile;
    if (!payload) return;

    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('admin_jwt_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as any;
      if (res.ok && result.success) {
        setSaveMessage({
          text: 'Saved successfully to portfolio-data.json!',
          type: 'success',
        });
        setProfile(payload);
        setRawJson(JSON.stringify(payload, null, 2));
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({
          text: result.error || 'Failed to save changes.',
          type: 'error',
        });
      }
    } catch (e) {
      setSaveMessage({ text: 'Network error saving to JSON file.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  // Raw JSON save
  function handleRawJsonSave() {
    try {
      const parsed = JSON.parse(rawJson);
      setJsonError('');
      setProfile(parsed);
      handleSave(parsed);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON syntax';
      setJsonError(msg);
    }
  }

  // Quick field updater
  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    if (!profile) return;
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  }

  // Skill handlers
  function addSkill() {
    if (!newSkill.trim() || !profile) return;
    if (profile.skills.includes(newSkill.trim())) return;
    const updatedSkills = [...profile.skills, newSkill.trim()];
    updateField('skills', updatedSkills);
    setNewSkill('');
  }

  function removeSkill(idx: number) {
    if (!profile) return;
    const updatedSkills = profile.skills.filter((_, i) => i !== idx);
    updateField('skills', updatedSkills);
  }

  // Project handlers
  function addProject() {
    if (!profile) return;
    const newProj = {
      title: 'New Featured Project',
      category: 'Web development',
      description: 'Describe this project, key technical challenges solved, and outcomes.',
      url: 'https://github.com',
      image: '',
      year: new Date().getFullYear().toString(),
    };
    updateField('projects', [newProj, ...profile.projects]);
  }

  function updateProject(idx: number, field: string, val: string) {
    if (!profile) return;
    const projs = [...profile.projects];
    projs[idx] = { ...projs[idx], [field]: val };
    updateField('projects', projs);
  }

  function removeProject(idx: number) {
    if (!profile) return;
    const projs = profile.projects.filter((_, i) => i !== idx);
    updateField('projects', projs);
  }

  function moveProject(idx: number, direction: 'up' | 'down') {
    if (!profile) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= profile.projects.length) return;
    const projs = [...profile.projects];
    const temp = projs[idx];
    projs[idx] = projs[targetIdx];
    projs[targetIdx] = temp;
    updateField('projects', projs);
  }

  // Education handlers
  function addEducation() {
    if (!profile) return;
    const newEdu = {
      school: 'University Name',
      degree: 'Degree / Program Title',
      period: '2024 — 2028',
      detail: 'Add coursework, academic highlights, or activities.',
    };
    updateField('education', [...profile.education, newEdu]);
  }

  function updateEducation(idx: number, field: string, val: string) {
    if (!profile) return;
    const edu = [...profile.education];
    edu[idx] = { ...edu[idx], [field]: val };
    updateField('education', edu);
  }

  function removeEducation(idx: number) {
    if (!profile) return;
    const edu = profile.education.filter((_, i) => i !== idx);
    updateField('education', edu);
  }

  // Experience handlers
  function addExperience() {
    if (!profile) return;
    const newExp = {
      company: 'Company / Organization',
      role: 'Role Title',
      period: '2026',
      detail: 'Describe contributions, technologies used, and key accomplishments.',
    };
    updateField('experiences', [...profile.experiences, newExp]);
  }

  function updateExperience(idx: number, field: string, val: string) {
    if (!profile) return;
    const exps = [...profile.experiences];
    exps[idx] = { ...exps[idx], [field]: val };
    updateField('experiences', exps);
  }

  function removeExperience(idx: number) {
    if (!profile) return;
    const exps = profile.experiences.filter((_, i) => i !== idx);
    updateField('experiences', exps);
  }

  // Achievement handlers
  function addAchievement() {
    if (!newAchievement.trim() || !profile) return;
    updateField('achievements', [...profile.achievements, newAchievement.trim()]);
    setNewAchievement('');
  }

  function removeAchievement(idx: number) {
    if (!profile) return;
    updateField('achievements', profile.achievements.filter((_, i) => i !== idx));
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Verifying secure admin session...</p>
        <style jsx>{`
          .admin-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #f8fafc;
            font-family: system-ui, sans-serif;
            gap: 16px;
          }
          .spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGIN SCREEN (JWT TOKENIZED)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="shield-icon">
              <ShieldCheck size={36} color="#38bdf8" />
            </div>
            <h2>Admin Authentication</h2>
            <p>JWT Tokenized Secure Portal</p>
          </div>

          {loginError && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="field-group">
              <label>Admin Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your admin email"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="jwt-badge-note">
              <Key size={14} />
              <span>Cryptographic JWT Tokenized Session</span>
            </div>

            <button type="submit" className="login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <RefreshCw size={18} className="spin-fast" /> Signing In...
                </>
              ) : (
                <>
                  <Lock size={18} /> Authenticate & Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="back-link">
              ← Return to Public Portfolio
            </a>
          </div>
        </div>

        <style jsx>{`
          .login-wrapper {
            min-height: 100vh;
            background: radial-gradient(circle at 50% 20%, #1e293b 0%, #090d16 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #f1f5f9;
          }
          .login-card {
            width: 100%;
            max-width: 440px;
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px 36px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .login-header {
            text-align: center;
            margin-bottom: 28px;
          }
          .shield-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.25);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .login-header h2 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 6px 0;
            color: #ffffff;
            letter-spacing: -0.02em;
          }
          .login-header p {
            color: #94a3b8;
            font-size: 14px;
            margin: 0;
          }
          .alert-error {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 12px 14px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .field-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 7px;
          }
          .field-group input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            padding: 13px 16px;
            border-radius: 10px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
          }
          .field-group input:focus {
            border-color: #38bdf8;
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
          }
          .password-input-wrap {
            position: relative;
          }
          .password-input-wrap input {
            padding-right: 44px;
          }
          .toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
          }
          .toggle-password:hover {
            color: #f8fafc;
          }
          .jwt-badge-note {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.08);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(56, 189, 248, 0.15);
          }
          .login-btn {
            background: #2563eb;
            color: #ffffff;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: background 0.2s, transform 0.1s;
            margin-top: 6px;
          }
          .login-btn:hover {
            background: #1d4ed8;
          }
          .login-btn:active {
            transform: scale(0.99);
          }
          .spin-fast {
            animation: spin 0.8s linear infinite;
          }
          .login-footer {
            margin-top: 24px;
            text-align: center;
          }
          .back-link {
            color: #94a3b8;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s;
          }
          .back-link:hover {
            color: #f8fafc;
          }
        `}</style>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="admin-container">
      {/* Top Bar */}
      <header className="admin-header">
        <div className="header-left">
          <div className="brand-logo">
            <ShieldCheck size={22} color="#38bdf8" />
            <span>Admin Console</span>
          </div>
          <div className="jwt-status-tag">
            <span className="dot"></span>
            <span>JWT Active: {adminEmail || 'Admin Session'}</span>
          </div>
        </div>

        <div className="header-actions">
          <a href="/" target="_blank" rel="noreferrer" className="action-btn-outline">
            <ExternalLink size={15} /> View Live Portfolio
          </a>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="action-btn-primary"
          >
            {isSaving ? <RefreshCw size={15} className="spin-fast" /> : <Save size={15} />}
            Save to portfolio.json
          </button>
          <button onClick={handleLogout} className="action-btn-danger" title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div className={`toast-notification ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="admin-body">
        {/* Navigation Sidebar */}
        <aside className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile & Appearance
          </button>
          <button
            className={`nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Sparkles size={18} /> Bio & Story
          </button>
          <button
            className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Layers size={18} /> Skills & Tools ({profile?.skills.length || 0})
          </button>
          <button
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Briefcase size={18} /> Projects ({profile?.projects.length || 0})
          </button>
          <button
            className={`nav-item ${activeTab === 'journey' ? 'active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            <GraduationCap size={18} /> Education & Experience
          </button>
          <button
            className={`nav-item ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code size={18} /> Raw JSON Editor (.json file)
          </button>

          <div className="nav-storage-info">
            <p className="title">File Storage Target</p>
            <p className="path">portfolio-data.json</p>
            <p className="desc">Direct write to root file on disk. Live sync with portfolio.</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          {!profile ? (
            <div className="loading-profile">
              <RefreshCw size={24} className="spin-fast" /> Loading portfolio settings...
            </div>
          ) : (
            <>
              {/* TAB 1: PROFILE & APPEARANCE */}
              {activeTab === 'profile' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Profile & Visual Identity</h2>
                    <p>Customize core student details, accent colors, and editorial layout.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g. Satyam Mallik"
                      />
                    </div>

                    <div className="form-field">
                      <label>Professional Role / Title</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => updateField('role', e.target.value)}
                        placeholder="e.g. Full-Stack Developer & UI Designer"
                      />
                    </div>

                    <div className="form-field full-width">
                      <label>Hero Headline (Supports multiple lines)</label>
                      <textarea
                        rows={2}
                        value={profile.headline}
                        onChange={(e) => updateField('headline', e.target.value)}
                        placeholder="e.g. Thoughtful ideas.&#10;Beautifully built."
                      />
                    </div>

                    <div className="form-field">
                      <label>Availability Status Badge</label>
                      <input
                        type="text"
                        value={profile.availability}
                        onChange={(e) => updateField('availability', e.target.value)}
                        placeholder="e.g. Open to internships & collaborations"
                      />
                    </div>

                    <div className="form-field">
                      <label>Location</label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="e.g. India"
                      />
                    </div>

                    <div className="form-field">
                      <label>Contact Email (Used in contact links)</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="student1techxera@gmail.com"
                      />
                    </div>

                    <div className="form-field">
                      <label>Layout Style</label>
                      <select
                        value={profile.layout}
                        onChange={(e) => updateField('layout', e.target.value as Profile['layout'])}
                      >
                        <option value="editorial">Editorial (Clean split list with live art)</option>
                        <option value="centered">Centered (Focused headline)</option>
                        <option value="split">Split (Right-aligned title)</option>
                      </select>
                    </div>

                    <div className="form-field full-width">
                      <label>Brand Accent Color</label>
                      <div className="accent-picker-group">
                        <div className="preset-colors">
                          {ACCENT_PRESETS.map((p) => (
                            <button
                              key={p.hex}
                              type="button"
                              className={`color-chip ${profile.accent === p.hex ? 'active' : ''}`}
                              style={{ backgroundColor: p.hex }}
                              onClick={() => updateField('accent', p.hex)}
                              title={p.name}
                            />
                          ))}
                        </div>
                        <div className="custom-hex">
                          <input
                            type="color"
                            value={profile.accent}
                            onChange={(e) => updateField('accent', e.target.value)}
                          />
                          <input
                            type="text"
                            value={profile.accent}
                            onChange={(e) => updateField('accent', e.target.value)}
                            className="hex-text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BIO & STORY */}
              {activeTab === 'about' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Bio, Narrative & Assets</h2>
                    <p>Tell your story and manage profile picture and PDF résumé links.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>Detailed Biography</label>
                      <textarea
                        rows={6}
                        value={profile.bio}
                        onChange={(e) => updateField('bio', e.target.value)}
                        placeholder="Write your background, interests, passion for software..."
                      />
                    </div>

                    <div className="form-field">
                      <label>Profile Photo URL</label>
                      <input
                        type="text"
                        value={profile.photo}
                        onChange={(e) => updateField('photo', e.target.value)}
                        placeholder="https://... or leave empty for stylish avatar initials"
                      />
                    </div>

                    <div className="form-field">
                      <label>Résumé / CV Link (PDF)</label>
                      <input
                        type="text"
                        value={profile.resume}
                        onChange={(e) => updateField('resume', e.target.value)}
                        placeholder="https://... or link to Google Drive / GitHub release"
                      />
                    </div>

                    <div className="form-field">
                      <label>GitHub Profile URL</label>
                      <input
                        type="text"
                        value={profile.github}
                        onChange={(e) => updateField('github', e.target.value)}
                        placeholder="https://github.com/your-username"
                      />
                    </div>

                    <div className="form-field">
                      <label>LinkedIn Profile URL</label>
                      <input
                        type="text"
                        value={profile.linkedin}
                        onChange={(e) => updateField('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    </div>

                    <div className="form-field">
                      <label>Instagram URL</label>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => updateField('instagram', e.target.value)}
                        placeholder="https://instagram.com/your-handle"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS */}
              {activeTab === 'skills' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Technical Skills & Tools</h2>
                    <p>Add frameworks, languages, libraries, and design tools you specialize in.</p>
                  </div>

                  <div className="add-item-row">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a new skill (e.g. Docker, GraphQL, PyTorch)..."
                    />
                    <button type="button" onClick={addSkill} className="add-btn">
                      <Plus size={16} /> Add Skill
                    </button>
                  </div>

                  <div className="skills-tags-cloud">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="tab-pane">
                  <div className="pane-header with-action">
                    <div>
                      <h2>Projects Portfolio</h2>
                      <p>Showcase applications, systems, and creative experiments.</p>
                    </div>
                    <button type="button" onClick={addProject} className="add-btn">
                      <Plus size={16} /> Add Project
                    </button>
                  </div>

                  <div className="projects-list">
                    {profile.projects.map((proj, idx) => (
                      <div key={idx} className="project-card-admin">
                        <div className="card-top">
                          <span className="proj-num">0{idx + 1}</span>
                          <span className="proj-title-preview">{proj.title || 'Untitled Project'}</span>
                          <div className="card-controls">
                            <button
                              type="button"
                              onClick={() => moveProject(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="icon-mini"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProject(idx, 'down')}
                              disabled={idx === profile.projects.length - 1}
                              title="Move Down"
                              className="icon-mini"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProject(idx)}
                              title="Delete Project"
                              className="icon-mini danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="form-grid">
                          <div className="form-field">
                            <label>Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProject(idx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label>Category</label>
                            <input
                              type="text"
                              value={proj.category}
                              onChange={(e) => updateProject(idx, 'category', e.target.value)}
                              placeholder="e.g. Web development, AI System, Product design"
                            />
                          </div>
                          <div className="form-field">
                            <label>Year</label>
                            <input
                              type="text"
                              value={proj.year}
                              onChange={(e) => updateProject(idx, 'year', e.target.value)}
                              placeholder="2026"
                            />
                          </div>
                          <div className="form-field">
                            <label>Project / Live URL</label>
                            <input
                              type="text"
                              value={proj.url}
                              onChange={(e) => updateProject(idx, 'url', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="form-field full-width">
                            <label>Cover Image URL (optional)</label>
                            <input
                              type="text"
                              value={proj.image}
                              onChange={(e) => updateProject(idx, 'image', e.target.value)}
                              placeholder="https://... (leave empty for automatic graphic placeholder)"
                            />
                          </div>
                          <div className="form-field full-width">
                            <label>Description / Technical Story</label>
                            <textarea
                              rows={3}
                              value={proj.description}
                              onChange={(e) => updateProject(idx, 'description', e.target.value)}
                              placeholder="Describe what makes this project special..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: JOURNEY (EDUCATION & EXPERIENCE) */}
              {activeTab === 'journey' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Academic & Professional Journey</h2>
                    <p>Manage your education, work experience, and personal achievements.</p>
                  </div>

                  {/* Education Section */}
                  <div className="sub-section">
                    <div className="section-title-row">
                      <div className="title-toggle">
                        <input
                          type="checkbox"
                          id="showEdu"
                          checked={profile.showEducation}
                          onChange={(e) => updateField('showEducation', e.target.checked)}
                        />
                        <label htmlFor="showEdu">Display Education Section</label>
                      </div>
                      <button type="button" onClick={addEducation} className="add-btn-small">
                        <Plus size={14} /> Add Education
                      </button>
                    </div>

                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="entry-card">
                        <div className="entry-card-header">
                          <strong>{edu.school || 'College / University'}</strong>
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="icon-mini danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="form-grid">
                          <div className="form-field">
                            <label>Degree / Course</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label>Institution / School</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label>Time Period</label>
                            <input
                              type="text"
                              value={edu.period}
                              onChange={(e) => updateEducation(idx, 'period', e.target.value)}
                              placeholder="2024 — 2028"
                            />
                          </div>
                          <div className="form-field full-width">
                            <label>Key Details & Coursework</label>
                            <input
                              type="text"
                              value={edu.detail}
                              onChange={(e) => updateEducation(idx, 'detail', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience Section */}
                  <div className="sub-section">
                    <div className="section-title-row">
                      <div className="title-toggle">
                        <input
                          type="checkbox"
                          id="showExp"
                          checked={profile.showExperience}
                          onChange={(e) => updateField('showExperience', e.target.checked)}
                        />
                        <label htmlFor="showExp">Display Experience Section</label>
                      </div>
                      <button type="button" onClick={addExperience} className="add-btn-small">
                        <Plus size={14} /> Add Experience
                      </button>
                    </div>

                    {profile.experiences.map((exp, idx) => (
                      <div key={idx} className="entry-card">
                        <div className="entry-card-header">
                          <strong>{exp.company || 'Company'}</strong>
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="icon-mini danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="form-grid">
                          <div className="form-field">
                            <label>Role</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label>Company / Organization</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label>Period</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => updateExperience(idx, 'period', e.target.value)}
                              placeholder="2026"
                            />
                          </div>
                          <div className="form-field full-width">
                            <label>Details & Impact</label>
                            <input
                              type="text"
                              value={exp.detail}
                              onChange={(e) => updateExperience(idx, 'detail', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Achievements Section */}
                  <div className="sub-section">
                    <div className="section-title-row">
                      <div className="title-toggle">
                        <input
                          type="checkbox"
                          id="showAch"
                          checked={profile.showAchievements}
                          onChange={(e) => updateField('showAchievements', e.target.checked)}
                        />
                        <label htmlFor="showAch">Display Highlights / Achievements</label>
                      </div>
                    </div>

                    <div className="add-item-row">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        placeholder="Add an achievement (e.g. Winner of Smart India Hackathon 2026)..."
                      />
                      <button type="button" onClick={addAchievement} className="add-btn-small">
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    <div className="achievements-list">
                      {profile.achievements.map((ach, idx) => (
                        <div key={idx} className="ach-row">
                          <Award size={16} color="#f59e0b" />
                          <span>{ach}</span>
                          <button
                            type="button"
                            onClick={() => removeAchievement(idx)}
                            className="icon-mini danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: RAW JSON EDITOR */}
              {activeTab === 'json' && (
                <div className="tab-pane">
                  <div className="pane-header with-action">
                    <div>
                      <h2>portfolio-data.json Editor</h2>
                      <p>Direct live view of the underlying JSON file stored on disk.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRawJsonSave}
                      disabled={isSaving}
                      className="add-btn"
                    >
                      <Save size={16} /> Save JSON Directly to Disk
                    </button>
                  </div>

                  {jsonError && (
                    <div className="alert-error">
                      <AlertCircle size={16} />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  <div className="json-editor-wrap">
                    <textarea
                      className="json-textarea"
                      rows={24}
                      value={rawJson}
                      onChange={(e) => {
                        setRawJson(e.target.value);
                        setJsonError('');
                      }}
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: #090d16;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
        }
        .admin-header {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
        }
        .jwt-status-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 5px 12px;
          border-radius: 99px;
        }
        .jwt-status-tag .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .action-btn-outline {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 9px 15px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .action-btn-outline:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }
        .action-btn-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .action-btn-primary:hover {
          background: #1d4ed8;
        }
        .action-btn-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn-danger:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #ffffff;
        }
        .toast-notification {
          position: fixed;
          top: 76px;
          right: 28px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          animation: slideIn 0.3s ease;
        }
        .toast-notification.success {
          background: #065f46;
          color: #a7f3d0;
          border: 1px solid #059669;
        }
        .toast-notification.error {
          background: #991b1b;
          color: #fecaca;
          border: 1px solid #dc2626;
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .admin-body {
          display: grid;
          grid-template-columns: 280px 1fr;
          flex: 1;
        }
        .admin-nav {
          background: #0d1322;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-item:hover {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-item.active {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          font-weight: 600;
        }
        .nav-storage-info {
          margin-top: auto;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 14px;
          font-size: 12px;
        }
        .nav-storage-info .title {
          font-weight: 600;
          color: #cbd5e1;
          margin: 0 0 4px 0;
        }
        .nav-storage-info .path {
          font-family: monospace;
          color: #38bdf8;
          margin: 0 0 6px 0;
          word-break: break-all;
        }
        .nav-storage-info .desc {
          color: #64748b;
          margin: 0;
          font-size: 11px;
        }
        .admin-content {
          padding: 36px 48px;
          max-width: 1040px;
          width: 100%;
          box-sizing: border-box;
        }
        .pane-header {
          margin-bottom: 30px;
        }
        .pane-header.with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pane-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .pane-header p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-field.full-width {
          grid-column: 1 / -1;
        }
        .form-field label {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .form-field input,
        .form-field select,
        .form-field textarea {
          background: #131c2e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #ffffff;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #38bdf8;
        }
        .accent-picker-group {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .preset-colors {
          display: flex;
          gap: 10px;
        }
        .color-chip {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s;
        }
        .color-chip:hover {
          transform: scale(1.1);
        }
        .color-chip.active {
          border-color: #ffffff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        }
        .custom-hex {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .custom-hex input[type='color'] {
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background: none;
        }
        .hex-text {
          width: 90px;
          font-family: monospace;
          text-transform: uppercase;
        }
        .add-item-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .add-item-row input {
          flex: 1;
          background: #131c2e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #ffffff;
          padding: 11px 14px;
          font-size: 14px;
        }
        .add-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .add-btn-small {
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.4);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .skills-tags-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill-tag {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .skill-tag button {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }
        .skill-tag button:hover {
          color: #f87171;
        }
        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .project-card-admin {
          background: rgba(19, 28, 46, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 24px;
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .proj-num {
          font-family: monospace;
          color: #38bdf8;
          font-weight: 600;
          font-size: 14px;
        }
        .proj-title-preview {
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
        }
        .card-controls {
          display: flex;
          gap: 6px;
        }
        .icon-mini {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .icon-mini:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .icon-mini.danger:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .sub-section {
          background: rgba(19, 28, 46, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 24px;
        }
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .title-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 15px;
          color: #f8fafc;
        }
        .title-toggle input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .entry-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 14px;
        }
        .entry-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ach-row {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }
        .ach-row span {
          flex: 1;
        }
        .json-editor-wrap {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
        }
        .json-textarea {
          width: 100%;
          background: #0b1120;
          color: #38bdf8;
          font-family: 'DM Mono', Consolas, 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.6;
          padding: 20px;
          border: none;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
        }
        .loading-profile {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 300px;
          color: #94a3b8;
        }
        @media (max-width: 900px) {
          .admin-body {
            grid-template-columns: 1fr;
          }
          .admin-content {
            padding: 24px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

