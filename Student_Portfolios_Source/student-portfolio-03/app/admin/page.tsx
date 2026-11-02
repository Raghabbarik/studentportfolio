'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Key,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Layers,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Paintbrush,
  FileCode,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { Profile } from '../../lib/portfolio';
import './admin.css';

type AdminTab = 'profile' | 'projects' | 'skills' | 'journey' | 'appearance' | 'json';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  // Dashboard state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rawJson, setRawJson] = useState('');
  const [rawJsonError, setRawJsonError] = useState('');
  const [currentTab, setCurrentTab] = useState<AdminTab>('profile');
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [jsonCopied, setJsonCopied] = useState(false);

  // Check existing authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = localStorage.getItem('admin_jwt_token');
        const res = await fetch('/api/admin/auth', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
        });
        const data = (await res.json()) as any;
        if (res.ok && data.authenticated) {
          setToken(storedToken || 'cookie-session');
          await loadPortfolioData();
        } else {
          setToken(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setToken(null);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch portfolio data from JSON storage endpoint
  const loadPortfolioData = useCallback(async () => {
    try {
      const res = await fetch('/__api/json-store');
      if (res.ok) {
        const data = (await res.json()) as Profile;
        setProfile(data);
        setRawJson(JSON.stringify(data, null, 2));
      } else {
        // Fallback to /api/profile
        const fallback = await fetch('/api/profile');
        const fbData = (await fallback.json()) as any;
        if (fbData.profile) {
          setProfile(fbData.profile as Profile);
          setRawJson(JSON.stringify(fbData.profile, null, 2));
        }
      }
    } catch (e) {
      console.error('Error loading portfolio JSON:', e);
    }
  }, []);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Save token to localStorage for Authorization headers
      if (data.token) {
        localStorage.setItem('admin_jwt_token', data.token);
        setToken(data.token);
      } else {
        setToken('session-active');
      }

      await loadPortfolioData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginBusy(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    localStorage.removeItem('admin_jwt_token');
    setToken(null);
  };

  // Update field in profile state
  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    if (!profile) return;
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    setRawJson(JSON.stringify(updated, null, 2));
    setSaveNotice('');
  };

  // Save all changes to .json file and sync database
  const handleSaveAll = async () => {
    if (!profile) return;
    setSaveBusy(true);
    setSaveError('');
    setSaveNotice('');

    try {
      // 1. Write to data/portfolio-data.json via Vite Node middleware if available
      let savedLocally = false;
      try {
        const jsonRes = await fetch('/__api/json-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        if (jsonRes.ok) {
          const jsonResult = (await jsonRes.json()) as any;
          if (jsonResult.success) savedLocally = true;
        }
      } catch {
        // Ignored on production deployments
      }

      // 2. Also sync to database via authenticated admin save route
      const authToken = localStorage.getItem('admin_jwt_token');
      const saveRes = await fetch('/api/admin/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ profile })
      });
      const saveResult = (await saveRes.json()) as any;
      if (!saveRes.ok && !savedLocally) {
        throw new Error(saveResult.error || 'Failed to save to portfolio-data.json');
      }

      setSaveNotice(
        `All changes saved to data/portfolio-data.json at ${new Date().toLocaleTimeString()}!`
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save operation failed');
    } finally {
      setSaveBusy(false);
    }
  };

  // Handle Raw JSON edit and sync
  const handleRawJsonChange = (val: string) => {
    setRawJson(val);
    setRawJsonError('');
    try {
      const parsed = JSON.parse(val) as Profile;
      setProfile(parsed);
    } catch (err) {
      setRawJsonError(err instanceof Error ? err.message : 'Invalid JSON syntax');
    }
  };

  // Copy raw JSON
  const copyRawJson = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setJsonCopied(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Verifying JWT credentials...</p>
      </div>
    );
  }

  // ─── LOGIN SCREEN ───
  if (!token) {
    return (
      <div className="admin-auth-page">
        <div className="admin-login-card">
          <div className="admin-login-badge">
            <Shield size={18} className="shield-icon" />
            <span>PORTFOLIO ADMIN CONSOLE</span>
          </div>

          <h1 className="admin-login-title">Admin Authentication</h1>
          <p className="admin-login-desc">
            Sign in with JWT tokenization to manage portfolio content and JSON storage.
          </p>

          {loginError && (
            <div className="admin-notice error" role="alert">
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-field-group">
              <label htmlFor="admin-email">Admin Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label htmlFor="admin-pass">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loginBusy}
            >
              {loginBusy ? (
                <>
                  <RefreshCw size={18} className="spin-icon" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Sign In with JWT</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/" className="return-link">
              ← Return to Public Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADMIN DASHBOARD SCREEN ───
  return (
    <div className="admin-dashboard-page">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="topbar-left">
            <a href="/admin" className="admin-brand">
              <span className="brand-dot" />
              <span>folio // admin console</span>
            </a>
            <div className="jwt-active-badge">
              <span className="jwt-dot" />
              <span>JWT: Active</span>
              <span className="jwt-user">student3techxera@gmail.com</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="storage-badge">
              <FileCode size={14} />
              <span>Storage: data/portfolio-data.json</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="topbar-action-btn view-site"
            >
              <Eye size={15} />
              <span>View Website</span>
              <ArrowUpRight size={14} />
            </a>

            <button
              type="button"
              className="topbar-action-btn save-btn"
              disabled={saveBusy}
              onClick={handleSaveAll}
            >
              {saveBusy ? (
                <>
                  <RefreshCw size={15} className="spin-icon" />
                  <span>Saving to JSON...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save All to JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="topbar-action-btn logout-btn"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="admin-main-wrap">
        {/* Toast Notices */}
        {saveNotice && (
          <div className="admin-toast success" role="status">
            <CheckCircle2 size={18} />
            <span>{saveNotice}</span>
          </div>
        )}
        {saveError && (
          <div className="admin-toast error" role="alert">
            <AlertCircle size={18} />
            <span>{saveError}</span>
          </div>
        )}

        <div className="admin-content-layout">
          {/* Sidebar Navigation */}
          <aside className="admin-sidebar">
            <nav className="admin-nav-tabs">
              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentTab('profile')}
              >
                <User size={18} />
                <span>Profile & Identity</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'projects' ? 'active' : ''}`}
                onClick={() => setCurrentTab('projects')}
              >
                <Layers size={18} />
                <span>Projects Showcase</span>
                <span className="count-tag">{profile?.projects?.length || 0}</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'skills' ? 'active' : ''}`}
                onClick={() => setCurrentTab('skills')}
              >
                <FileCode size={18} />
                <span>Technical Toolkit</span>
                <span className="count-tag">{profile?.skills?.length || 0}</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'journey' ? 'active' : ''}`}
                onClick={() => setCurrentTab('journey')}
              >
                <Briefcase size={18} />
                <span>Experience & Education</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setCurrentTab('appearance')}
              >
                <Paintbrush size={18} />
                <span>Appearance & Accent</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${currentTab === 'json' ? 'active' : ''}`}
                onClick={() => setCurrentTab('json')}
              >
                <FileCode size={18} />
                <span>Raw JSON Editor</span>
              </button>
            </nav>

            <div className="admin-sidebar-footer">
              <div className="json-save-reminder">
                <span className="reminder-title">JSON File Persistence</span>
                <p>
                  Every save automatically updates <code>data/portfolio-data.json</code> on disk.
                </p>
                <button
                  type="button"
                  className="quick-save-btn"
                  onClick={handleSaveAll}
                  disabled={saveBusy}
                >
                  <Save size={14} />
                  <span>Save to File Now</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Tab Content Panel */}
          <main className="admin-tab-body">
            {profile && (
              <>
                {/* ─── TAB 1: PROFILE & IDENTITY ─── */}
                {currentTab === 'profile' && (
                  <div className="tab-pane">
                    <div className="pane-header">
                      <h2>Personal & Professional Identity</h2>
                      <p>Update personal information, headings, bio, and social handles.</p>
                    </div>

                    <div className="admin-form-grid">
                      <div className="form-row-2">
                        <label className="admin-input-label">
                          <span>Full Name</span>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => updateField('name', e.target.value)}
                          />
                        </label>

                        <label className="admin-input-label">
                          <span>Role & Specialization</span>
                          <input
                            type="text"
                            value={profile.role}
                            onChange={(e) => updateField('role', e.target.value)}
                          />
                        </label>
                      </div>

                      <label className="admin-input-label full">
                        <span>Main Headline (supports newline for staggered accent)</span>
                        <textarea
                          rows={2}
                          value={profile.headline}
                          onChange={(e) => updateField('headline', e.target.value)}
                        />
                      </label>

                      <label className="admin-input-label full">
                        <span>Professional Biography</span>
                        <textarea
                          rows={6}
                          value={profile.bio}
                          onChange={(e) => updateField('bio', e.target.value)}
                        />
                      </label>

                      <div className="form-row-2">
                        <label className="admin-input-label">
                          <span>Location</span>
                          <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => updateField('location', e.target.value)}
                          />
                        </label>

                        <label className="admin-input-label">
                          <span>Availability Status</span>
                          <input
                            type="text"
                            value={profile.availability}
                            onChange={(e) => updateField('availability', e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="form-row-2">
                        <label className="admin-input-label">
                          <span>Contact Email</span>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => updateField('email', e.target.value)}
                          />
                        </label>

                        <label className="admin-input-label">
                          <span>GitHub URL</span>
                          <input
                            type="url"
                            value={profile.github}
                            onChange={(e) => updateField('github', e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="form-row-2">
                        <label className="admin-input-label">
                          <span>LinkedIn URL</span>
                          <input
                            type="url"
                            value={profile.linkedin}
                            onChange={(e) => updateField('linkedin', e.target.value)}
                          />
                        </label>

                        <label className="admin-input-label">
                          <span>Instagram / Portfolio Link</span>
                          <input
                            type="url"
                            value={profile.instagram}
                            onChange={(e) => updateField('instagram', e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="form-row-2">
                        <label className="admin-input-label">
                          <span>Photo URL (or /api/media/ link)</span>
                          <input
                            type="text"
                            value={profile.photo}
                            onChange={(e) => updateField('photo', e.target.value)}
                            placeholder="Leave empty for elegant SVG monogram"
                          />
                        </label>

                        <label className="admin-input-label">
                          <span>Résumé PDF URL (or /api/media/ link)</span>
                          <input
                            type="text"
                            value={profile.resume}
                            onChange={(e) => updateField('resume', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: PROJECTS SHOWCASE ─── */}
                {currentTab === 'projects' && (
                  <div className="tab-pane">
                    <div className="pane-header flex-between">
                      <div>
                        <h2>Selected Projects ({profile.projects.length})</h2>
                        <p>Add, edit, reorder, or delete project case studies stored in JSON.</p>
                      </div>
                      <button
                        type="button"
                        className="admin-btn primary"
                        onClick={() => {
                          const newProj = {
                            title: 'New Project Title',
                            category: 'Full-Stack Application',
                            description: 'Comprehensive project description and architecture overview.',
                            url: 'https://github.com/malliksatyam46',
                            image: '',
                            year: String(new Date().getFullYear())
                          };
                          updateField('projects', [...profile.projects, newProj]);
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div className="projects-editor-list">
                      {profile.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="project-editor-card">
                          <div className="card-top-bar">
                            <span className="card-index-pill">Project #{pIdx + 1}</span>
                            <div className="card-actions-group">
                              <button
                                type="button"
                                className="icon-btn"
                                title="Move Up"
                                disabled={pIdx === 0}
                                onClick={() => {
                                  const list = [...profile.projects];
                                  [list[pIdx], list[pIdx - 1]] = [list[pIdx - 1], list[pIdx]];
                                  updateField('projects', list);
                                }}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                title="Move Down"
                                disabled={pIdx === profile.projects.length - 1}
                                onClick={() => {
                                  const list = [...profile.projects];
                                  [list[pIdx], list[pIdx + 1]] = [list[pIdx + 1], list[pIdx]];
                                  updateField('projects', list);
                                }}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                title="Delete Project"
                                onClick={() => {
                                  updateField(
                                    'projects',
                                    profile.projects.filter((_, i) => i !== pIdx)
                                  );
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="form-row-2">
                            <label className="admin-input-label">
                              <span>Title</span>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const list = [...profile.projects];
                                  list[pIdx] = { ...list[pIdx], title: e.target.value };
                                  updateField('projects', list);
                                }}
                              />
                            </label>

                            <label className="admin-input-label">
                              <span>Category</span>
                              <input
                                type="text"
                                value={proj.category}
                                onChange={(e) => {
                                  const list = [...profile.projects];
                                  list[pIdx] = { ...list[pIdx], category: e.target.value };
                                  updateField('projects', list);
                                }}
                              />
                            </label>
                          </div>

                          <div className="form-row-2">
                            <label className="admin-input-label">
                              <span>Year</span>
                              <input
                                type="text"
                                value={proj.year}
                                onChange={(e) => {
                                  const list = [...profile.projects];
                                  list[pIdx] = { ...list[pIdx], year: e.target.value };
                                  updateField('projects', list);
                                }}
                              />
                            </label>

                            <label className="admin-input-label">
                              <span>Live Demo / Repository URL</span>
                              <input
                                type="text"
                                value={proj.url}
                                onChange={(e) => {
                                  const list = [...profile.projects];
                                  list[pIdx] = { ...list[pIdx], url: e.target.value };
                                  updateField('projects', list);
                                }}
                              />
                            </label>
                          </div>

                          <label className="admin-input-label full">
                            <span>Image URL (or leave empty for generated Swiss architecture art)</span>
                            <input
                              type="text"
                              value={proj.image}
                              onChange={(e) => {
                                const list = [...profile.projects];
                                list[pIdx] = { ...list[pIdx], image: e.target.value };
                                updateField('projects', list);
                              }}
                            />
                          </label>

                          <label className="admin-input-label full">
                            <span>Description</span>
                            <textarea
                              rows={3}
                              value={proj.description}
                              onChange={(e) => {
                                const list = [...profile.projects];
                                list[pIdx] = { ...list[pIdx], description: e.target.value };
                                updateField('projects', list);
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: TECHNICAL TOOLKIT ─── */}
                {currentTab === 'skills' && (
                  <div className="tab-pane">
                    <div className="pane-header">
                      <h2>Technical Skills</h2>
                      <p>Enter your core skills (one per line). These are mapped across the portfolio.</p>
                    </div>

                    <label className="admin-input-label full">
                      <span>Skills (one per line)</span>
                      <textarea
                        rows={12}
                        value={profile.skills.join('\n')}
                        onChange={(e) =>
                          updateField(
                            'skills',
                            e.target.value.split('\n').filter((s) => s.trim().length > 0)
                          )
                        }
                      />
                    </label>

                    <div className="skills-preview-tags">
                      <span className="tags-label">LIVE SKILLS CHIPS ({profile.skills.length})</span>
                      <div className="tags-flex">
                        {profile.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="admin-skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: EXPERIENCE & EDUCATION ─── */}
                {currentTab === 'journey' && (
                  <div className="tab-pane">
                    <div className="pane-header">
                      <h2>Experience & Education</h2>
                      <p>Manage timeline records and toggle section visibility.</p>
                    </div>

                    {/* Experience Section */}
                    <div className="journey-block">
                      <div className="journey-block-header">
                        <div className="header-left">
                          <Briefcase size={20} />
                          <h3>Work Experience</h3>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.showExperience}
                            onChange={(e) => updateField('showExperience', e.target.checked)}
                          />
                          <span>Show on portfolio</span>
                        </label>
                      </div>

                      <div className="items-list">
                        {profile.experiences.map((exp, eIdx) => (
                          <div key={eIdx} className="journey-item-card">
                            <div className="card-top-bar">
                              <span>Experience #{eIdx + 1}</span>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => {
                                  updateField(
                                    'experiences',
                                    profile.experiences.filter((_, i) => i !== eIdx)
                                  );
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="form-row-2">
                              <label className="admin-input-label">
                                <span>Role Title</span>
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => {
                                    const list = [...profile.experiences];
                                    list[eIdx] = { ...list[eIdx], role: e.target.value };
                                    updateField('experiences', list);
                                  }}
                                />
                              </label>

                              <label className="admin-input-label">
                                <span>Company / Organization</span>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => {
                                    const list = [...profile.experiences];
                                    list[eIdx] = { ...list[eIdx], company: e.target.value };
                                    updateField('experiences', list);
                                  }}
                                />
                              </label>
                            </div>

                            <label className="admin-input-label full">
                              <span>Period (e.g. 2025 — Present)</span>
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => {
                                  const list = [...profile.experiences];
                                  list[eIdx] = { ...list[eIdx], period: e.target.value };
                                  updateField('experiences', list);
                                }}
                              />
                            </label>

                            <label className="admin-input-label full">
                              <span>Responsibilities & Learnings</span>
                              <textarea
                                rows={2}
                                value={exp.detail}
                                onChange={(e) => {
                                  const list = [...profile.experiences];
                                  list[eIdx] = { ...list[eIdx], detail: e.target.value };
                                  updateField('experiences', list);
                                }}
                              />
                            </label>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="admin-btn secondary"
                          onClick={() => {
                            const newExp = {
                              company: 'Organization Name',
                              role: 'Role Title',
                              period: '2025 — Present',
                              detail: 'Describe contributions, technologies used, and outcomes.'
                            };
                            updateField('experiences', [...profile.experiences, newExp]);
                          }}
                        >
                          <Plus size={16} />
                          <span>Add Experience Item</span>
                        </button>
                      </div>
                    </div>

                    {/* Education Section */}
                    <div className="journey-block">
                      <div className="journey-block-header">
                        <div className="header-left">
                          <GraduationCap size={20} />
                          <h3>Education</h3>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.showEducation}
                            onChange={(e) => updateField('showEducation', e.target.checked)}
                          />
                          <span>Show on portfolio</span>
                        </label>
                      </div>

                      <div className="items-list">
                        {profile.education.map((edu, edIdx) => (
                          <div key={edIdx} className="journey-item-card">
                            <div className="card-top-bar">
                              <span>Education #{edIdx + 1}</span>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => {
                                  updateField(
                                    'education',
                                    profile.education.filter((_, i) => i !== edIdx)
                                  );
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="form-row-2">
                              <label className="admin-input-label">
                                <span>Degree / Course</span>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const list = [...profile.education];
                                    list[edIdx] = { ...list[edIdx], degree: e.target.value };
                                    updateField('education', list);
                                  }}
                                />
                              </label>

                              <label className="admin-input-label">
                                <span>University / School</span>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => {
                                    const list = [...profile.education];
                                    list[edIdx] = { ...list[edIdx], school: e.target.value };
                                    updateField('education', list);
                                  }}
                                />
                              </label>
                            </div>

                            <label className="admin-input-label full">
                              <span>Period (e.g. 2024 — 2028)</span>
                              <input
                                type="text"
                                value={edu.period}
                                onChange={(e) => {
                                  const list = [...profile.education];
                                  list[edIdx] = { ...list[edIdx], period: e.target.value };
                                  updateField('education', list);
                                }}
                              />
                            </label>

                            <label className="admin-input-label full">
                              <span>Academic Details & Specialization</span>
                              <textarea
                                rows={2}
                                value={edu.detail}
                                onChange={(e) => {
                                  const list = [...profile.education];
                                  list[edIdx] = { ...list[edIdx], detail: e.target.value };
                                  updateField('education', list);
                                }}
                              />
                            </label>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="admin-btn secondary"
                          onClick={() => {
                            const newEdu = {
                              school: 'University Name',
                              degree: 'Degree Title',
                              period: '2024 — 2028',
                              detail: 'Specialization, relevant coursework, and honors.'
                            };
                            updateField('education', [...profile.education, newEdu]);
                          }}
                        >
                          <Plus size={16} />
                          <span>Add Education Item</span>
                        </button>
                      </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="journey-block">
                      <div className="journey-block-header">
                        <div className="header-left">
                          <Award size={20} />
                          <h3>Honors & Achievements</h3>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.showAchievements}
                            onChange={(e) => updateField('showAchievements', e.target.checked)}
                          />
                          <span>Show on portfolio</span>
                        </label>
                      </div>

                      <label className="admin-input-label full">
                        <span>Achievements (one per line)</span>
                        <textarea
                          rows={6}
                          value={profile.achievements.join('\n')}
                          onChange={(e) =>
                            updateField(
                              'achievements',
                              e.target.value.split('\n').filter((s) => s.trim().length > 0)
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* ─── TAB 5: APPEARANCE & ACCENT ─── */}
                {currentTab === 'appearance' && (
                  <div className="tab-pane">
                    <div className="pane-header">
                      <h2>Appearance & Design Tokens</h2>
                      <p>Select your portfolio accent color and headline alignment.</p>
                    </div>

                    <div className="appearance-group">
                      <span className="appearance-label">Accent Color</span>
                      <p className="appearance-help">
                        Selected color applies to buttons, badges, highlights, and geometric illustrations.
                      </p>

                      <div className="swatches-row">
                        {[
                          '#CC482A',
                          '#3157eb',
                          '#00796b',
                          '#9745d8',
                          '#bf3465',
                          '#1b637d',
                          '#765126',
                          '#32633b',
                          '#191919'
                        ].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            className={`swatch-btn ${profile.accent === hex ? 'active' : ''}`}
                            style={{ background: hex }}
                            onClick={() => updateField('accent', hex)}
                            aria-label={`Select ${hex}`}
                          />
                        ))}
                        <label className="custom-hex-box">
                          <span>Custom:</span>
                          <input
                            type="color"
                            value={profile.accent}
                            onChange={(e) => updateField('accent', e.target.value)}
                          />
                          <code>{profile.accent}</code>
                        </label>
                      </div>
                    </div>

                    <div className="appearance-group">
                      <span className="appearance-label">Headline Alignment</span>
                      <div className="layout-choice-row">
                        {(['editorial', 'centered', 'split'] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            className={`layout-btn ${profile.layout === l ? 'active' : ''}`}
                            onClick={() => updateField('layout', l)}
                          >
                            <strong>{{ editorial: 'Left / Editorial', centered: 'Centered', split: 'Right-Aligned' }[l]}</strong>
                            <small>Swiss Grid alignment mode</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 6: RAW JSON STORAGE EDITOR ─── */}
                {currentTab === 'json' && (
                  <div className="tab-pane">
                    <div className="pane-header flex-between">
                      <div>
                        <h2>Raw JSON File Editor (data/portfolio-data.json)</h2>
                        <p>Directly inspect, edit, or copy the entire JSON data store.</p>
                      </div>
                      <div className="json-btn-group">
                        <button
                          type="button"
                          className="admin-btn secondary"
                          onClick={copyRawJson}
                        >
                          {jsonCopied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{jsonCopied ? 'Copied!' : 'Copy JSON'}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn primary"
                          disabled={!!rawJsonError || saveBusy}
                          onClick={handleSaveAll}
                        >
                          <Save size={16} />
                          <span>Save Raw JSON</span>
                        </button>
                      </div>
                    </div>

                    {rawJsonError && (
                      <div className="admin-notice error">
                        <AlertCircle size={18} />
                        <span>{rawJsonError}</span>
                      </div>
                    )}

                    <div className="raw-json-wrap">
                      <textarea
                        className="raw-json-textarea"
                        rows={28}
                        value={rawJson}
                        onChange={(e) => handleRawJsonChange(e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

