'use client';

import React, { useState } from 'react';
import type { Profile, Project, Education, Experience, Stat } from '../../lib/portfolio';
import {
  Save,
  Download,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Layers,
  Palette,
  Briefcase,
  GraduationCap,
  Award,
  BarChart3,
  Share2,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AdminPanelProps {
  initialProfile: Profile;
  token: string;
  adminEmail: string;
  initialUpdatedAt: string;
  onLogout: () => void;
}

type TabType = 'identity' | 'theme' | 'stats' | 'skills' | 'projects' | 'journey' | 'achievements' | 'json';

const PRESET_COLORS = [
  '#0f766e', // Teal / Emerald (Default)
  '#2563eb', // Royal Blue
  '#7c3aed', // Deep Violet
  '#db2777', // Crimson Pink
  '#d97706', // Warm Amber
  '#059669', // Forest Green
  '#dc2626', // Bright Ruby
  '#18181b', // Obsidian Monochrome
];

export default function AdminPanel({
  initialProfile,
  token,
  adminEmail,
  initialUpdatedAt,
  onLogout,
}: AdminPanelProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rawJsonText, setRawJsonText] = useState(JSON.stringify(initialProfile, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>(initialUpdatedAt);
  const [newSkill, setNewSkill] = useState('');

  // Show Toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync profile update
  const updateField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    const next = { ...profile, [field]: value };
    setProfile(next);
    setRawJsonText(JSON.stringify(next, null, 2));
  };

  // Save to JSON File via API
  const handleSave = async (dataToSave?: Profile) => {
    setIsSaving(true);
    setJsonError(null);
    const target = dataToSave || profile;

    try {
      const res = await fetch('/api/admin/save', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: target }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save portfolio');
      }

      setUpdatedAt(data.updatedAt);
      setProfile(target);
      setRawJsonText(JSON.stringify(target, null, 2));
      showToast('success', 'All changes successfully written to data/portfolio-data.json!');
    } catch (err: any) {
      showToast('error', err.message || 'Error occurred while saving to JSON');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Raw JSON editor apply & save
  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setJsonError(null);
      setProfile(parsed);
      handleSave(parsed);
    } catch (err: any) {
      setJsonError('Invalid JSON format: ' + err.message);
      showToast('error', 'Please fix the JSON syntax error before saving.');
    }
  };

  // Download JSON
  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Skills
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) {
      showToast('error', 'Skill already exists.');
      return;
    }
    const nextSkills = [...profile.skills, trimmed];
    updateField('skills', nextSkills);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      'skills',
      profile.skills.filter((s) => s !== skillToRemove)
    );
  };

  // Projects
  const handleAddProject = () => {
    const newProj: Project = {
      title: 'New Featured Project',
      category: 'Software Engineering',
      year: new Date().getFullYear().toString(),
      description: 'Describe the problem solved, architecture, and real-world results.',
      url: 'https://',
      github: 'https://github.com',
      image: '',
      technologies: ['React', 'TypeScript', 'Node.js'],
      featured: true,
    };
    updateField('projects', [newProj, ...profile.projects]);
    showToast('success', 'New project added. Edit details below and click Save!');
  };

  const handleUpdateProject = (index: number, field: keyof Project, val: any) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: val };
    updateField('projects', updated);
  };

  const handleRemoveProject = (index: number) => {
    const updated = profile.projects.filter((_, i) => i !== index);
    updateField('projects', updated);
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= profile.projects.length) return;
    const updated = [...profile.projects];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateField('projects', updated);
  };

  // Experience
  const handleAddExperience = () => {
    const newExp: Experience = {
      company: 'New Organization / Company',
      role: 'Software Engineer',
      period: '2025 — Present',
      detail: 'Spearheaded development of core features and improved performance.',
    };
    updateField('experiences', [newExp, ...profile.experiences]);
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, val: any) => {
    const updated = [...profile.experiences];
    updated[index] = { ...updated[index], [field]: val };
    updateField('experiences', updated);
  };

  const handleRemoveExperience = (index: number) => {
    updateField(
      'experiences',
      profile.experiences.filter((_, i) => i !== index)
    );
  };

  // Education
  const handleAddEducation = () => {
    const newEdu: Education = {
      school: 'University / Institute Name',
      degree: 'Degree & Specialization',
      period: '2023 — 2027',
      detail: 'Relevant coursework, GPA, leadership, and extracurricular honors.',
    };
    updateField('education', [newEdu, ...profile.education]);
  };

  const handleUpdateEducation = (index: number, field: keyof Education, val: any) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: val };
    updateField('education', updated);
  };

  const handleRemoveEducation = (index: number) => {
    updateField(
      'education',
      profile.education.filter((_, i) => i !== index)
    );
  };

  // Achievements
  const handleAddAchievement = () => {
    updateField('achievements', ['New certification, award, or competition prize', ...profile.achievements]);
  };

  const handleUpdateAchievement = (index: number, val: string) => {
    const updated = [...profile.achievements];
    updated[index] = val;
    updateField('achievements', updated);
  };

  const handleRemoveAchievement = (index: number) => {
    updateField(
      'achievements',
      profile.achievements.filter((_, i) => i !== index)
    );
  };

  // Stats
  const statsList = profile.stats || [];
  const handleAddStat = () => {
    const newStat: Stat = {
      label: 'New Metric',
      value: '10+',
      subtext: 'Description of achievement',
    };
    updateField('stats', [...statsList, newStat]);
  };

  const handleUpdateStat = (index: number, field: keyof Stat, val: string) => {
    const updated = [...statsList];
    updated[index] = { ...updated[index], [field]: val };
    updateField('stats', updated);
  };

  const handleRemoveStat = (index: number) => {
    updateField(
      'stats',
      statsList.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="admin-root admin-dashboard">
      {/* Top sticky bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-logo-badge">
            Student 10 <span>Admin Portal</span>
          </div>
          <div className="admin-json-status">
            <span>data/portfolio-data.json</span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              ({new Date(updatedAt).toLocaleTimeString()})
            </span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-secondary"
            title="View live portfolio website"
          >
            <ExternalLink size={14} /> Live Site
          </a>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="admin-btn admin-btn-secondary"
            title="Download local JSON copy"
          >
            <Download size={14} /> Export JSON
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="admin-btn admin-btn-save"
          >
            <Save size={15} /> {isSaving ? 'Saving...' : 'Save to JSON'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="admin-btn admin-btn-danger"
            title="Sign out of admin session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="admin-nav-tabs" aria-label="Admin Sections">
        <button
          className={`admin-tab ${activeTab === 'identity' ? 'active' : ''}`}
          onClick={() => setActiveTab('identity')}
        >
          <User size={15} /> Identity & Contact
        </button>

        <button
          className={`admin-tab ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          <Palette size={15} /> Theme & Accent
        </button>

        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={15} /> Key Stats
        </button>

        <button
          className={`admin-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <Sparkles size={15} /> Skills
        </button>

        <button
          className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Layers size={15} /> Projects ({profile.projects.length})
        </button>

        <button
          className={`admin-tab ${activeTab === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveTab('journey')}
        >
          <Briefcase size={15} /> Experience & Education
        </button>

        <button
          className={`admin-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Award size={15} /> Achievements
        </button>

        <button
          className={`admin-tab ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          <FileCode size={15} /> Raw JSON File
        </button>
      </nav>

      {/* Main Tab Content */}
      <main className="admin-main">
        {/* ===================================================================
            TAB 1: IDENTITY & CONTACT
            =================================================================== */}
        {activeTab === 'identity' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Personal & Professional Identity</h2>
                <p>Modify your name, public role, hero headline, biography, and contact routes.</p>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Satyam Mallik"
                />
              </div>

              <div className="admin-field">
                <label>Professional Role / Title</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  placeholder="e.g. Full Stack Engineer & AI Systems Architect"
                />
              </div>
            </div>

            <div className="admin-field" style={{ marginTop: '16px' }}>
              <label>Hero Headline (Supports multiple lines)</label>
              <textarea
                rows={2}
                value={profile.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                placeholder="Line 1\nLine 2"
              />
              <span className="admin-field-help">
                Use a newline to separate hero typography lines. Second line takes on the accent color!
              </span>
            </div>

            <div className="admin-field" style={{ marginTop: '16px' }}>
              <label>In-Depth Biography / About Story</label>
              <textarea
                rows={5}
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell recruiters and visitors about your craft, passions, and background..."
              />
            </div>

            <div className="admin-grid-2" style={{ marginTop: '16px' }}>
              <div className="admin-field">
                <label>Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Bhubaneswar, India"
                />
              </div>

              <div className="admin-field">
                <label>Availability Status Badge</label>
                <input
                  type="text"
                  value={profile.availability}
                  onChange={(e) => updateField('availability', e.target.value)}
                  placeholder="e.g. Available for Summer 2026 Internships"
                />
              </div>

              <div className="admin-field">
                <label>Public Contact Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="student10techxera@gmail.com"
                />
              </div>

              <div className="admin-field">
                <label>Phone / WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="admin-card-header" style={{ marginTop: '28px' }}>
              <div>
                <h2>Social & Professional Profiles</h2>
                <p>Provide links to your online presence.</p>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-field">
                <label>GitHub Profile URL</label>
                <input
                  type="url"
                  value={profile.github || ''}
                  onChange={(e) => updateField('github', e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="admin-field">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={profile.linkedin || ''}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="admin-field">
                <label>X / Twitter URL</label>
                <input
                  type="url"
                  value={profile.twitter || ''}
                  onChange={(e) => updateField('twitter', e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="admin-field">
                <label>Instagram / Extra Link</label>
                <input
                  type="url"
                  value={profile.instagram || ''}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: THEME & APPEARANCE
            =================================================================== */}
        {activeTab === 'theme' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Theme, Accents & Media Assets</h2>
                <p>Customize the portfolio's visual palette, layout mode, avatar, and resume.</p>
              </div>
            </div>

            <div className="admin-field">
              <label>Accent Color: {profile.accent}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={profile.accent}
                  onChange={(e) => updateField('accent', e.target.value)}
                  style={{ width: '48px', height: '38px', padding: 0, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={profile.accent}
                  onChange={(e) => updateField('accent', e.target.value)}
                  style={{ width: '120px' }}
                />
              </div>
              <div className="admin-swatches">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className={`admin-swatch ${profile.accent === hex ? 'active' : ''}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => updateField('accent', hex)}
                    title={`Set color ${hex}`}
                  />
                ))}
              </div>
            </div>

            <div className="admin-field" style={{ marginTop: '20px' }}>
              <label>Layout Style</label>
              <select
                value={profile.layout}
                onChange={(e) => updateField('layout', e.target.value as any)}
              >
                <option value="editorial">Editorial (Clean asymmetric modernism - Recommended)</option>
                <option value="centered">Centered (Balanced focus)</option>
                <option value="split">Split (Right-aligned contrast)</option>
              </select>
            </div>

            <div className="admin-grid-2" style={{ marginTop: '20px' }}>
              <div className="admin-field">
                <label>Profile Photo URL</label>
                <input
                  type="url"
                  value={profile.photo || ''}
                  onChange={(e) => updateField('photo', e.target.value)}
                  placeholder="https://... photo image link"
                />
                <span className="admin-field-help">
                  Paste an image link or leave empty to display high-contrast letter initials.
                </span>
              </div>

              <div className="admin-field">
                <label>Résumé / CV Document Link (PDF)</label>
                <input
                  type="url"
                  value={profile.resume || ''}
                  onChange={(e) => updateField('resume', e.target.value)}
                  placeholder="https://... resume PDF link"
                />
                <span className="admin-field-help">
                  Enables the "Download résumé" button on your portfolio.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: KEY STATS
            =================================================================== */}
        {activeTab === 'stats' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Key Quantitative Stats</h2>
                <p>Highlight your engineering metrics, years of experience, and project milestones.</p>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="admin-btn admin-btn-secondary"
              >
                <Plus size={14} /> Add Metric
              </button>
            </div>

            <div className="admin-toggle-field" style={{ marginBottom: '20px' }}>
              <span className="admin-toggle-label">Display Stats Bar on Portfolio</span>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={profile.showStats ?? true}
                  onChange={(e) => updateField('showStats', e.target.checked)}
                />
                <span className="admin-slider"></span>
              </label>
            </div>

            {statsList.map((st, i) => (
              <div key={i} className="admin-list-item">
                <div className="admin-list-item-header">
                  <span className="admin-list-item-title">Metric #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(i)}
                    className="admin-btn-icon danger"
                    title="Remove metric"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="admin-grid-3">
                  <div className="admin-field">
                    <label>Value / Number</label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => handleUpdateStat(i, 'value', e.target.value)}
                      placeholder="e.g. 3+, 45+, 9.2"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Label</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => handleUpdateStat(i, 'label', e.target.value)}
                      placeholder="e.g. Years Building"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Subtext</label>
                    <input
                      type="text"
                      value={st.subtext || ''}
                      onChange={(e) => handleUpdateStat(i, 'subtext', e.target.value)}
                      placeholder="e.g. Continuous shipping"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            TAB 4: SKILLS
            =================================================================== */}
        {activeTab === 'skills' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Technical & Engineering Skills</h2>
                <p>Manage your core technical capabilities, languages, frameworks, and proficiencies.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', minWidth: 0, width: '100%' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. Go, Docker, GraphQL, Kubernetes)..."
                className="admin-input"
                style={{ paddingLeft: '14px', flex: '1 1 auto', minWidth: 0 }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="admin-btn admin-btn-save"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                <Plus size={15} /> Add Skill
              </button>
            </div>

            <div className="admin-tags-wrap">
              {profile.skills.map((skill, i) => (
                <div key={i} className="admin-tag">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <span className="admin-field-help">
              Total: {profile.skills.length} skills listed. Click × on any skill to remove it.
            </span>
          </div>
        )}

        {/* ===================================================================
            TAB 5: PROJECTS
            =================================================================== */}
        {activeTab === 'projects' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Selected Works & Project Exhibition</h2>
                <p>Showcase your standout projects with live demos, code repos, and media.</p>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="admin-btn admin-btn-save"
              >
                <Plus size={15} /> Add Project
              </button>
            </div>

            {profile.projects.map((proj, i) => (
              <div key={i} className="admin-list-item">
                <div className="admin-list-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
                    <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="admin-list-item-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.title || 'Untitled Project'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      {proj.category} · {proj.year}
                    </span>
                  </div>

                  <div className="admin-item-actions">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => handleMoveProject(i, 'up')}
                      className="admin-btn-icon"
                      title="Move project up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={i === profile.projects.length - 1}
                      onClick={() => handleMoveProject(i, 'down')}
                      className="admin-btn-icon"
                      title="Move project down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(i)}
                      className="admin-btn-icon danger"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-field">
                    <label>Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(i, 'title', e.target.value)}
                      placeholder="Project Name"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Category / Domain</label>
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => handleUpdateProject(i, 'category', e.target.value)}
                      placeholder="e.g. Cloud & Distributed Systems, AI / ML"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Year Built</label>
                    <input
                      type="text"
                      value={proj.year}
                      onChange={(e) => handleUpdateProject(i, 'year', e.target.value)}
                      placeholder="2026"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Project Image / Poster URL</label>
                    <input
                      type="url"
                      value={proj.image || ''}
                      onChange={(e) => handleUpdateProject(i, 'image', e.target.value)}
                      placeholder="https://... cover image link"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Live Demo URL</label>
                    <input
                      type="url"
                      value={proj.url || ''}
                      onChange={(e) => handleUpdateProject(i, 'url', e.target.value)}
                      placeholder="https://yourproject.live"
                    />
                  </div>

                  <div className="admin-field">
                    <label>GitHub Repository URL</label>
                    <input
                      type="url"
                      value={proj.github || ''}
                      onChange={(e) => handleUpdateProject(i, 'github', e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="admin-field" style={{ marginTop: '12px' }}>
                  <label>Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={(proj.technologies || []).join(', ')}
                    onChange={(e) =>
                      handleUpdateProject(
                        i,
                        'technologies',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="e.g. Go, Redis, Docker, gRPC"
                  />
                </div>

                <div className="admin-field" style={{ marginTop: '12px' }}>
                  <label>Project In-Depth Description</label>
                  <textarea
                    rows={3}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(i, 'description', e.target.value)}
                    placeholder="Explain the motivation, engineering architecture, and measurable impact."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            TAB 6: JOURNEY (EXPERIENCE & EDUCATION)
            =================================================================== */}
        {activeTab === 'journey' && (
          <div>
            {/* Experience Section */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Work Experience & Internships</h2>
                  <p>Detail your software engineering roles, internships, and open-source contributions.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="admin-btn admin-btn-secondary"
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              <div className="admin-toggle-field" style={{ marginBottom: '20px' }}>
                <span className="admin-toggle-label">Show Experience Section on Portfolio</span>
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={profile.showExperience}
                    onChange={(e) => updateField('showExperience', e.target.checked)}
                  />
                  <span className="admin-slider"></span>
                </label>
              </div>

              {profile.experiences.map((exp, i) => (
                <div key={i} className="admin-list-item">
                  <div className="admin-list-item-header">
                    <span className="admin-list-item-title" style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.role || 'Role'} at {exp.company || 'Company'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(i)}
                      className="admin-btn-icon danger"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="admin-grid-3">
                    <div className="admin-field">
                      <label>Organization / Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(i, 'company', e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Role / Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(i, 'role', e.target.value)}
                        placeholder="e.g. Software Engineering Intern"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Timeline / Period</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => handleUpdateExperience(i, 'period', e.target.value)}
                        placeholder="e.g. May 2025 — Present"
                      />
                    </div>
                  </div>

                  <div className="admin-field" style={{ marginTop: '12px' }}>
                    <label>Accomplishments & Impact Description</label>
                    <textarea
                      rows={3}
                      value={exp.detail}
                      onChange={(e) => handleUpdateExperience(i, 'detail', e.target.value)}
                      placeholder="Describe what you built, technologies utilized, and quantifiable results achieved."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Academic Education</h2>
                  <p>Your university, degrees, coursework, and scholastic milestones.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="admin-btn admin-btn-secondary"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              <div className="admin-toggle-field" style={{ marginBottom: '20px' }}>
                <span className="admin-toggle-label">Show Education Section on Portfolio</span>
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={profile.showEducation}
                    onChange={(e) => updateField('showEducation', e.target.checked)}
                  />
                  <span className="admin-slider"></span>
                </label>
              </div>

              {profile.education.map((edu, i) => (
                <div key={i} className="admin-list-item">
                  <div className="admin-list-item-header">
                    <span className="admin-list-item-title" style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {edu.degree} - {edu.school}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(i)}
                      className="admin-btn-icon danger"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="admin-grid-3">
                    <div className="admin-field">
                      <label>Institution / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleUpdateEducation(i, 'school', e.target.value)}
                        placeholder="School or University Name"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Degree & Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(i, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech in Computer Science"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Duration / Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => handleUpdateEducation(i, 'period', e.target.value)}
                        placeholder="2023 — 2027"
                      />
                    </div>
                  </div>

                  <div className="admin-field" style={{ marginTop: '12px' }}>
                    <label>Academic Details, Honors & GPA</label>
                    <textarea
                      rows={2}
                      value={edu.detail}
                      onChange={(e) => handleUpdateEducation(i, 'detail', e.target.value)}
                      placeholder="Specialization, CGPA/GPA, leadership roles, or notable coursework."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 7: ACHIEVEMENTS
            =================================================================== */}
        {activeTab === 'achievements' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Achievements, Certifications & Honors</h2>
                <p>Certifications, hackathon wins, research papers, and competitive programming highlights.</p>
              </div>
              <button
                type="button"
                onClick={handleAddAchievement}
                className="admin-btn admin-btn-secondary"
              >
                <Plus size={14} /> Add Achievement
              </button>
            </div>

            <div className="admin-toggle-field" style={{ marginBottom: '20px' }}>
              <span className="admin-toggle-label">Show Achievements Section on Portfolio</span>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={profile.showAchievements}
                  onChange={(e) => updateField('showAchievements', e.target.checked)}
                />
                <span className="admin-slider"></span>
              </label>
            </div>

            {profile.achievements.map((ach, i) => (
              <div key={i} className="admin-list-item">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, width: '100%' }}>
                  <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={ach}
                    onChange={(e) => handleUpdateAchievement(i, e.target.value)}
                    className="admin-input"
                    style={{ paddingLeft: '14px', flex: '1 1 auto', minWidth: 0 }}
                    placeholder="e.g. AWS Certified Solutions Architect, Hackathon Winner..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(i)}
                    className="admin-btn-icon danger"
                    style={{ flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            TAB 8: RAW JSON EDITOR
            =================================================================== */}
        {activeTab === 'json' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>Direct JSON File Editor</h2>
                <p>
                  Inspect or directly edit the full <code>data/portfolio-data.json</code> structure.
                  Changes are validated and written straight to disk.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleApplyRawJson}
                  disabled={isSaving}
                  className="admin-btn admin-btn-save"
                >
                  <Save size={14} /> Validate & Save to File
                </button>
              </div>
            </div>

            {jsonError && (
              <div className="admin-error-alert" style={{ marginBottom: '14px' }}>
                <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                {jsonError}
              </div>
            )}

            <textarea
              className="admin-json-textarea"
              value={rawJsonText}
              onChange={(e) => {
                setRawJsonText(e.target.value);
                setJsonError(null);
              }}
              spellCheck={false}
            />
          </div>
        )}
      </main>

      {/* Toast Feedback */}
      {toast && (
        <div className={`admin-toast ${toast.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

