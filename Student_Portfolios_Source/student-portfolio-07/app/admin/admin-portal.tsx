'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile, Project } from '../../lib/portfolio';
import { sample } from '../../lib/sample';
import {
  Lock,
  User,
  LogOut,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  FolderGit2,
  Sparkles,
  Sliders,
  Code2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  ArrowUp,
  ArrowDown,
  Palette,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function AdminPortal() {
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [token, setToken] = useState<string | null>('admin-authorized');
  const [user, setUser] = useState<{ username: string; role: string }>({
    username: 'Administrator',
    role: 'admin',
  });

  // Profile / Projects state
  const [profile, setProfile] = useState<Profile>(sample);
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'journey' | 'appearance' | 'rawJson'>('projects');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(0);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Fetch current data on mount
  useEffect(() => {
    loadProjectsData();
  }, []);

  // Fetch current data from projects.json on hard drive
  const loadProjectsData = async (currentToken?: string) => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && data.name) {
          setProfile(data as Profile);
        }
      }
    } catch (err) {
      console.error('Failed to load projects.json:', err);
    }
  };

  // Instant save to projects.json on hard drive
  const handleSaveToDisk = async () => {
    setSaveStatus('saving');
    setSaveMessage('Sending updated data to local Node.js server...');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-authorized',
        },
        body: JSON.stringify(profile),
      });

      const result = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save projects data.');
      }

      setSaveStatus('saved');
      setSaveMessage(`Instant rewrite complete! projects.json updated on disk at ${new Date().toLocaleTimeString()}.`);
      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err.message || 'Error writing to projects.json file.');
    }
  };

  // Project item handlers
  const handleAddProject = () => {
    const newProject: Project = {
      title: 'New Project ' + (profile.projects.length + 1),
      category: 'Web development',
      description: 'Describe this project, key technical challenges solved, and results achieved.',
      url: 'https://example.com',
      image: '',
      year: new Date().getFullYear().toString(),
    };
    setProfile((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));
    setSelectedProjectIndex(0);
    setSaveStatus('idle');
  };

  const handleUpdateProject = (index: number, field: keyof Project, val: string) => {
    setProfile((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, projects: updated };
    });
    setSaveStatus('idle');
  };

  const handleDeleteProject = (index: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    if (selectedProjectIndex === index) {
      setSelectedProjectIndex(0);
    } else if (selectedProjectIndex && selectedProjectIndex > index) {
      setSelectedProjectIndex(selectedProjectIndex - 1);
    }
    setSaveStatus('idle');
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === profile.projects.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setProfile((prev) => {
      const copy = [...prev.projects];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, projects: copy };
    });
    setSelectedProjectIndex(targetIndex);
    setSaveStatus('idle');
  };

  // Education handlers
  const handleAddEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: 'University / College Name', degree: 'Degree Name', period: '2024 — 2028', detail: 'Coursework and honors' },
      ],
    }));
    setSaveStatus('idle');
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    setProfile((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
    setSaveStatus('idle');
  };

  const handleDeleteEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    setSaveStatus('idle');
  };

  // Experience handlers
  const handleAddExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: 'Company Name', role: 'Role / Title', period: '2025 — Present', detail: 'Key contributions and achievements' },
      ],
    }));
    setSaveStatus('idle');
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    setProfile((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
    setSaveStatus('idle');
  };

  const handleDeleteExperience = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
    setSaveStatus('idle');
  };

  // Skill tags
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill('');
    setSaveStatus('idle');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
    setSaveStatus('idle');
  };

  // Achievement handlers
  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setProfile((prev) => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement.trim()],
    }));
    setNewAchievement('');
    setSaveStatus('idle');
  };

  const handleRemoveAchievement = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
    setSaveStatus('idle');
  };

  // ADMIN DASHBOARD / EDITOR (Requirement 2 & 3)
  return (
    <div style={styles.dashboardContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.topBar}>
        <div style={styles.brandGroup}>
          <div style={styles.brandIcon}>
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <div style={styles.brandTitle}>
              Split Portfolio <span>/ Admin Control Center</span>
            </div>
            <div style={styles.brandPath}>
              <HardDrive size={13} style={{ marginRight: '5px' }} />
              Local Storage: <code>projects.json</code> on hard drive
            </div>
          </div>
        </div>

        <div style={styles.topActions}>
          <div style={styles.jwtStatusPill}>
            <span style={styles.activeDot} />
            JWT Session Active ({user.username})
          </div>

          <a href="/" target="_blank" rel="noreferrer" style={styles.secondaryButton}>
            <ExternalLink size={15} style={{ marginRight: '6px' }} />
            View Public Site
          </a>

          <button
            onClick={handleSaveToDisk}
            disabled={saveStatus === 'saving'}
            style={{
              ...styles.primarySaveButton,
              backgroundColor: saveStatus === 'saved' ? '#16a34a' : '#765126',
            }}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                Writing to Disk...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={16} style={{ marginRight: '8px' }} />
                Saved to projects.json
              </>
            ) : (
              <>
                <Save size={16} style={{ marginRight: '8px' }} />
                Save to Disk (projects.json)
              </>
            )}
          </button>

          <a href="/" style={styles.logoutButton} title="Return to Public Portfolio">
            <LogOut size={16} />
          </a>
        </div>
      </header>

      {/* Save Notification Banner */}
      {saveMessage && (
        <div
          style={{
            ...styles.alertBanner,
            backgroundColor: saveStatus === 'saved' ? '#f0fdf4' : saveStatus === 'error' ? '#fef2f2' : '#f8fafc',
            borderColor: saveStatus === 'saved' ? '#bbf7d0' : saveStatus === 'error' ? '#fecaca' : '#e2e8f0',
            color: saveStatus === 'saved' ? '#15803d' : saveStatus === 'error' ? '#b91c1c' : '#334155',
          }}
        >
          {saveStatus === 'saved' ? (
            <CheckCircle2 size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
          ) : saveStatus === 'error' ? (
            <AlertCircle size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
          ) : (
            <RefreshCw size={18} className="animate-spin" style={{ marginRight: '10px', flexShrink: 0 }} />
          )}
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Admin Body */}
      <div style={styles.mainLayout}>
        {/* Sidebar Tabs */}
        <aside style={styles.sidebar}>
          <div style={styles.userProfileCard}>
            <div
              style={{
                ...styles.userAvatar,
                backgroundColor: profile.accent || '#765126',
              }}
            >
              {profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'A'}
            </div>
            <div>
              <div style={styles.userName}>{profile.name || 'Student Portfolio'}</div>
              <div style={styles.userRole}>{profile.role || 'Admin'}</div>
            </div>
          </div>

          <nav style={styles.navMenu}>
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                ...styles.navItem,
                ...(activeTab === 'projects' ? styles.navItemActive : {}),
              }}
            >
              <FolderGit2 size={18} style={{ marginRight: '12px' }} />
              Projects ({profile.projects.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                ...styles.navItem,
                ...(activeTab === 'profile' ? styles.navItemActive : {}),
              }}
            >
              <User size={18} style={{ marginRight: '12px' }} />
              Profile & Bio
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              style={{
                ...styles.navItem,
                ...(activeTab === 'journey' ? styles.navItemActive : {}),
              }}
            >
              <GraduationCap size={18} style={{ marginRight: '12px' }} />
              Education & Journey
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              style={{
                ...styles.navItem,
                ...(activeTab === 'appearance' ? styles.navItemActive : {}),
              }}
            >
              <Palette size={18} style={{ marginRight: '12px' }} />
              Theme & Styling
            </button>

            <button
              onClick={() => setActiveTab('rawJson')}
              style={{
                ...styles.navItem,
                ...(activeTab === 'rawJson' ? styles.navItemActive : {}),
              }}
            >
              <Code2 size={18} style={{ marginRight: '12px' }} />
              Raw projects.json
            </button>
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.hardDriveNotice}>
              <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                <HardDrive size={14} style={{ marginRight: '6px' }} />
                Instant Disk Sync
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Every time you hit <strong>Save to Disk</strong>, the local Node.js server immediately rewrites <code>projects.json</code> sitting on your drive.
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main style={styles.contentArea}>
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Featured Projects</h2>
                  <p style={styles.panelSubtitle}>
                    Add, rearrange, and edit projects. Changes write directly to <code>projects.json</code>.
                  </p>
                </div>
                <button onClick={handleAddProject} style={styles.addButton}>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Add New Project
                </button>
              </div>

              <div style={styles.projectsContainer}>
                {profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.projectCard,
                      borderLeft: `5px solid ${profile.accent || '#765126'}`,
                    }}
                  >
                    <div style={styles.projectCardHeader}>
                      <div style={styles.projectNumberBadge}>#{String(idx + 1).padStart(2, '0')}</div>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                        placeholder="Project Title"
                        style={styles.projectTitleInput}
                      />
                      <div style={styles.projectOrderButtons}>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveProject(idx, 'up')}
                          style={styles.iconTinyButton}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={idx === profile.projects.length - 1}
                          onClick={() => handleMoveProject(idx, 'down')}
                          style={styles.iconTinyButton}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(idx)}
                          style={{ ...styles.iconTinyButton, color: '#ef4444' }}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={styles.projectGrid}>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Category</label>
                        <input
                          type="text"
                          value={proj.category}
                          onChange={(e) => handleUpdateProject(idx, 'category', e.target.value)}
                          placeholder="e.g. Web development, UI/UX"
                          style={styles.textInput}
                        />
                      </div>

                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Year</label>
                        <input
                          type="text"
                          value={proj.year}
                          onChange={(e) => handleUpdateProject(idx, 'year', e.target.value)}
                          placeholder="2026"
                          style={styles.textInput}
                        />
                      </div>

                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Live / GitHub URL</label>
                        <input
                          type="text"
                          value={proj.url}
                          onChange={(e) => handleUpdateProject(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          style={styles.textInput}
                        />
                      </div>

                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Cover Image URL</label>
                        <input
                          type="text"
                          value={proj.image}
                          onChange={(e) => handleUpdateProject(idx, 'image', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          style={styles.textInput}
                        />
                      </div>

                      <div style={{ ...styles.fieldItem, gridColumn: '1 / -1' }}>
                        <label style={styles.inputLabel}>Description & Impact</label>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                          placeholder="Detailed overview of what was built, challenges solved, and technologies applied."
                          style={styles.textArea}
                        />
                      </div>
                    </div>

                    {proj.image && (
                      <div style={styles.imagePreviewRow}>
                        <img src={proj.image} alt={proj.title} style={styles.thumbnail} />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Image preview</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & BIO */}
          {activeTab === 'profile' && (
            <div>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Profile & Bio Details</h2>
                  <p style={styles.panelSubtitle}>Configure your name, role, contact info, and skills list.</p>
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionSubtitle}>Personal Information</h3>
                <div style={styles.twoColumnGrid}>
                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Role / Subtitle</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Availability Status</label>
                    <input
                      type="text"
                      value={profile.availability}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={{ ...styles.fieldItem, gridColumn: '1 / -1' }}>
                    <label style={styles.inputLabel}>Main Headline (Multi-line supported)</label>
                    <textarea
                      rows={2}
                      value={profile.headline}
                      onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      style={styles.textArea}
                    />
                  </div>

                  <div style={{ ...styles.fieldItem, gridColumn: '1 / -1' }}>
                    <label style={styles.inputLabel}>Bio & Story</label>
                    <textarea
                      rows={5}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      style={styles.textArea}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionSubtitle}>Contact & Social Profiles</h3>
                <div style={styles.twoColumnGrid}>
                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Contact Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>WhatsApp / Mobile Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>GitHub Profile URL</label>
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={styles.fieldItem}>
                    <label style={styles.inputLabel}>Instagram Profile URL</label>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      style={styles.textInput}
                    />
                  </div>

                  <div style={{ ...styles.fieldItem, gridColumn: '1 / -1' }}>
                    <label style={styles.inputLabel}>Résumé Link (PDF)</label>
                    <input
                      type="text"
                      value={profile.resume}
                      onChange={(e) => setProfile({ ...profile, resume: e.target.value })}
                      placeholder="https://..."
                      style={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionSubtitle}>Skills & Toolkit ({profile.skills.length})</h3>
                <div style={styles.skillsTagWrapper}>
                  {profile.skills.map((skill, sIdx) => (
                    <span key={sIdx} style={styles.skillPill}>
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        style={styles.skillRemoveBtn}
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={styles.addSkillRow}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill (e.g. Next.js, Framer Motion)"
                    style={styles.textInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button onClick={handleAddSkill} style={styles.secondaryButton}>
                    <Plus size={16} style={{ marginRight: '6px' }} />
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JOURNEY (EDUCATION & EXPERIENCE) */}
          {activeTab === 'journey' && (
            <div>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Journey & Story</h2>
                  <p style={styles.panelSubtitle}>Education history, work experience, and honors.</p>
                </div>
              </div>

              {/* Education Section */}
              <div style={styles.formSection}>
                <div style={styles.sectionHeaderRow}>
                  <h3 style={styles.sectionSubtitle}>Education</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={profile.showEducation}
                        onChange={(e) => setProfile({ ...profile, showEducation: e.target.checked })}
                      />
                      Show on public site
                    </label>
                    <button onClick={handleAddEducation} style={styles.addButtonSmall}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Education
                    </button>
                  </div>
                </div>

                {profile.education.map((edu, idx) => (
                  <div key={idx} style={styles.subItemCard}>
                    <div style={styles.subItemHeader}>
                      <strong>Entry #{idx + 1}</strong>
                      <button
                        onClick={() => handleDeleteEducation(idx)}
                        style={styles.iconTinyButton}
                        title="Delete"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                    <div style={styles.twoColumnGrid}>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Institution / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Degree / Course</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Dates / Period</label>
                        <input
                          type="text"
                          value={edu.period}
                          onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Details & Activities</label>
                        <input
                          type="text"
                          value={edu.detail}
                          onChange={(e) => handleUpdateEducation(idx, 'detail', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience Section */}
              <div style={styles.formSection}>
                <div style={styles.sectionHeaderRow}>
                  <h3 style={styles.sectionSubtitle}>Experience & Internships</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={profile.showExperience}
                        onChange={(e) => setProfile({ ...profile, showExperience: e.target.checked })}
                      />
                      Show on public site
                    </label>
                    <button onClick={handleAddExperience} style={styles.addButtonSmall}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Experience
                    </button>
                  </div>
                </div>

                {profile.experiences.map((exp, idx) => (
                  <div key={idx} style={styles.subItemCard}>
                    <div style={styles.subItemHeader}>
                      <strong>Entry #{idx + 1}</strong>
                      <button
                        onClick={() => handleDeleteExperience(idx)}
                        style={styles.iconTinyButton}
                        title="Delete"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                    <div style={styles.twoColumnGrid}>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Company / Organization</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Dates / Period</label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                      <div style={styles.fieldItem}>
                        <label style={styles.inputLabel}>Details & Impact</label>
                        <input
                          type="text"
                          value={exp.detail}
                          onChange={(e) => handleUpdateExperience(idx, 'detail', e.target.value)}
                          style={styles.textInput}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements Section */}
              <div style={styles.formSection}>
                <div style={styles.sectionHeaderRow}>
                  <h3 style={styles.sectionSubtitle}>Highlights & Honors</h3>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={profile.showAchievements}
                      onChange={(e) => setProfile({ ...profile, showAchievements: e.target.checked })}
                    />
                    Show on public site
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {profile.achievements.map((ach, idx) => (
                    <div key={idx} style={styles.achievementRow}>
                      <span style={{ color: profile.accent || '#765126', fontWeight: 600 }}>#{idx + 1}</span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{ach}</span>
                      <button
                        onClick={() => handleRemoveAchievement(idx)}
                        style={styles.iconTinyButton}
                        title="Delete"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.addSkillRow}>
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add an achievement, award, or certification"
                    style={styles.textInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAchievement();
                      }
                    }}
                  />
                  <button onClick={handleAddAchievement} style={styles.secondaryButton}>
                    <Plus size={16} style={{ marginRight: '6px' }} /> Add Achievement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Theme & Appearance</h2>
                  <p style={styles.panelSubtitle}>Customize the portfolio accent color and heading layout.</p>
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionSubtitle}>Accent Color</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  This color tints heading accents, progress lines, button hover states, and project highlights.
                </p>

                <div style={styles.colorPalette}>
                  {[
                    '#765126',
                    '#3157eb',
                    '#9745d8',
                    '#c44426',
                    '#00796b',
                    '#bf3465',
                    '#1b637d',
                    '#32633b',
                    '#1e293b',
                  ].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setProfile({ ...profile, accent: hex })}
                      style={{
                        ...styles.colorSwatch,
                        backgroundColor: hex,
                        border: profile.accent === hex ? '3px solid #111827' : '2px solid transparent',
                        transform: profile.accent === hex ? 'scale(1.15)' : 'scale(1)',
                      }}
                      title={hex}
                    />
                  ))}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={styles.inputLabel}>Custom Hex:</label>
                  <input
                    type="color"
                    value={profile.accent}
                    onChange={(e) => setProfile({ ...profile, accent: e.target.value })}
                    style={{ width: '40px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    value={profile.accent}
                    onChange={(e) => setProfile({ ...profile, accent: e.target.value })}
                    style={{ ...styles.textInput, width: '120px' }}
                  />
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionSubtitle}>Heading Alignment</h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  {(['editorial', 'centered', 'split'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProfile({ ...profile, layout: mode })}
                      style={{
                        ...styles.layoutOptionCard,
                        borderColor: profile.layout === mode ? (profile.accent || '#765126') : '#e2e8f0',
                        backgroundColor: profile.layout === mode ? '#fdfbf7' : '#ffffff',
                      }}
                    >
                      <strong style={{ textTransform: 'capitalize' }}>{mode}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {mode === 'editorial' ? 'Left aligned (default)' : mode === 'centered' ? 'Center aligned' : 'Right aligned'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RAW JSON */}
          {activeTab === 'rawJson' && (
            <div>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Local projects.json Live File</h2>
                  <p style={styles.panelSubtitle}>
                    Real-time state serialized for <code>d:\...\projects.json</code> on your hard drive.
                  </p>
                </div>
                <button onClick={handleSaveToDisk} style={styles.primarySaveButton}>
                  <Save size={16} style={{ marginRight: '6px' }} />
                  Write Directly to Disk
                </button>
              </div>

              <div style={styles.jsonViewerBox}>
                <pre style={styles.jsonPre}>{JSON.stringify(profile, null, 2)}</pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Inline CSS Styles for Admin Portal
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#faf9f6',
    fontFamily: "'DM Sans', sans-serif",
  },
  loginBg: {
    minHeight: '100vh',
    backgroundColor: '#f3efe6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
    padding: '40px 32px',
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  iconBadge: {
    width: '56px',
    height: '56px',
    backgroundColor: '#765126',
    borderRadius: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 8px 16px rgba(118, 81, 38, 0.25)',
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1c1917',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  loginSubtitle: {
    fontSize: '14px',
    color: '#78716c',
    margin: 0,
    lineHeight: 1.5,
  },
  jwtBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '12px',
    padding: '4px 12px',
    borderRadius: '999px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: '12px',
    fontWeight: 600,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#44403c',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#a8a29e',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #d6d3d1',
    backgroundColor: '#fafaf9',
    color: '#1c1917',
    outline: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#a8a29e',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  credentialsHint: {
    backgroundColor: '#f5f5f4',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#57534e',
    border: '1px solid #e7e5e4',
    lineHeight: 1.5,
  },
  code: {
    backgroundColor: '#e7e5e4',
    padding: '2px 5px',
    borderRadius: '4px',
    color: '#1c1917',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px',
    backgroundColor: '#765126',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },
  loginFooter: {
    textAlign: 'center',
    marginTop: '24px',
  },
  backLink: {
    fontSize: '13px',
    color: '#78716c',
    textDecoration: 'none',
    fontWeight: 500,
  },

  // Dashboard Styles
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#fbfaf7',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', sans-serif",
    color: '#1c1917',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 28px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e7e5e4',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  brandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#765126',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#1c1917',
  },
  brandPath: {
    fontSize: '12px',
    color: '#78716c',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  jwtStatusPill: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
  },
  activeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    marginRight: '7px',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#f5f5f4',
    border: '1px solid #d6d3d1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#292524',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  primarySaveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  logoutButton: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  alertBanner: {
    padding: '12px 28px',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    flex: 1,
  },
  sidebar: {
    backgroundColor: '#f5f4ef',
    borderRight: '1px solid #e7e5e4',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  userProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
  },
  userAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '16px',
  },
  userName: {
    fontWeight: 700,
    fontSize: '14px',
  },
  userRole: {
    fontSize: '12px',
    color: '#78716c',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#57534e',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#ffffff',
    color: '#1c1917',
    fontWeight: 700,
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  sidebarFooter: {
    marginTop: 'auto',
  },
  hardDriveNotice: {
    backgroundColor: '#e7e5e4',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  contentArea: {
    padding: '32px 40px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 72px)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  panelTitle: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 6px',
    letterSpacing: '-0.02em',
  },
  panelSubtitle: {
    fontSize: '14px',
    color: '#78716c',
    margin: 0,
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 16px',
    backgroundColor: '#765126',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  addButtonSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: '#f5f5f4',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1c1917',
    cursor: 'pointer',
  },
  projectsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e7e5e4',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  },
  projectCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
    borderBottom: '1px solid #f5f5f4',
    paddingBottom: '14px',
  },
  projectNumberBadge: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#78716c',
    backgroundColor: '#f5f5f4',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  projectTitleInput: {
    flex: 1,
    fontSize: '17px',
    fontWeight: 700,
    border: '1px solid transparent',
    padding: '6px 10px',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'transparent',
  },
  projectOrderButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconTinyButton: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4',
    border: '1px solid #e7e5e4',
    borderRadius: '6px',
    color: '#57534e',
    cursor: 'pointer',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  fieldItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#57534e',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  textInput: {
    padding: '9px 12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #d6d3d1',
    backgroundColor: '#fafaf9',
    outline: 'none',
    color: '#1c1917',
  },
  textArea: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #d6d3d1',
    backgroundColor: '#fafaf9',
    outline: 'none',
    color: '#1c1917',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  imagePreviewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px dashed #e7e5e4',
  },
  thumbnail: {
    width: '64px',
    height: '42px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #d6d3d1',
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e7e5e4',
    marginBottom: '24px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    fontWeight: 700,
    margin: '0 0 16px',
    color: '#1c1917',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  skillsTagWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  skillPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#f5f5f4',
    border: '1px solid #e7e5e4',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 500,
  },
  skillRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#a8a29e',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: 0,
  },
  addSkillRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '10px',
  },
  subItemCard: {
    backgroundColor: '#fafaf9',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e7e5e4',
    marginBottom: '12px',
  },
  subItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '13px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#57534e',
    cursor: 'pointer',
  },
  achievementRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#fafaf9',
    border: '1px solid #e7e5e4',
    borderRadius: '8px',
  },
  colorPalette: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
  },
  layoutOptionCard: {
    flex: 1,
    padding: '16px',
    borderRadius: '8px',
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    textAlign: 'left',
  },
  jsonViewerBox: {
    backgroundColor: '#18181b',
    borderRadius: '12px',
    padding: '20px',
    overflowX: 'auto',
  },
  jsonPre: {
    color: '#e4e4e7',
    fontSize: '13px',
    fontFamily: "'DM Mono', monospace",
    lineHeight: 1.5,
    margin: 0,
  },
};
