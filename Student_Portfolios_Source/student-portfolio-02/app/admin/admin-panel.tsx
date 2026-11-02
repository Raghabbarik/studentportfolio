'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Layers,
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  Mail,
  Palette,
  FileCode,
  Save,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Download,
  Inbox,
  Clock,
  Send
} from 'lucide-react';
import type { Profile } from '../../lib/portfolio';
import type { ContactMessage, PortfolioDataFile } from '../../lib/json-storage';

type Tab = 'Profile' | 'Appearance' | 'Projects' | 'Skills' | 'Journey' | 'Social' | 'Messages' | 'RawJSON';

interface AdminPanelProps {
  initialData: PortfolioDataFile;
  initialAuth: boolean;
  adminEmail: string;
}

export default function AdminPanel({ initialData, initialAuth, adminEmail: defaultAdminEmail }: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string>('');

  // Data State
  const [data, setData] = useState<PortfolioDataFile>(initialData);
  const [profile, setProfile] = useState<Profile>(initialData.profile);
  const [messages, setMessages] = useState<ContactMessage[]>(initialData.messages || []);
  const [revision, setRevision] = useState<number>(initialData.revision || 1);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialData.updatedAt || null);

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(initialData, null, 2));

  // Sync jsonText whenever profile or messages change
  useEffect(() => {
    setJsonText(JSON.stringify({ profile, revision, updatedAt, messages }, null, 2));
  }, [profile, revision, updatedAt, messages]);

  // Handle Unsaved Changes alert
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const result = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(result.error || 'Authentication failed. Please verify credentials.');
      }

      setJwtToken(result.token || '');
      setIsAuthenticated(true);
      showToast('JWT Authentication successful! Welcome, Administrator.');
      
      // Refresh current data from server
      await fetchLatestData(result.token);
    } catch (err: any) {
      setAuthError(err.message || 'Login error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Fetch Latest Data
  const fetchLatestData = async (token?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token || jwtToken) {
        headers['Authorization'] = `Bearer ${token || jwtToken}`;
      }
      const res = await fetch('/api/admin/data', { headers });
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.data) {
          setData(json.data);
          setProfile(json.data.profile);
          setMessages(json.data.messages || []);
          setRevision(json.data.revision);
          setUpdatedAt(json.data.updatedAt);
          setJsonText(JSON.stringify(json.data, null, 2));
          setIsDirty(false);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // 3. Admin Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.warn('Logout call failed:', err);
    }
    setJwtToken('');
    setIsAuthenticated(false);
    showToast('You have been logged out.');
  };

  // 4. Save to JSON file
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: PortfolioDataFile = {
        profile,
        revision,
        updatedAt: new Date().toISOString(),
        messages
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const res = await fetch('/api/admin/data', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const result = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save changes to JSON file.');
      }

      setRevision(result.revision);
      setUpdatedAt(result.updatedAt);
      setIsDirty(false);
      showToast('All portfolio data successfully saved to portfolio-data.json!');
    } catch (err: any) {
      showToast(err.message || 'Error occurred while saving.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to mutate profile fields
  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  // File Upload Helper
  const handleUpload = async (file: File | undefined, onSuccess: (url: string) => void, fieldId: string) => {
    if (!file) return;
    setUploadingField(fieldId);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onSuccess(data.url);
      setIsDirty(true);
      showToast('File uploaded successfully! Click "Save to JSON File" to finalize.');
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  // Raw JSON Editor Handler
  const handleApplyJsonText = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || !parsed.profile) {
        throw new Error('Invalid JSON format: missing root "profile" object.');
      }
      setProfile(parsed.profile);
      if (Array.isArray(parsed.messages)) {
        setMessages(parsed.messages);
      }
      setIsDirty(true);
      showToast('JSON structure validated and applied to form. Remember to save!');
    } catch (err: any) {
      showToast('Invalid JSON syntax: ' + err.message, 'error');
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="admin-body">
        <div className="admin-login-wrap">
          <div className="admin-login-card">
            <div className="admin-login-badge">
              <Lock size={13} />
              JWT Authenticated Portal
            </div>
            <h1>Admin Login</h1>
            <p className="subtitle">
              Sign in with administrative credentials to edit portfolio contents and save directly to <code>portfolio-data.json</code>.
            </p>

            {authError && (
              <div className="admin-toast error" style={{ margin: '0 0 16px' }}>
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="admin-field">
                <label>Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                />
              </div>

              <div className="admin-field">
                <label>Password</label>
                <div className="input-with-action">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-btn-primary" disabled={authLoading}>
                {authLoading ? 'Verifying Credentials & Generating JWT…' : 'Sign In with JWT'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="admin-body">
      {/* Top Navigation Bar */}
      <header className="admin-navbar">
        <a href="/" className="admin-brand" target="_blank" rel="noreferrer">
          <div className="admin-brand-icon">02</div>
          <span>Student 02 Admin Panel</span>
        </a>

        <div className="admin-header-actions">
          <div className={`save-pill ${isDirty ? 'dirty' : 'saved'}`}>
            {isDirty ? (
              <>
                <AlertCircle size={13} />
                Unsaved Changes
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                All Saved to JSON
              </>
            )}
          </div>

          <a href="/" target="_blank" rel="noreferrer" className="admin-btn">
            <ExternalLink size={15} />
            View Live Site
          </a>

          <button
            type="button"
            className="admin-btn accent"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={15} />
            {isSaving ? 'Saving to JSON…' : 'Save to JSON File'}
          </button>

          <button
            type="button"
            className="admin-btn danger"
            onClick={handleLogout}
            title="Log out and revoke JWT session"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <button
            className={`admin-tab-btn ${activeTab === 'Profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('Profile')}
          >
            <User size={16} />
            Profile & Bio
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('Appearance')}
          >
            <Palette size={16} />
            Appearance & Look
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('Projects')}
          >
            <Layers size={16} />
            Projects ({profile.projects.length})
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('Skills')}
          >
            <Sparkles size={16} />
            Skills & Toolkit ({profile.skills.length})
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Journey' ? 'active' : ''}`}
            onClick={() => setActiveTab('Journey')}
          >
            <GraduationCap size={16} />
            Journey & History
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Social' ? 'active' : ''}`}
            onClick={() => setActiveTab('Social')}
          >
            <Mail size={16} />
            Social & Contact
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'Messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('Messages')}
          >
            <Inbox size={16} />
            Visitor Messages
            {messages.length > 0 && <span className="badge-count">{messages.length}</span>}
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'RawJSON' ? 'active' : ''}`}
            onClick={() => setActiveTab('RawJSON')}
          >
            <FileCode size={16} />
            Raw JSON Editor
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--adm-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--adm-sub)', marginBottom: '8px' }}>
              <strong>Admin Session</strong>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{defaultAdminEmail}</div>
              <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle2 size={12} /> JWT HS256 Active
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-main">
          {toastMessage && (
            <div className={`admin-toast ${toastMessage.type}`}>
              {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & BIO */}
          {activeTab === 'Profile' && (
            <div>
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2><User size={18} /> Basic Information</h2>
                    <p>Core student identity visible in header, hero, and introduction bento tiles.</p>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-field">
                    <label>Full Name</label>
                    <input
                      value={profile.name}
                      onChange={e => updateProfile('name', e.target.value)}
                      placeholder="e.g. Student 02"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Role / Professional Title</label>
                    <input
                      value={profile.role}
                      onChange={e => updateProfile('role', e.target.value)}
                      placeholder="e.g. UI / UX Designer & Creative Developer"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Location</label>
                    <input
                      value={profile.location}
                      onChange={e => updateProfile('location', e.target.value)}
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Availability Status Badge</label>
                    <input
                      value={profile.availability}
                      onChange={e => updateProfile('availability', e.target.value)}
                      placeholder="e.g. Open to internships & collaborations"
                    />
                  </div>

                  <div className="admin-field admin-full-width">
                    <label>Hero Headline (Use Enter/Newline to split animated accent lines)</label>
                    <textarea
                      rows={3}
                      value={profile.headline}
                      onChange={e => updateProfile('headline', e.target.value)}
                      placeholder="Line 1&#10;Line 2"
                    />
                  </div>

                  <div className="admin-field admin-full-width">
                    <label>Detailed Biography / About Story</label>
                    <textarea
                      rows={6}
                      value={profile.bio}
                      onChange={e => updateProfile('bio', e.target.value)}
                      placeholder="Share your design philosophy, achievements, and educational focus..."
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Assets */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2><Upload size={18} /> Media & Documents</h2>
                    <p>Profile portrait picture and downloadable PDF résumé.</p>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-field">
                    <label>Profile Picture URL</label>
                    <input
                      value={profile.photo}
                      onChange={e => updateProfile('photo', e.target.value)}
                      placeholder="https://... or upload local image"
                    />
                    <label className="admin-btn" style={{ marginTop: '8px', width: 'fit-content' }}>
                      <Upload size={14} />
                      {uploadingField === 'photo' ? 'Uploading Picture…' : 'Upload Photo (JPG/PNG)'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingField === 'photo'}
                        onChange={e => handleUpload(e.target.files?.[0], url => updateProfile('photo', url), 'photo')}
                      />
                    </label>
                  </div>

                  <div className="admin-field">
                    <label>Résumé / CV Document Link (PDF)</label>
                    <input
                      value={profile.resume}
                      onChange={e => updateProfile('resume', e.target.value)}
                      placeholder="https://... or upload PDF"
                    />
                    <label className="admin-btn" style={{ marginTop: '8px', width: 'fit-content' }}>
                      <Upload size={14} />
                      {uploadingField === 'resume' ? 'Uploading PDF…' : 'Upload Résumé (PDF)'}
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        disabled={uploadingField === 'resume'}
                        onChange={e => handleUpload(e.target.files?.[0], url => updateProfile('resume', url), 'resume')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'Appearance' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2><Palette size={18} /> Theme & Style Customization</h2>
                  <p>Fine-tune colors and headline alignments to customize this portfolio.</p>
                </div>
              </div>

              <div className="admin-field">
                <label>Accent Brand Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                  {[
                    '#9745d8', // Purple / Lavender
                    '#3157eb', // Royal Blue
                    '#c44426', // Terracotta
                    '#00796b', // Teal
                    '#bf3465', // Ruby
                    '#1b637d', // Ocean
                    '#765126', // Amber Bronze
                    '#32633b', // Forest Green
                    '#593ada', // Indigo
                    '#111827'  // Onyx Black
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: profile.accent === color ? '3px solid #fff' : '2px solid transparent',
                        boxShadow: profile.accent === color ? '0 0 0 2px var(--adm-accent)' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => updateProfile('accent', color)}
                      title={color}
                    />
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                    <input
                      type="color"
                      value={profile.accent}
                      onChange={e => updateProfile('accent', e.target.value)}
                      style={{ width: '40px', height: '36px', padding: 0, cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={profile.accent}
                      onChange={e => updateProfile('accent', e.target.value)}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-field" style={{ marginTop: '24px' }}>
                <label>Headline Alignment</label>
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  {(['centered', 'editorial', 'split'] as const).map(layout => (
                    <button
                      key={layout}
                      type="button"
                      className={`admin-btn ${profile.layout === layout ? 'accent' : ''}`}
                      onClick={() => updateProfile('layout', layout)}
                    >
                      {layout === 'centered' ? 'Centered Layout' : layout === 'editorial' ? 'Left Aligned' : 'Right Split'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Box */}
              <div style={{
                marginTop: '30px',
                padding: '24px',
                background: '#fff',
                borderRadius: '16px',
                color: '#292534',
                border: '1px solid #e4e2eb'
              }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: profile.accent, fontWeight: 700 }}>
                  Live Color Preview
                </span>
                <h3 style={{ fontSize: '28px', margin: '10px 0', color: profile.accent, fontWeight: 800 }}>
                  {profile.headline.split('\n')[0] || 'Simple design.'}
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Accent color affects badges, spotlight highlights, interactive buttons, and borders.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'Projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
                  Featured Projects ({profile.projects.length})
                </h2>
                <button
                  type="button"
                  className="admin-btn accent"
                  onClick={() => {
                    const newProj = {
                      title: 'New Innovation Project',
                      category: 'UI / UX Design',
                      description: 'Describe this project, key challenges resolved, and modern technologies leveraged.',
                      url: 'https://github.com',
                      image: '',
                      year: String(new Date().getFullYear())
                    };
                    updateProfile('projects', [newProj, ...profile.projects]);
                  }}
                >
                  <Plus size={15} /> Add New Project
                </button>
              </div>

              {profile.projects.map((proj, idx) => (
                <div key={idx} className="admin-item-card">
                  <div className="admin-item-header">
                    <h3>Project #{idx + 1}: {proj.title || 'Untitled Project'}</h3>
                    <div className="admin-icon-group">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        disabled={idx === 0}
                        onClick={() => {
                          const copy = [...profile.projects];
                          [copy[idx], copy[idx - 1]] = [copy[idx - 1], copy[idx]];
                          updateProfile('projects', copy);
                        }}
                        title="Move Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        disabled={idx === profile.projects.length - 1}
                        onClick={() => {
                          const copy = [...profile.projects];
                          [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
                          updateProfile('projects', copy);
                        }}
                        title="Move Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        onClick={() => {
                          if (confirm(`Delete project "${proj.title}"?`)) {
                            updateProfile('projects', profile.projects.filter((_, i) => i !== idx));
                          }
                        }}
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <div className="admin-field">
                      <label>Project Title</label>
                      <input
                        value={proj.title}
                        onChange={e => {
                          const copy = [...profile.projects];
                          copy[idx] = { ...copy[idx], title: e.target.value };
                          updateProfile('projects', copy);
                        }}
                      />
                    </div>

                    <div className="admin-field">
                      <label>Category (e.g. Web development, UI/UX)</label>
                      <input
                        value={proj.category}
                        onChange={e => {
                          const copy = [...profile.projects];
                          copy[idx] = { ...copy[idx], category: e.target.value };
                          updateProfile('projects', copy);
                        }}
                      />
                    </div>

                    <div className="admin-field">
                      <label>Year Created</label>
                      <input
                        value={proj.year}
                        onChange={e => {
                          const copy = [...profile.projects];
                          copy[idx] = { ...copy[idx], year: e.target.value };
                          updateProfile('projects', copy);
                        }}
                      />
                    </div>

                    <div className="admin-field">
                      <label>Live URL / GitHub Repository</label>
                      <input
                        value={proj.url}
                        placeholder="https://..."
                        onChange={e => {
                          const copy = [...profile.projects];
                          copy[idx] = { ...copy[idx], url: e.target.value };
                          updateProfile('projects', copy);
                        }}
                      />
                    </div>

                    <div className="admin-field admin-full-width">
                      <label>Project Cover Image URL</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          style={{ flex: 1 }}
                          value={proj.image}
                          placeholder="https://... or upload local image"
                          onChange={e => {
                            const copy = [...profile.projects];
                            copy[idx] = { ...copy[idx], image: e.target.value };
                            updateProfile('projects', copy);
                          }}
                        />
                        <label className="admin-btn">
                          <Upload size={14} />
                          {uploadingField === `proj_${idx}` ? 'Uploading…' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={uploadingField === `proj_${idx}`}
                            onChange={e => handleUpload(
                              e.target.files?.[0],
                              url => {
                                const copy = [...profile.projects];
                                copy[idx] = { ...copy[idx], image: url };
                                updateProfile('projects', copy);
                              },
                              `proj_${idx}`
                            )}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="admin-field admin-full-width">
                      <label>Description & Impact</label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        onChange={e => {
                          const copy = [...profile.projects];
                          copy[idx] = { ...copy[idx], description: e.target.value };
                          updateProfile('projects', copy);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SKILLS & TOOLKIT */}
          {activeTab === 'Skills' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2><Sparkles size={18} /> Technical Skills & Tools</h2>
                  <p>Displayed in the Bento Toolkit tile and animated highlights.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="Enter a new skill (e.g. Next.js, Figma, GraphQL)..."
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSkillInput.trim() && !profile.skills.includes(newSkillInput.trim())) {
                        updateProfile('skills', [...profile.skills, newSkillInput.trim()]);
                        setNewSkillInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="admin-btn accent"
                  onClick={() => {
                    if (newSkillInput.trim() && !profile.skills.includes(newSkillInput.trim())) {
                      updateProfile('skills', [...profile.skills, newSkillInput.trim()]);
                      setNewSkillInput('');
                    }
                  }}
                >
                  <Plus size={15} /> Add Skill
                </button>
              </div>

              {/* Skill chips */}
              <label style={{ fontSize: '12px', color: 'var(--adm-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Toolkit ({profile.skills.length})
              </label>
              <div className="skill-tags-list">
                {profile.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => updateProfile('skills', profile.skills.filter((_, i) => i !== sIdx))}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Suggestions */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '12px', color: 'var(--adm-sub)' }}>Quick Add Presets:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {['Figma', 'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Design Systems', 'Python', 'User Research', 'Node.js', 'Wireframing'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className="admin-btn"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      disabled={profile.skills.includes(preset)}
                      onClick={() => updateProfile('skills', [...profile.skills, preset])}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JOURNEY (EDUCATION, EXPERIENCE, ACHIEVEMENTS) */}
          {activeTab === 'Journey' && (
            <div>
              {/* Education */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2><GraduationCap size={18} /> Education History</h2>
                    <p>Degree, university/school, academic period, and coursework details.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={profile.showEducation}
                      onChange={e => updateProfile('showEducation', e.target.checked)}
                    />
                    Display Education on Portfolio
                  </label>
                </div>

                {profile.education.map((edu, eIdx) => (
                  <div key={eIdx} className="admin-item-card">
                    <div className="admin-item-header">
                      <h3>Education #{eIdx + 1}: {edu.degree || 'Degree'}</h3>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        onClick={() => updateProfile('education', profile.education.filter((_, i) => i !== eIdx))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Degree / Qualification</label>
                        <input
                          value={edu.degree}
                          onChange={e => {
                            const copy = [...profile.education];
                            copy[eIdx] = { ...copy[eIdx], degree: e.target.value };
                            updateProfile('education', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Institution / University</label>
                        <input
                          value={edu.school}
                          onChange={e => {
                            const copy = [...profile.education];
                            copy[eIdx] = { ...copy[eIdx], school: e.target.value };
                            updateProfile('education', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Period / Academic Years</label>
                        <input
                          value={edu.period}
                          placeholder="e.g. 2024 — 2028"
                          onChange={e => {
                            const copy = [...profile.education];
                            copy[eIdx] = { ...copy[eIdx], period: e.target.value };
                            updateProfile('education', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Details / Coursework</label>
                        <input
                          value={edu.detail}
                          onChange={e => {
                            const copy = [...profile.education];
                            copy[eIdx] = { ...copy[eIdx], detail: e.target.value };
                            updateProfile('education', copy);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => updateProfile('education', [...profile.education, { school: '', degree: '', period: '', detail: '' }])}
                >
                  <Plus size={14} /> Add Education Entry
                </button>
              </div>

              {/* Experience */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2><Briefcase size={18} /> Professional Experience</h2>
                    <p>Internships, leadership roles, or project work experience.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={profile.showExperience}
                      onChange={e => updateProfile('showExperience', e.target.checked)}
                    />
                    Display Experience on Portfolio
                  </label>
                </div>

                {profile.experiences.map((exp, xIdx) => (
                  <div key={xIdx} className="admin-item-card">
                    <div className="admin-item-header">
                      <h3>Experience #{xIdx + 1}: {exp.role || 'Role'}</h3>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        onClick={() => updateProfile('experiences', profile.experiences.filter((_, i) => i !== xIdx))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Role / Position</label>
                        <input
                          value={exp.role}
                          onChange={e => {
                            const copy = [...profile.experiences];
                            copy[xIdx] = { ...copy[xIdx], role: e.target.value };
                            updateProfile('experiences', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Company / Organization</label>
                        <input
                          value={exp.company}
                          onChange={e => {
                            const copy = [...profile.experiences];
                            copy[xIdx] = { ...copy[xIdx], company: e.target.value };
                            updateProfile('experiences', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Timeline / Period</label>
                        <input
                          value={exp.period}
                          placeholder="e.g. 2026"
                          onChange={e => {
                            const copy = [...profile.experiences];
                            copy[xIdx] = { ...copy[xIdx], period: e.target.value };
                            updateProfile('experiences', copy);
                          }}
                        />
                      </div>

                      <div className="admin-field">
                        <label>Key Responsibilities & Outcomes</label>
                        <input
                          value={exp.detail}
                          onChange={e => {
                            const copy = [...profile.experiences];
                            copy[xIdx] = { ...copy[xIdx], detail: e.target.value };
                            updateProfile('experiences', copy);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => updateProfile('experiences', [...profile.experiences, { company: '', role: '', period: '', detail: '' }])}
                >
                  <Plus size={14} /> Add Experience Entry
                </button>
              </div>

              {/* Achievements */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2><Award size={18} /> Highlights & Certifications</h2>
                    <p>Recognitions, hackathons, and certifications.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={profile.showAchievements}
                      onChange={e => updateProfile('showAchievements', e.target.checked)}
                    />
                    Display Highlights on Portfolio
                  </label>
                </div>

                <div className="admin-field">
                  <label>Achievements (One per line)</label>
                  <textarea
                    rows={5}
                    value={profile.achievements.join('\n')}
                    onChange={e => updateProfile('achievements', e.target.value.split('\n'))}
                    placeholder="Add achievements here, one per line..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SOCIAL & CONTACT */}
          {activeTab === 'Social' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2><Mail size={18} /> Social & Contact Links</h2>
                  <p>Channels where visitors and recruiters can connect with you.</p>
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Public Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => updateProfile('email', e.target.value)}
                    placeholder="student2techxera@gmail.com"
                  />
                </div>

                <div className="admin-field">
                  <label>GitHub Profile URL</label>
                  <input
                    value={profile.github}
                    onChange={e => updateProfile('github', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="admin-field">
                  <label>LinkedIn Profile URL</label>
                  <input
                    value={profile.linkedin}
                    onChange={e => updateProfile('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="admin-field">
                  <label>Instagram URL</label>
                  <input
                    value={profile.instagram}
                    onChange={e => updateProfile('instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VISITOR MESSAGES INBOX */}
          {activeTab === 'Messages' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2><Inbox size={18} /> Contact Inquiries Inbox ({messages.length})</h2>
                  <p>Messages submitted by visitors through the portfolio contact form.</p>
                </div>
                {messages.length > 0 && (
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => {
                      if (confirm('Clear all visitor messages?')) {
                        setMessages([]);
                        setIsDirty(true);
                      }
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--adm-sub)' }}>
                  <Inbox size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No messages received yet. Visitor submissions from the contact form will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {messages.map((msg, mIdx) => (
                    <div key={msg.id || mIdx} className="admin-item-card">
                      <div className="admin-item-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{msg.name}</span>
                          <span style={{ color: 'var(--adm-accent)', fontSize: '13px' }}>&lt;{msg.email}&gt;</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--adm-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {new Date(msg.date).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            className="admin-icon-btn danger"
                            onClick={() => {
                              setMessages(messages.filter((_, i) => i !== mIdx));
                              setIsDirty(true);
                            }}
                            title="Delete message"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: '#eee' }}>
                        Subject: {msg.subject || 'General Inquiry'}
                      </div>

                      <p style={{ margin: 0, color: '#ccc', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {msg.message}
                      </p>

                      <div style={{ marginTop: '12px' }}>
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
                          className="admin-btn"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          <Send size={13} /> Reply via Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: RAW JSON EDITOR */}
          {activeTab === 'RawJSON' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2><FileCode size={18} /> Storage File: <code>data/portfolio-data.json</code></h2>
                  <p>Direct view and editor for the underlying JSON persistence file.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="admin-btn" onClick={handleDownloadJson}>
                    <Download size={14} /> Download Backup (.json)
                  </button>
                  <button type="button" className="admin-btn" onClick={handleApplyJsonText}>
                    <CheckCircle2 size={14} /> Validate & Apply
                  </button>
                </div>
              </div>

              <textarea
                className="json-editor-area"
                value={jsonText}
                onChange={e => {
                  setJsonText(e.target.value);
                  setIsDirty(true);
                }}
                spellCheck={false}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--adm-sub)' }}>
                  File location: <code>data/portfolio-data.json</code> · Revision #{revision} · Last Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'Just now'}
                </span>
                <button
                  type="button"
                  className="admin-btn accent"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save size={14} /> Save JSON Directly to Disk
                </button>
              </div>
            </div>
          )}

          {/* Sticky Bottom Save Bar */}
          {isDirty && (
            <div className="admin-sticky-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} color="#fbbf24" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  You have unsaved changes in your portfolio!
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => fetchLatestData()}
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  className="admin-btn accent"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save size={15} />
                  {isSaving ? 'Saving to JSON…' : 'Save to portfolio-data.json'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

