'use client';

import {useEffect, useState, useRef, type ReactNode} from 'react';
import {
  User,
  Layers,
  GraduationCap,
  Paintbrush,
  Save,
  Eye,
  Plus,
  Trash2,
  Upload,
  Briefcase,
  Award,
  CheckCircle2,
  ExternalLink,
  Database,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  AlertCircle,
  LogOut,
  FileJson
} from 'lucide-react';
import type {Profile, Project} from '../../lib/portfolio';
import Portfolio from '../portfolio-view';

type AdminTab = 'profile' | 'media' | 'projects' | 'skills' | 'journey' | 'appearance' | 'database';

interface AdminPanelProps {
  initialProfile: Profile;
  initialRevision: number;
  lastUpdated: string | null;
  onLogout?: () => void;
}

export default function AdminPanel({
  initialProfile,
  initialRevision,
  lastUpdated,
  onLogout,
}: AdminPanelProps) {
  const [p, setP] = useState<Profile>(initialProfile);
  const [revision, setRevision] = useState<number>(initialRevision);
  const [updatedAt, setUpdatedAt] = useState<string | null>(lastUpdated);
  const [tab, setTab] = useState<AdminTab>('profile');
  const [dirty, setDirty] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<boolean>(false);
  const [uploading, setUploading] = useState<string>('');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  function change<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP(prev => ({...prev, [key]: value}));
    setDirty(true);
    setNotice('');
  }

  async function save() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({profile: p, revision}),
      });
      const data = (await res.json()) as {
        error?: string;
        revision: number;
        updatedAt: string;
      };
      if (!res.ok) throw new Error(data.error || 'Failed to save to JSON file.');

      setRevision(data.revision);
      setUpdatedAt(data.updatedAt);
      setDirty(false);
      setNotice('All changes successfully saved to data/portfolio.json!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(
    file: File | undefined,
    assign: (url: string) => void,
    key: string
  ) {
    if (!file) return;
    setUploading(key);
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = (await res.json()) as {error?: string; url: string};
      if (!res.ok) throw new Error(result.error || 'Upload failed.');
      assign(result.url);
      setDirty(true);
      setNotice('File uploaded and stored in media storage. Click "Save changes" to apply.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading('');
    }
  }

  function exportBackup() {
    const json = JSON.stringify(p, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const navItems: {id: AdminTab; label: string; icon: ReactNode}[] = [
    {id: 'profile', label: 'Profile & Bio', icon: <User size={18} />},
    {id: 'media', label: 'Photo & Résumé', icon: <Upload size={18} />},
    {id: 'projects', label: 'Projects', icon: <Layers size={18} />},
    {id: 'skills', label: 'Skills & Toolkit', icon: <Paintbrush size={18} />},
    {id: 'journey', label: 'Education & Exp', icon: <GraduationCap size={18} />},
    {id: 'appearance', label: 'Appearance', icon: <Paintbrush size={18} />},
    {id: 'database', label: 'JSON Data & Backup', icon: <Database size={18} />},
  ];

  return (
    <div className="editor">
      <header className="editor-header">
        <a href="/" className="editor-brand">
          Developer Terminal<span> / Admin Panel</span>
        </a>

        <div className="editor-actions">
          <span className="save-state">
            {dirty ? '● Unsaved changes' : '✓ All changes saved'}
          </span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={16} />
            {preview ? 'Back to Editor' : 'Live Preview'}
          </button>
          <button
            type="button"
            className="button"
            disabled={busy || !!uploading}
            onClick={save}
            style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <Save size={16} />
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
          {onLogout && (
            <button
              type="button"
              className="secondary-button"
              onClick={onLogout}
              title="Logout from Admin Session"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#dc3545',
                borderColor: '#f8d7da',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="editor-layout">
        <aside className="editor-sidebar">
          <div className="editor-avatar" style={{background: p.accent}}>
            {p.name
              ? p.name
                  .split(' ')
                  .map(w => w[0])
                  .slice(0, 2)
                  .join('')
              : 'AD'}
          </div>
          <h2>{p.name || 'Admin'}</h2>
          <p>Portfolio Administrator</p>

          <nav aria-label="Admin sections">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id && !preview ? 'active' : ''}
                onClick={() => {
                  setTab(item.id);
                  setPreview(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <span>Storage: data/portfolio.json</span>
            <span>Revision: #{revision}</span>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Open Live Portfolio
            </a>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              >
                <LogOut size={14} /> Log out admin
              </button>
            )}
          </div>
        </aside>

        <main className="editor-main">
          {notice && (
            <div className="notice success" role="status">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}

          {error && (
            <div className="notice error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {preview ? (
            <div className="preview-container">
              <div className="preview-label">
                LIVE DRAFT PREVIEW · CLICK &apos;SAVE TO SQLITE&apos; TO PERSIST
              </div>
              <Portfolio profile={p} preview />
            </div>
          ) : (
            <>
              {/* TAB: PROFILE & BIO */}
              {tab === 'profile' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">PORTFOLIO DETAILS</span>
                    <h1>Personal Information & Bio</h1>
                    <p>
                      Control the developer identity, headline, and bio shown across the portfolio.
                    </p>
                  </div>

                  <section className="form-section">
                    <h2>Developer Identity</h2>
                    <div className="form-grid">
                      <label className="field">
                        <span>Full Name</span>
                        <input
                          value={p.name}
                          onChange={e => change('name', e.target.value)}
                          placeholder="e.g. Alex Rivera"
                        />
                      </label>

                      <label className="field">
                        <span>Role / Subtitle (shown as // role)</span>
                        <input
                          value={p.role}
                          onChange={e => change('role', e.target.value)}
                          placeholder="e.g. Full Stack Developer"
                        />
                      </label>

                      <div className="full-width">
                        <label className="field">
                          <span>Hero Headline (First line & accent line)</span>
                          <textarea
                            rows={3}
                            value={p.headline}
                            onChange={e => change('headline', e.target.value)}
                            placeholder="e.g. Building software with intention.\nCode that creates impact."
                          />
                        </label>
                      </div>

                      <div className="full-width">
                        <label className="field">
                          <span>Full Bio (Rendered in cat about.md)</span>
                          <textarea
                            rows={8}
                            value={p.bio}
                            onChange={e => change('bio', e.target.value)}
                            placeholder="Tell your story, background, and what drives you..."
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span>Location</span>
                        <input
                          value={p.location}
                          onChange={e => change('location', e.target.value)}
                          placeholder="e.g. San Francisco, CA or Remote"
                        />
                      </label>

                      <label className="field">
                        <span>Availability Status (Shown in top nav pill)</span>
                        <input
                          value={p.availability}
                          onChange={e => change('availability', e.target.value)}
                          placeholder="e.g. Available for full-time roles & projects"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="form-section">
                    <h2>Contact & Social Profiles</h2>
                    <div className="form-grid">
                      <label className="field">
                        <span>Public Contact Email</span>
                        <input
                          type="email"
                          value={p.email}
                          onChange={e => change('email', e.target.value)}
                          placeholder="developer@example.com"
                        />
                      </label>

                      <label className="field">
                        <span>GitHub Profile URL</span>
                        <input
                          value={p.github}
                          onChange={e => change('github', e.target.value)}
                          placeholder="https://github.com/username"
                        />
                      </label>

                      <label className="field">
                        <span>LinkedIn Profile URL</span>
                        <input
                          value={p.linkedin}
                          onChange={e => change('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </label>

                      <label className="field">
                        <span>Instagram Profile URL</span>
                        <input
                          value={p.instagram}
                          onChange={e => change('instagram', e.target.value)}
                          placeholder="https://instagram.com/username"
                        />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {/* TAB: MEDIA (PHOTO & RESUME) */}
              {tab === 'media' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">SQLITE MEDIA STORAGE</span>
                    <h1>Photo & Résumé Files</h1>
                    <p>
                      Files are securely stored in the SQLite database and served via local media endpoints.
                    </p>
                  </div>

                  <section className="form-section">
                    <h2>Profile Photo</h2>
                    <div className="form-grid">
                      <div className="full-width">
                        <label className="field">
                          <span>Photo URL (Direct link or upload below)</span>
                          <input
                            value={p.photo}
                            onChange={e => change('photo', e.target.value)}
                            placeholder="/api/media/... or https://..."
                          />
                        </label>

                        <div style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                          <label className="upload-button">
                            <Upload size={16} />
                            {uploading === 'photo' ? 'Uploading to SQLite…' : 'Upload photo image'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              disabled={!!uploading}
                              onChange={e =>
                                uploadFile(
                                  e.target.files?.[0],
                                  url => change('photo', url),
                                  'photo'
                                )
                              }
                            />
                          </label>

                          {p.photo && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                              <div
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid #ddd',
                                  background: '#eee',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.photo}
                                  alt="Photo preview"
                                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                />
                              </div>
                              <button
                                type="button"
                                className="icon-button danger"
                                onClick={() => change('photo', '')}
                                title="Remove photo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        <small className="field-help" style={{display: 'block', marginTop: '6px'}}>
                          Supported: JPG, PNG, WebP, SVG. Stored in SQLite database.
                        </small>
                      </div>
                    </div>
                  </section>

                  <section className="form-section">
                    <h2>Résumé / CV Document</h2>
                    <div className="form-grid">
                      <div className="full-width">
                        <label className="field">
                          <span>Résumé Link or URL</span>
                          <input
                            value={p.resume}
                            onChange={e => change('resume', e.target.value)}
                            placeholder="/api/media/... or https://..."
                          />
                        </label>

                        <div style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                          <label className="upload-button">
                            <Upload size={16} />
                            {uploading === 'resume' ? 'Uploading to SQLite…' : 'Upload PDF résumé'}
                            <input
                              type="file"
                              accept="application/pdf"
                              disabled={!!uploading}
                              onChange={e =>
                                uploadFile(
                                  e.target.files?.[0],
                                  url => change('resume', url),
                                  'resume'
                                )
                              }
                            />
                          </label>

                          {p.resume && (
                            <a
                              href={p.resume}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button"
                              style={{fontSize: '13px'}}
                            >
                              <ExternalLink size={14} /> View current résumé
                            </a>
                          )}
                        </div>
                        <small className="field-help" style={{display: 'block', marginTop: '6px'}}>
                          Supported: PDF file. Stored in SQLite database.
                        </small>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* TAB: PROJECTS */}
              {tab === 'projects' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">PORTFOLIO WORK</span>
                    <h1>Projects & Case Studies</h1>
                    <p>
                      Add, edit, reorder, or delete projects. Upload project artwork directly to SQLite.
                    </p>
                  </div>

                  <div className="collection-toolbar">
                    <span>{p.projects.length} Projects Configured</span>
                    <button
                      type="button"
                      className="button"
                      disabled={p.projects.length >= 30}
                      onClick={() => {
                        const newProject: Project = {
                          title: 'New Project',
                          category: 'Web Development',
                          description: 'Description of the project and technical decisions.',
                          url: '',
                          image: '',
                          year: String(new Date().getFullYear()),
                        };
                        change('projects', [...p.projects, newProject]);
                      }}
                    >
                      <Plus size={16} /> Add New Project
                    </button>
                  </div>

                  {p.projects.map((project, i) => (
                    <section className="form-section" key={i}>
                      <div className="section-row">
                        <h2>
                          Project {String(i + 1).padStart(2, '0')}: {project.title || 'Untitled'}
                        </h2>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                          <button
                            type="button"
                            className="secondary-button"
                            style={{padding: '6px 10px'}}
                            disabled={i === 0}
                            onClick={() => {
                              const list = [...p.projects];
                              [list[i], list[i - 1]] = [list[i - 1], list[i]];
                              change('projects', list);
                            }}
                            title="Move Up"
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            style={{padding: '6px 10px'}}
                            disabled={i === p.projects.length - 1}
                            onClick={() => {
                              const list = [...p.projects];
                              [list[i], list[i + 1]] = [list[i + 1], list[i]];
                              change('projects', list);
                            }}
                            title="Move Down"
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Remove project ${i + 1}`}
                            onClick={() =>
                              change(
                                'projects',
                                p.projects.filter((_, j) => j !== i)
                              )
                            }
                            title="Delete Project"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="form-grid">
                        <label className="field">
                          <span>Project Title</span>
                          <input
                            value={project.title}
                            onChange={e =>
                              change(
                                'projects',
                                p.projects.map((item, j) =>
                                  j === i ? {...item, title: e.target.value} : item
                                )
                              )
                            }
                            placeholder="Project Title"
                          />
                        </label>

                        <label className="field">
                          <span>Category</span>
                          <input
                            value={project.category}
                            onChange={e =>
                              change(
                                'projects',
                                p.projects.map((item, j) =>
                                  j === i ? {...item, category: e.target.value} : item
                                )
                              )
                            }
                            placeholder="e.g. Web Development, AI / ML, App"
                          />
                        </label>

                        <label className="field">
                          <span>Year</span>
                          <input
                            value={project.year}
                            onChange={e =>
                              change(
                                'projects',
                                p.projects.map((item, j) =>
                                  j === i ? {...item, year: e.target.value} : item
                                )
                              )
                            }
                            placeholder="e.g. 2026"
                          />
                        </label>

                        <label className="field">
                          <span>Project URL (Live Demo or GitHub)</span>
                          <input
                            value={project.url}
                            onChange={e =>
                              change(
                                'projects',
                                p.projects.map((item, j) =>
                                  j === i ? {...item, url: e.target.value} : item
                                )
                              )
                            }
                            placeholder="https://..."
                          />
                        </label>

                        <div className="full-width">
                          <label className="field">
                            <span>Cover Image URL (or upload image below)</span>
                            <input
                              value={project.image}
                              onChange={e =>
                                change(
                                  'projects',
                                  p.projects.map((item, j) =>
                                    j === i ? {...item, image: e.target.value} : item
                                  )
                                )
                              }
                              placeholder="/api/media/... or https://..."
                            />
                          </label>

                          <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <label className="upload-button">
                              <Upload size={16} />
                              {uploading === `project-${i}` ? 'Uploading to SQLite…' : 'Upload project image'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                disabled={!!uploading}
                                onChange={e =>
                                  uploadFile(
                                    e.target.files?.[0],
                                    url =>
                                      change(
                                        'projects',
                                        p.projects.map((item, j) =>
                                          j === i ? {...item, image: url} : item
                                        )
                                      ),
                                    `project-${i}`
                                  )
                                }
                              />
                            </label>

                            {project.image && (
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #ccc',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="full-width">
                          <label className="field">
                            <span>Project Description</span>
                            <textarea
                              rows={4}
                              value={project.description}
                              onChange={e =>
                                change(
                                  'projects',
                                  p.projects.map((item, j) =>
                                    j === i ? {...item, description: e.target.value} : item
                                  )
                                )
                              }
                              placeholder="Write a clear overview of the project, features, technologies used, and outcomes..."
                            />
                          </label>
                        </div>
                      </div>
                    </section>
                  ))}

                  {!p.projects.length && (
                    <div className="form-section empty-copy" style={{textAlign: 'center', padding: '40px'}}>
                      No projects yet. Click &quot;Add New Project&quot; above to create your first portfolio entry.
                    </div>
                  )}
                </>
              )}

              {/* TAB: SKILLS */}
              {tab === 'skills' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">DEVELOPER TOOLKIT</span>
                    <h1>Skills & Technologies</h1>
                    <p>
                      Add, remove, or bulk edit the skills displayed under the &quot;skills&quot; terminal tab.
                    </p>
                  </div>

                  <section className="form-section">
                    <h2>Active Skills ({p.skills.filter(Boolean).length})</h2>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px'}}>
                      {p.skills.filter(Boolean).map((skill, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f1f4f9',
                            border: '1px solid #d5dbe5',
                            borderRadius: '99px',
                            padding: '6px 14px',
                            fontSize: '13px',
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => {
                              change(
                                'skills',
                                p.skills.filter((_, i) => i !== idx)
                              );
                            }}
                            style={{
                              border: 0,
                              background: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              color: '#888',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Remove skill"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="field">
                      <span>Edit Skills (one skill per line)</span>
                      <textarea
                        rows={8}
                        value={p.skills.join('\n')}
                        onChange={e =>
                          change(
                            'skills',
                            e.target.value.split('\n').map(s => s.trim())
                          )
                        }
                        placeholder="React&#10;TypeScript&#10;Python&#10;Node.js&#10;SQLite&#10;TailwindCSS"
                      />
                    </label>
                  </section>
                </>
              )}

              {/* TAB: JOURNEY (EDUCATION, EXPERIENCE, ACHIEVEMENTS) */}
              {tab === 'journey' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">EXPERIENCE & EDUCATION</span>
                    <h1>Journey & Achievements</h1>
                    <p>
                      Configure your educational background, professional experience, and academic or career highlights.
                    </p>
                  </div>

                  {/* EDUCATION */}
                  <section className="form-section">
                    <div className="section-row">
                      <h2>
                        <GraduationCap size={20} /> Education ({p.education.length})
                      </h2>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={p.showEducation}
                          onChange={e => change('showEducation', e.target.checked)}
                        />
                        Display on Portfolio
                      </label>
                    </div>

                    {p.education.map((item, idx) => (
                      <div className="repeat-item" key={idx}>
                        <div className="section-row">
                          <h3>Education Entry {idx + 1}</h3>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() =>
                              change(
                                'education',
                                p.education.filter((_, j) => j !== idx)
                              )
                            }
                            title="Remove Education"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="form-grid">
                          <label className="field">
                            <span>Institution / University</span>
                            <input
                              value={item.school}
                              onChange={e =>
                                change(
                                  'education',
                                  p.education.map((ed, j) =>
                                    j === idx ? {...ed, school: e.target.value} : ed
                                  )
                                )
                              }
                              placeholder="e.g. Stanford University"
                            />
                          </label>

                          <label className="field">
                            <span>Degree / Major / Course</span>
                            <input
                              value={item.degree}
                              onChange={e =>
                                change(
                                  'education',
                                  p.education.map((ed, j) =>
                                    j === idx ? {...ed, degree: e.target.value} : ed
                                  )
                                )
                              }
                              placeholder="e.g. B.S. in Computer Science"
                            />
                          </label>

                          <label className="field">
                            <span>Period / Dates</span>
                            <input
                              value={item.period}
                              onChange={e =>
                                change(
                                  'education',
                                  p.education.map((ed, j) =>
                                    j === idx ? {...ed, period: e.target.value} : ed
                                  )
                                )
                              }
                              placeholder="e.g. 2022 — 2026"
                            />
                          </label>

                          <div className="full-width">
                            <label className="field">
                              <span>Details & Relevant Coursework</span>
                              <textarea
                                rows={3}
                                value={item.detail}
                                onChange={e =>
                                  change(
                                    'education',
                                    p.education.map((ed, j) =>
                                      j === idx ? {...ed, detail: e.target.value} : ed
                                    )
                                  )
                                }
                                placeholder="Key achievements, coursework, GPA, leadership..."
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="secondary-button"
                      disabled={p.education.length >= 20}
                      onClick={() =>
                        change('education', [
                          ...p.education,
                          {school: '', degree: '', period: '', detail: ''},
                        ])
                      }
                      style={{marginTop: '15px'}}
                    >
                      <Plus size={16} /> Add Education Entry
                    </button>
                  </section>

                  {/* EXPERIENCE */}
                  <section className="form-section">
                    <div className="section-row">
                      <h2>
                        <Briefcase size={20} /> Work Experience ({p.experiences.length})
                      </h2>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={p.showExperience}
                          onChange={e => change('showExperience', e.target.checked)}
                        />
                        Display on Portfolio
                      </label>
                    </div>

                    {p.experiences.map((item, idx) => (
                      <div className="repeat-item" key={idx}>
                        <div className="section-row">
                          <h3>Experience Entry {idx + 1}</h3>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() =>
                              change(
                                'experiences',
                                p.experiences.filter((_, j) => j !== idx)
                              )
                            }
                            title="Remove Experience"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="form-grid">
                          <label className="field">
                            <span>Company / Organization</span>
                            <input
                              value={item.company}
                              onChange={e =>
                                change(
                                  'experiences',
                                  p.experiences.map((exp, j) =>
                                    j === idx ? {...exp, company: e.target.value} : exp
                                  )
                                )
                              }
                              placeholder="e.g. Acme Tech Labs"
                            />
                          </label>

                          <label className="field">
                            <span>Role / Title</span>
                            <input
                              value={item.role}
                              onChange={e =>
                                change(
                                  'experiences',
                                  p.experiences.map((exp, j) =>
                                    j === idx ? {...exp, role: e.target.value} : exp
                                  )
                                )
                              }
                              placeholder="e.g. Software Engineering Intern"
                            />
                          </label>

                          <label className="field">
                            <span>Period / Dates</span>
                            <input
                              value={item.period}
                              onChange={e =>
                                change(
                                  'experiences',
                                  p.experiences.map((exp, j) =>
                                    j === idx ? {...exp, period: e.target.value} : exp
                                  )
                                )
                              }
                              placeholder="e.g. Summer 2025"
                            />
                          </label>

                          <div className="full-width">
                            <label className="field">
                              <span>Details & Responsibilities</span>
                              <textarea
                                rows={3}
                                value={item.detail}
                                onChange={e =>
                                  change(
                                    'experiences',
                                    p.experiences.map((exp, j) =>
                                      j === idx ? {...exp, detail: e.target.value} : exp
                                    )
                                  )
                                }
                                placeholder="Describe what you built, technologies used, and outcomes achieved..."
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="secondary-button"
                      disabled={p.experiences.length >= 20}
                      onClick={() =>
                        change('experiences', [
                          ...p.experiences,
                          {company: '', role: '', period: '', detail: ''},
                        ])
                      }
                      style={{marginTop: '15px'}}
                    >
                      <Plus size={16} /> Add Experience Entry
                    </button>
                  </section>

                  {/* ACHIEVEMENTS */}
                  <section className="form-section">
                    <div className="section-row">
                      <h2>
                        <Award size={20} /> Highlights & Achievements
                      </h2>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={p.showAchievements}
                          onChange={e => change('showAchievements', e.target.checked)}
                        />
                        Display on Portfolio
                      </label>
                    </div>

                    <label className="field">
                      <span>Achievements (One per line)</span>
                      <textarea
                        rows={6}
                        value={p.achievements.join('\n')}
                        onChange={e =>
                          change(
                            'achievements',
                            e.target.value.split('\n')
                          )
                        }
                        placeholder="Winner, Hackathon 2025&#10;Published Research in AI Conference&#10;Dean's Honor List 2024"
                      />
                    </label>
                  </section>
                </>
              )}

              {/* TAB: APPEARANCE */}
              {tab === 'appearance' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">DESIGN & THEMING</span>
                    <h1>Appearance & Alignment</h1>
                    <p>Customize the accent highlights, cursor, and hero alignment of the terminal.</p>
                  </div>

                  <section className="form-section">
                    <h2>Accent Color</h2>
                    <p className="field-help">
                      Determines the terminal cursor, button highlights, and status pill colors.
                    </p>
                    <div className="color-options">
                      {[
                        '#32633b',
                        '#3157eb',
                        '#9745d8',
                        '#c44426',
                        '#00796b',
                        '#bf3465',
                        '#1b637d',
                        '#765126',
                        '#593ada',
                        '#282828',
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-swatch ${p.accent === color ? 'selected' : ''}`}
                          style={{background: color}}
                          aria-label={`Select color ${color}`}
                          onClick={() => change('accent', color)}
                        />
                      ))}
                      <label className="custom-color">
                        Custom:
                        <input
                          type="color"
                          value={p.accent}
                          onChange={e => change('accent', e.target.value)}
                        />
                      </label>
                    </div>
                  </section>

                  <section className="form-section">
                    <h2>Hero Heading Alignment</h2>
                    <p className="field-help">
                      Controls the presentation alignment of the main headline.
                    </p>
                    <div className="layout-options">
                      {(['editorial', 'centered', 'split'] as const).map(layoutOption => (
                        <button
                          key={layoutOption}
                          type="button"
                          className={`layout-option ${p.layout === layoutOption ? 'selected' : ''}`}
                          onClick={() => change('layout', layoutOption)}
                        >
                          <span className={`layout-mini ${layoutOption}`}>
                            <i />
                            <i />
                            <i />
                          </span>
                          <strong>
                            {
                              {
                                editorial: 'Left Aligned (Editorial)',
                                centered: 'Center Aligned',
                                split: 'Right Aligned (Split)',
                              }[layoutOption]
                            }
                          </strong>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* TAB: DATABASE & BACKUP */}
              {tab === 'database' && (
                <>
                  <div className="editor-title">
                    <span className="eyebrow">STORAGE & PERSISTENCE</span>
                    <h1>JSON File Storage & Backups</h1>
                    <p>
                      Manage your local JSON storage file (data/portfolio.json), export backups, or inspect/edit raw data directly.
                    </p>
                  </div>

                  <section className="form-section">
                    <h2>JSON Storage File Status</h2>
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '18px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.8',
                        marginBottom: '20px',
                      }}
                    >
                      <div>
                        <strong>Storage File:</strong> data/portfolio.json
                      </div>
                      <div>
                        <strong>Storage Engine:</strong> Local JSON Storage Engine
                      </div>
                      <div>
                        <strong>Current Revision:</strong> #{revision}
                      </div>
                      <div>
                        <strong>Last Updated:</strong>{' '}
                        {updatedAt ? new Date(updatedAt).toLocaleString() : 'Not recorded'}
                      </div>
                      <div>
                        <strong>Projects Stored:</strong> {p.projects.length}
                      </div>
                      <div>
                        <strong>Skills Stored:</strong> {p.skills.filter(Boolean).length}
                      </div>
                      <div>
                        <strong>Media Storage:</strong> Active (data/media.json)
                      </div>
                    </div>

                    <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '24px'}}>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={exportBackup}
                        style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
                      >
                        <Download size={16} /> Export JSON Backup
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          if (confirm('Reload latest data from JSON storage? Any unsaved edits will be discarded.')) {
                            window.location.reload();
                          }
                        }}
                        style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
                      >
                        <RefreshCw size={16} /> Reload from JSON
                      </button>
                    </div>

                    <div style={{borderTop: '1px solid #e2e8f0', paddingTop: '20px'}}>
                      <h3 style={{fontSize: '15px', fontWeight: 600, marginBottom: '8px'}}>Direct JSON Import / Raw Editor</h3>
                      <p style={{fontSize: '13px', color: '#64748b', marginBottom: '12px'}}>
                        You can paste modified JSON or inspect the active JSON representation below. Click &quot;Apply Raw JSON to Editor&quot; then &quot;Save Changes&quot; to commit.
                      </p>
                      <textarea
                        rows={10}
                        style={{
                          width: '100%',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          padding: '12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          lineHeight: '1.5'
                        }}
                        defaultValue={JSON.stringify(p, null, 2)}
                        id="raw-json-editor"
                      />
                      <div style={{marginTop: '10px'}}>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            try {
                              const el = document.getElementById('raw-json-editor') as HTMLTextAreaElement;
                              if (!el) return;
                              const parsed = JSON.parse(el.value);
                              setP(prev => ({...prev, ...parsed}));
                              setDirty(true);
                              setNotice('Raw JSON applied to form! Click "Save Changes" to save to data/portfolio.json.');
                            } catch (parseErr) {
                              setError('Invalid JSON syntax: ' + (parseErr instanceof Error ? parseErr.message : String(parseErr)));
                            }
                          }}
                        >
                          Apply Raw JSON to Editor
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
