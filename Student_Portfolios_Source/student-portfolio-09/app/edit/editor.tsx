'use client';
import { useEffect, useState, type ReactNode } from 'react';
import {
  User, Layers, GraduationCap, Paintbrush, Shield, Save, Eye, Plus, Trash2,
  Upload, Briefcase, Award, CheckCircle2, LogOut, X, ChevronUp, ChevronDown,
  Palette, Link2, Image as ImageIcon, ArrowUpRight, Settings, LayoutGrid,
  Download, RefreshCw, EyeOff, Key
} from 'lucide-react';
import type { Profile } from '../../lib/portfolio';
import Portfolio from '../portfolio-view';
import RubberSegment from '../../components/ui/rubber-segment';

type Tab = 'Profile' | 'Projects' | 'Journey' | 'Appearance' | 'Settings' | 'Access';

/* ── Small status badge ── */
function StatusBadge({ dirty }: { dirty: boolean }) {
  return (
    <span className="adm-status" data-dirty={dirty}>
      <span className="adm-status-dot" />
      {dirty ? 'Unsaved changes' : 'All saved'}
    </span>
  );
}

/* ── Section wrapper ── */
function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="adm-section">
      <div className="adm-section-head">
        {icon}<h3>{title}</h3>
      </div>
      <div className="adm-section-body">{children}</div>
    </div>
  );
}

/* ── Main editor ── */
export default function Editor({
  initial, initialRevision, owner, userEmail, assignedEmail
}: {
  initial: Profile; initialRevision: number; owner: boolean; userEmail: string; assignedEmail: string;
}) {
  const [p, setP] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [tab, setTab] = useState<Tab>('Profile');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [email, setEmail] = useState(assignedEmail);
  const [accessBusy, setAccessBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const [accessDirty, setAccessDirty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminLoginEmail, setAdminLoginEmail] = useState(userEmail || 'student9techxera@gmail.com');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsNotice, setCredsNotice] = useState('');
  const [credsError, setCredsError] = useState('');

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch { }
    window.location.href = '/admin';
  }

  async function updateCredentials() {
    const cleanEmail = adminLoginEmail.trim();
    const cleanPass = adminLoginPass.trim();
    const cleanConfirm = adminConfirmPass.trim();

    if (!cleanEmail) {
      setCredsError('Please enter an admin email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setCredsError('Please enter a valid email format.');
      return;
    }
    if (cleanPass && cleanPass.length < 4) {
      setCredsError('New password must be at least 4 characters long.');
      return;
    }
    if (cleanPass && cleanPass !== cleanConfirm) {
      setCredsError('New password and confirm password do not match.');
      return;
    }

    setSavingCreds(true);
    setCredsNotice('');
    setCredsError('');
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPass || undefined
        })
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update credentials.');
      setCredsNotice('Admin email and password updated successfully! Persisted in database and code store.');
      setAdminLoginPass('');
      setAdminConfirmPass('');
    } catch (e) {
      setCredsError(e instanceof Error ? e.message : 'Unable to update credentials.');
    } finally {
      setSavingCreds(false);
    }
  }

  function exportBackup() {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: p,
      revision
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Portfolio backup downloaded successfully!');
  }

  function importBackup(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.profile && parsed.profile.name) {
          setP(parsed.profile);
          setDirty(true);
          setNotice('Backup data loaded! Click "Save changes" at the top to commit it.');
        } else if (parsed.name) {
          setP(parsed);
          setDirty(true);
          setNotice('Backup data loaded! Click "Save changes" at the top to commit it.');
        } else {
          setError('Invalid backup file format.');
        }
      } catch {
        setError('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  }

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty || accessDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [dirty, accessDirty]);

  function change<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP(old => ({ ...old, [key]: value }));
    setDirty(true); setNotice('');
  }

  async function save() {
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: p, revision })
      });
      const data = await res.json() as { error?: string; revision: number };
      if (!res.ok) throw new Error(data.error || 'Unable to save.');
      setRevision(data.revision);
      setDirty(false);
      setNotice('Portfolio saved successfully!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function access() {
    setAccessBusy(true); setError(''); setNotice('');
    try {
      const res = await fetch('/api/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Unable to save access.');
      setNotice(email ? 'Student access saved.' : 'Student access removed.');
      setAccessDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save access.');
    } finally {
      setAccessBusy(false);
    }
  }

  async function upload(file: File | undefined, assign: (url: string) => void, key: string) {
    if (!file) return;
    setUploading(key); setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json() as { error?: string; url: string };
      if (!res.ok) throw new Error(result.error || 'Upload failed.');
      assign(result.url);
      setNotice('Uploaded! Save to apply.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading('');
    }
  }

  function field(label: string, key: keyof Profile, multiline = false, placeholder = '') {
    return (
      <label className="adm-field">
        <span className="adm-label">{label}</span>
        {multiline
          ? (
            <textarea
              rows={key === 'bio' ? 7 : 3}
              value={String(p[key])}
              placeholder={placeholder}
              onChange={e => change(key, e.target.value as never)}
            />
          ) : (
            <input
              value={String(p[key])}
              placeholder={placeholder}
              onChange={e => change(key, e.target.value as never)}
            />
          )}
      </label>
    );
  }

  function uploadField(label: string, key: 'photo' | 'resume') {
    const isPhoto = key === 'photo';
    return (
      <div className="adm-upload-block">
        {field(label + ' URL', key, false, 'https://...')}
        <label className="adm-upload-btn">
          <Upload size={15} />
          {uploading === key ? 'Uploading…' : 'Upload ' + label.toLowerCase()}
          <input
            type="file"
            accept={isPhoto ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
            disabled={!!uploading}
            onChange={e => upload(e.target.files?.[0], url => change(key, url), key)}
          />
        </label>
        <span className="adm-upload-hint">{isPhoto ? 'JPG, PNG, WebP' : 'PDF'} · max 5 MB</span>
      </div>
    );
  }

  const tabs: { name: Tab; icon: ReactNode; label: string }[] = [
    { name: 'Profile', icon: <User size={16} />, label: 'Profile' },
    { name: 'Projects', icon: <LayoutGrid size={16} />, label: 'Projects' },
    { name: 'Journey', icon: <GraduationCap size={16} />, label: 'Journey' },
    { name: 'Appearance', icon: <Paintbrush size={16} />, label: 'Look' },
    { name: 'Settings', icon: <Settings size={16} />, label: 'Settings' },
  ];

  const initials = p.name.split(' ').map(x => x[0]).filter(Boolean).slice(0, 2).join('');

  return (
    <div className="adm-shell">

      {/* ── Top bar ── */}
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          <button className="adm-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            ☰
          </button>
          <a href="/" className="adm-logo">
            <span>Portfolio</span>
          </a>
          <StatusBadge dirty={dirty} />
        </div>
        <div className="adm-topbar-right">
          <a href="/" target="_blank" rel="noreferrer" className="adm-topbar-btn adm-btn-ghost play-rubber-btn">
            <Eye size={15} /> View site
          </a>
          <RubberSegment
            items={[
              { value: 'editor', label: 'Editor' },
              { value: 'preview', label: 'Preview' }
            ]}
            value={preview ? 'preview' : 'editor'}
            onChange={(val) => setPreview(val === 'preview')}
            size="sm"
            trackColor="#E2E8F0"
            thumbColor="#FFFFFF"
            textColor="#64748B"
            activeTextColor="#0F172A"
            radius={8}
            inset={2}
            speed={1}
            stretch={95}
            squash={3}
            draggable={true}
            aria-label="Toggle editor and preview mode"
          />
          <button
            className="adm-topbar-btn adm-btn-primary play-rubber-btn"
            disabled={busy || !!uploading}
            onClick={save}
          >
            <Save size={15} />
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      <div className="adm-body">

        {/* ── Sidebar ── */}
        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="adm-avatar" style={{ background: p.accent }}>
            {initials}
          </div>
          <div className="adm-user-info">
            <strong>{p.name}</strong>
            <span>{owner ? 'Portfolio owner' : 'Student editor'}</span>
          </div>

          <nav className="adm-nav">
            {tabs.map(t => (
              <button
                key={t.name}
                className={`adm-nav-item${tab === t.name ? ' active' : ''}`}
                onClick={() => { setTab(t.name); setPreview(false); }}
              >
                {t.icon}
                <span>{t.label}</span>
                {tab === t.name && <span className="adm-nav-indicator" />}
              </button>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <span className="adm-user-email">{userEmail}</span>
            <button
              type="button"
              className="adm-sidebar-link danger"
              onClick={handleLogout}
              title="Sign out of Admin Panel"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="adm-main">

          {/* Notices */}
          {notice && (
            <div className="adm-notice success">
              <CheckCircle2 size={16} />
              {notice}
              <button onClick={() => setNotice('')}><X size={14} /></button>
            </div>
          )}
          {error && (
            <div className="adm-notice error">
              ⚠ {error}
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}

          {/* Preview */}
          {preview ? (
            <div className="adm-preview-wrap">
              <div className="adm-preview-banner">
                <Eye size={14} /> Draft preview — save to update your website
              </div>
              <div className="adm-preview-frame">
                <Portfolio profile={p} preview />
              </div>
            </div>
          ) : (
            <div className="adm-content">

              {/* Page header */}
              <div className="adm-page-head">
                <div>
                  <p className="adm-breadcrumb">
                    {tab === 'Profile' ? 'Personal information' :
                      tab === 'Projects' ? 'Your work' :
                        tab === 'Journey' ? 'Education & experience' :
                          tab === 'Appearance' ? 'Design & style' : 'Student access'}
                  </p>
                  <h1>
                    {tab === 'Profile' ? 'Make it personal.' :
                      tab === 'Projects' ? 'Show what you\'ve built.' :
                        tab === 'Journey' ? 'Tell your story.' :
                          tab === 'Appearance' ? 'Find your look.' : 'Access control.'}
                  </h1>
                </div>
                <button
                  className="adm-save-fab"
                  disabled={!dirty || busy}
                  onClick={save}
                >
                  <Save size={16} /> {busy ? 'Saving…' : 'Save'}
                </button>
              </div>

              {/* ─ PROFILE ─ */}
              {tab === 'Profile' && <>
                <Section title="Introduction" icon={<User size={16} />}>
                  <div className="adm-grid-2">
                    {field('Full name', 'name')}
                    {field('Role / title', 'role')}
                    <div className="adm-col-span-2">
                      {field('Headline (use a new line for accent)', 'headline', true)}
                    </div>
                    <div className="adm-col-span-2">
                      {field('About you', 'bio', true)}
                    </div>
                    {field('Location', 'location')}
                    {field('Availability status', 'availability')}
                  </div>
                </Section>

                <Section title="Photo & Résumé" icon={<ImageIcon size={16} />}>
                  <div className="adm-grid-2">
                    {uploadField('Photo', 'photo')}
                    {uploadField('Résumé', 'resume')}
                  </div>
                </Section>

                <Section title="Links & Contact" icon={<Link2 size={16} />}>
                  <div className="adm-grid-2">
                    {field('Contact email', 'email')}
                    {field('GitHub URL', 'github')}
                    {field('LinkedIn URL', 'linkedin')}
                    {field('Instagram URL', 'instagram')}
                  </div>
                </Section>

                <Section title="Skills" icon={<Settings size={16} />}>
                  <label className="adm-field adm-col-span-2">
                    <span className="adm-label">Skills (one per line)</span>
                    <textarea
                      rows={8}
                      value={p.skills.join('\n')}
                      onChange={e => change('skills', e.target.value.split('\n'))}
                    />
                  </label>
                  <div className="adm-skills-preview">
                    {p.skills.filter(Boolean).map((s, i) => (
                      <span key={i} className="adm-skill-tag">{s}</span>
                    ))}
                  </div>
                </Section>
              </>}

              {/* ─ PROJECTS ─ */}
              {tab === 'Projects' && <>
                <div className="adm-toolbar">
                  <span className="adm-toolbar-count">
                    <Layers size={15} /> {p.projects.length} project{p.projects.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="adm-btn-add"
                    disabled={p.projects.length >= 30}
                    onClick={() => change('projects', [...p.projects, {
                      title: 'New project',
                      category: 'Web development',
                      description: '', url: '', image: '',
                      year: String(new Date().getFullYear())
                    }])}
                  >
                    <Plus size={15} /> Add project
                  </button>
                </div>

                {p.projects.map((project, i) => (
                  <div className="adm-project-card" key={i}>
                    <div className="adm-project-header">
                      <span className="adm-project-num">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="adm-project-title">{project.title || 'Untitled'}</h3>
                      <div className="adm-project-actions">
                        <button
                          className="adm-icon-btn"
                          disabled={i === 0}
                          onClick={() => { const l = [...p.projects];[l[i], l[i - 1]] = [l[i - 1], l[i]]; change('projects', l); }}
                          title="Move up"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          className="adm-icon-btn"
                          disabled={i === p.projects.length - 1}
                          onClick={() => { const l = [...p.projects];[l[i], l[i + 1]] = [l[i + 1], l[i]]; change('projects', l); }}
                          title="Move down"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          className="adm-icon-btn danger"
                          onClick={() => change('projects', p.projects.filter((_, j) => j !== i))}
                          title="Remove project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="adm-grid-2">
                      {(['title', 'category', 'year'] as const).map(k => (
                        <label className="adm-field" key={k}>
                          <span className="adm-label">{{ title: 'Project title', category: 'Category', year: 'Year' }[k]}</span>
                          <input
                            value={project[k]}
                            onChange={e => change('projects', p.projects.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))}
                          />
                        </label>
                      ))}
                      <label className="adm-field">
                        <span className="adm-label">Live URL</span>
                        <input
                          value={project.url}
                          placeholder="https://..."
                          onChange={e => change('projects', p.projects.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                        />
                      </label>
                      <div className="adm-upload-block">
                        <label className="adm-field">
                          <span className="adm-label">Image URL</span>
                          <input
                            value={project.image}
                            placeholder="https://..."
                            onChange={e => change('projects', p.projects.map((x, j) => j === i ? { ...x, image: e.target.value } : x))}
                          />
                        </label>
                        <label className="adm-upload-btn">
                          <Upload size={14} />
                          {uploading === 'project' + i ? 'Uploading…' : 'Upload image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={!!uploading}
                            onChange={e => upload(e.target.files?.[0], url => change('projects', p.projects.map((x, j) => j === i ? { ...x, image: url } : x)), 'project' + i)}
                          />
                        </label>
                      </div>
                      <label className="adm-field adm-col-span-2">
                        <span className="adm-label">Description</span>
                        <textarea
                          rows={4}
                          value={project.description}
                          onChange={e => change('projects', p.projects.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                        />
                      </label>
                    </div>
                  </div>
                ))}

                {!p.projects.length && (
                  <div className="adm-empty">
                    <Layers size={40} />
                    <p>No projects yet. Add your first one!</p>
                    <button
                      className="adm-btn-add"
                      onClick={() => change('projects', [{ title: 'New project', category: 'Web development', description: '', url: '', image: '', year: String(new Date().getFullYear()) }])}
                    >
                      <Plus size={15} /> Add project
                    </button>
                  </div>
                )}
              </>}

              {/* ─ JOURNEY ─ */}
              {tab === 'Journey' && <>
                {(['education', 'experiences'] as const).map(col => (
                  <Section
                    key={col}
                    title={col === 'education' ? 'Education' : 'Experience'}
                    icon={col === 'education' ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                  >
                    <div className="adm-toggle-row">
                      <label className="adm-toggle">
                        <input
                          type="checkbox"
                          checked={col === 'education' ? p.showEducation : p.showExperience}
                          onChange={e => change(col === 'education' ? 'showEducation' : 'showExperience', e.target.checked)}
                        />
                        <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
                        Show on portfolio
                      </label>
                    </div>
                    {p[col].map((item, i) => (
                      <div className="adm-journey-item" key={i}>
                        <div className="adm-journey-item-head">
                          <span>Entry {i + 1}</span>
                          <button
                            className="adm-icon-btn danger"
                            onClick={() => change(col, p[col].filter((_, j) => j !== i) as never)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="adm-grid-2">
                          {Object.entries(item).map(([key, value]) => (
                            <label
                              className={`adm-field${key === 'detail' ? ' adm-col-span-2' : ''}`}
                              key={key}
                            >
                              <span className="adm-label">
                                {{ school: 'Institution', degree: 'Degree / course', company: 'Organization', role: 'Role', period: 'Dates', detail: 'Details' }[key as 'school']}
                              </span>
                              {key === 'detail'
                                ? (
                                  <textarea
                                    rows={3}
                                    value={value}
                                    onChange={e => change(col, p[col].map((x, j) => j === i ? { ...x, [key]: e.target.value } : x) as never)}
                                  />
                                ) : (
                                  <input
                                    value={value}
                                    onChange={e => change(col, p[col].map((x, j) => j === i ? { ...x, [key]: e.target.value } : x) as never)}
                                  />
                                )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className="adm-btn-add"
                      disabled={p[col].length >= 20}
                      onClick={() => {
                        if (col === 'education') change('education', [...p.education, { school: '', degree: '', period: '', detail: '' }]);
                        else change('experiences', [...p.experiences, { company: '', role: '', period: '', detail: '' }]);
                      }}
                    >
                      <Plus size={14} /> Add {col === 'education' ? 'education' : 'experience'}
                    </button>
                  </Section>
                ))}

                <Section title="Achievements & Highlights" icon={<Award size={16} />}>
                  <div className="adm-toggle-row">
                    <label className="adm-toggle">
                      <input
                        type="checkbox"
                        checked={p.showAchievements}
                        onChange={e => change('showAchievements', e.target.checked)}
                      />
                      <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
                      Show on portfolio
                    </label>
                  </div>
                  <label className="adm-field">
                    <span className="adm-label">Achievements (one per line)</span>
                    <textarea
                      rows={7}
                      value={p.achievements.join('\n')}
                      onChange={e => change('achievements', e.target.value.split('\n'))}
                    />
                  </label>
                </Section>
              </>}

              {/* ─ APPEARANCE ─ */}
              {tab === 'Appearance' && <>
                <Section title="Accent color" icon={<Palette size={16} />}>
                  <p className="adm-help-text">Choose the color used for headings, buttons, and highlights.</p>
                  <div className="adm-color-grid">
                    {[
                      '#7C3AED', '#4F46E5', '#2563EB', '#0891B2',
                      '#059669', '#D97706', '#DC2626', '#DB2777',
                      '#6D28D9', '#1E40AF', '#065F46', '#9F1239',
                    ].map(color => (
                      <button
                        key={color}
                        className={`adm-swatch${p.accent === color ? ' active' : ''}`}
                        style={{ background: color }}
                        aria-label={'Select ' + color}
                        onClick={() => change('accent', color)}
                      >
                        {p.accent === color && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                  <label className="adm-custom-color">
                    <span>Custom color</span>
                    <div className="adm-custom-color-input">
                      <input
                        type="color"
                        value={p.accent}
                        onChange={e => change('accent', e.target.value)}
                      />
                      <span>{p.accent}</span>
                    </div>
                  </label>
                  <div className="adm-color-preview" style={{ background: p.accent }}>
                    <span>Preview: {p.name}</span>
                    <ArrowUpRight size={18} />
                  </div>
                </Section>

                <Section title="Layout" icon={<LayoutGrid size={16} />}>
                  <p className="adm-help-text">Choose how the hero section is arranged.</p>
                  <div className="adm-layout-grid">
                    {(['editorial', 'centered', 'split'] as const).map(layout => (
                      <button
                        key={layout}
                        className={`adm-layout-opt${p.layout === layout ? ' active' : ''}`}
                        onClick={() => change('layout', layout)}
                      >
                        <div className={`adm-layout-mini ${layout}`}>
                          <i /><i /><i />
                        </div>
                        <strong>{{ editorial: 'Left align', centered: 'Centered', split: 'Split' }[layout]}</strong>
                      </button>
                    ))}
                  </div>
                </Section>
              </>}

              {/* ─ SETTINGS & CREDENTIALS ─ */}
              {(tab === 'Settings' || tab === 'Access') && <>
                <Section title="Admin Login Credentials" icon={<Shield size={16} />}>
                  <p className="adm-help-text">
                    Change the administrator email and password used to log in at <code>/admin</code>. Persists in SQLite and the code store, working locally and on Vercel.
                  </p>

                  {credsNotice && (
                    <div className="adm-notice success" style={{ marginBottom: '16px', borderRadius: '8px' }}>
                      <CheckCircle2 size={16} />
                      <span>{credsNotice}</span>
                    </div>
                  )}

                  {credsError && (
                    <div className="adm-notice error" style={{ marginBottom: '16px', borderRadius: '8px' }}>
                      <span>{credsError}</span>
                    </div>
                  )}

                  <div className="adm-grid-2">
                    <label className="adm-field">
                      <span className="adm-label">Admin Email</span>
                      <input
                        type="email"
                        value={adminLoginEmail}
                        placeholder="student9techxera@gmail.com"
                        onChange={e => { setAdminLoginEmail(e.target.value); setCredsNotice(''); setCredsError(''); }}
                      />
                      <span className="adm-upload-hint">Email used to log into /admin</span>
                    </label>

                    <label className="adm-field">
                      <span className="adm-label">New Password (optional)</span>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showAdminPass ? 'text' : 'password'}
                          value={adminLoginPass}
                          placeholder="Leave blank to keep current"
                          style={{ paddingRight: '40px', width: '100%' }}
                          onChange={e => { setAdminLoginPass(e.target.value); setCredsNotice(''); setCredsError(''); }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPass(!showAdminPass)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          aria-label={showAdminPass ? 'Hide password' : 'Show password'}
                        >
                          {showAdminPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="adm-upload-hint">Min 4 characters (or leave empty to keep existing)</span>
                    </label>

                    {adminLoginPass.trim() && (
                      <label className="adm-field adm-col-span-2">
                        <span className="adm-label">Confirm New Password</span>
                        <input
                          type={showAdminPass ? 'text' : 'password'}
                          value={adminConfirmPass}
                          placeholder="Re-enter new password to confirm"
                          onChange={e => { setAdminConfirmPass(e.target.value); setCredsNotice(''); setCredsError(''); }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    className="adm-btn-primary"
                    style={{ marginTop: '16px' }}
                    disabled={savingCreds || !adminLoginEmail.trim()}
                    onClick={updateCredentials}
                  >
                    <Shield size={15} />
                    {savingCreds ? 'Updating Credentials…' : 'Save Admin Credentials'}
                  </button>
                </Section>

                <Section title="Vercel & Multi-Host Deployment" icon={<Key size={16} />}>
                  <p className="adm-help-text">
                    This portfolio is engineered with multi-tier persistence. When you deploy to Vercel, all edits to your profile, projects, bio, skills, and admin credentials automatically persist.
                  </p>
                  <div style={{
                    background: '#F1F5F9',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    color: '#334155'
                  }}>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>Production Ready Architecture</span>
                    </div>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      <li><strong>SQLite & JSON Store:</strong> Changes saved via this Admin Panel persist in local SQLite and the code data store.</li>
                      <li><strong>Vercel Environment Variables:</strong> (Optional) You can also configure <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in your Vercel Project Settings for instant master access.</li>
                    </ul>
                  </div>
                </Section>

                <Section title="Backup & Restore Portfolio" icon={<Download size={16} />}>
                  <p className="adm-help-text">
                    Download a full JSON backup of your portfolio data, or restore an earlier version anytime.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                    <button
                      type="button"
                      className="adm-topbar-btn adm-btn-ghost"
                      style={{ padding: '10px 18px', border: '1px solid #CBD5E1', borderRadius: '10px' }}
                      onClick={exportBackup}
                    >
                      <Download size={15} /> Export Backup (JSON)
                    </button>
                    <label
                      className="adm-topbar-btn adm-btn-ghost"
                      style={{ padding: '10px 18px', border: '1px solid #CBD5E1', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <RefreshCw size={15} /> Restore Backup (JSON)
                      <input
                        type="file"
                        accept="application/json"
                        style={{ display: 'none' }}
                        onChange={e => importBackup(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </Section>

                {owner && (
                  <Section title="Student access" icon={<Shield size={16} />}>
                    <p className="adm-help-text">
                      Assign a student who can edit this portfolio. They must sign in with ChatGPT using this email.
                    </p>
                    <label className="adm-field">
                      <span className="adm-label">Student's ChatGPT email</span>
                      <input
                        type="email"
                        value={email}
                        placeholder="student@example.com"
                        onChange={e => { setEmail(e.target.value); setAccessDirty(true); setNotice(''); }}
                      />
                    </label>
                    <button className="adm-btn-primary" disabled={accessBusy} onClick={access} style={{ marginTop: '12px' }}>
                      <Shield size={15} />
                      {accessBusy ? 'Saving…' : 'Save student access'}
                    </button>
                  </Section>
                )}
              </>}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
