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
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AdminPortal() {
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Profile / Projects state
  const [profile, setProfile] = useState<Profile>(sample);
  const [activeTab, setActiveTab] = useState<'projects' | 'bio' | 'skills' | 'theme' | 'rawJson'>('projects');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(0);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_jwt_token') : null;
        const res = await fetch('/api/admin/session', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.authenticated) {
            setUser(data.user);
            setToken(storedToken || 'cookie-session');
            await loadProjectsData(storedToken || undefined);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  // Fetch current data from projects.json on hard drive
  const loadProjectsData = async (currentToken?: string) => {
    try {
      const res = await fetch('/api/projects', {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      });
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

  // Login submission (JWT Token Authentication)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
        setLoggingIn(false);
        return;
      }

      // Store JWT token
      if (data.token) {
        localStorage.setItem('admin_jwt_token', data.token);
        setToken(data.token);
      }
      setUser(data.user || { username, role: 'admin' });
      await loadProjectsData(data.token);
    } catch (err: any) {
      setLoginError('Network error connecting to auth server: ' + err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('admin_jwt_token');
    setToken(null);
    setUser(null);
    setSaveStatus('idle');
  };

  // Instant save to projects.json on hard drive
  const handleSaveToDisk = async () => {
    setSaveStatus('saving');
    setSaveMessage('Sending updated data to local Node.js server...');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'cookie-session') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers,
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
      title: 'New Featured Project',
      category: 'Web development',
      description: 'Describe this project, key technical challenges solved, and results achieved.',
      url: 'https://example.com',
      image: '',
      year: new Date().getFullYear().toString(),
    };
    const updated = [newProject, ...profile.projects];
    setProfile({ ...profile, projects: updated });
    setSelectedProjectIndex(0);
  };

  const handleDeleteProject = (index: number) => {
    if (profile.projects.length <= 1) {
      alert('Portfolio should keep at least one project.');
      return;
    }
    const updated = profile.projects.filter((_, i) => i !== index);
    setProfile({ ...profile, projects: updated });
    setSelectedProjectIndex(0);
  };

  const handleUpdateProject = (index: number, field: keyof Project, val: string) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, projects: updated });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= profile.projects.length) return;
    const updated = [...profile.projects];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setProfile({ ...profile, projects: updated });
    setSelectedProjectIndex(target);
  };

  // Skill management
  const handleAddSkill = (skillText: string) => {
    const trimmed = skillText.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;
    setProfile({ ...profile, skills: [...profile.skills, trimmed] });
  };

  const handleRemoveSkill = (index: number) => {
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  if (checkingAuth) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={{ marginTop: '16px', color: '#6b7280', fontFamily: 'system-ui' }}>Verifying admin session...</p>
      </div>
    );
  }

  // LOGIN SCREEN (Unauthenticated)
  if (!user) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <div style={styles.lockIconBadge}>
              <Lock size={26} color="#1b637d" />
            </div>
            <h1 style={styles.authTitle}>Portfolio Administration</h1>
            <p style={styles.authSubtitle}>
              Sign in with your admin credentials to manage projects & profile content.
            </p>
          </div>

          {loginError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} style={{ marginRight: '8px', flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={15} style={{ marginRight: '6px' }} />
                Admin Email / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin email"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Lock size={15} style={{ marginRight: '6px' }} />
                Password
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  style={{ ...styles.input, paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loggingIn} style={styles.submitButton}>
              {loggingIn ? (
                <>
                  <div style={styles.btnSpinner}></div>
                  Authenticating JWT Token...
                </>
              ) : (
                <>
                  <Lock size={17} style={{ marginRight: '8px' }} />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>

          <div style={styles.authFooter}>
            <a href="/" style={styles.backLink}>
              ← Back to Public Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  const currentProject = selectedProjectIndex !== null ? profile.projects[selectedProjectIndex] : null;

  return (
    <div style={styles.dashboard}>
      {/* Top Navigation Bar */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.adminLogo}>
            <FolderGit2 size={20} color="#1b637d" />
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Student 06</span>
            <span style={styles.adminBadge}>Admin Portal</span>
          </div>

          <div style={styles.jwtStatusPill}>
            <span style={styles.livePulseDot}></span>
            <span>JWT Authenticated: <strong>{user.username}</strong></span>
          </div>

          <div style={styles.diskBadge}>
            <FileText size={14} color="#059669" />
            <span>Target: <code>projects.json</code> on Hard Drive</span>
          </div>
        </div>

        <div style={styles.topBarRight}>
          <a href="/" target="_blank" rel="noreferrer" style={styles.viewSiteButton}>
            <ExternalLink size={15} style={{ marginRight: '6px' }} />
            View Live Site
          </a>

          <button
            onClick={handleSaveToDisk}
            disabled={saveStatus === 'saving'}
            style={{
              ...styles.saveButton,
              backgroundColor: saveStatus === 'saved' ? '#059669' : '#1b637d',
            }}
          >
            {saveStatus === 'saving' ? (
              <>
                <div style={styles.btnSpinner}></div>
                Rewriting Disk...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={16} style={{ marginRight: '6px' }} />
                Saved to projects.json!
              </>
            ) : (
              <>
                <Save size={16} style={{ marginRight: '6px' }} />
                Save to projects.json
              </>
            )}
          </button>

          <button onClick={handleLogout} style={styles.logoutButton} title="Sign Out">
            <LogOut size={16} style={{ marginRight: '6px' }} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Save Notification Banner */}
      {saveMessage && (
        <div
          style={{
            ...styles.saveBanner,
            backgroundColor: saveStatus === 'error' ? '#fef2f2' : '#ecfdf5',
            color: saveStatus === 'error' ? '#991b1b' : '#065f46',
            borderColor: saveStatus === 'error' ? '#fecaca' : '#a7f3d0',
          }}
        >
          {saveStatus === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span style={{ marginLeft: '8px', fontWeight: 500 }}>{saveMessage}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <nav style={styles.tabNav}>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            ...styles.tabItem,
            ...(activeTab === 'projects' ? styles.tabItemActive : {}),
          }}
        >
          <Briefcase size={16} style={{ marginRight: '8px' }} />
          Projects List ({profile.projects.length})
        </button>

        <button
          onClick={() => setActiveTab('bio')}
          style={{
            ...styles.tabItem,
            ...(activeTab === 'bio' ? styles.tabItemActive : {}),
          }}
        >
          <User size={16} style={{ marginRight: '8px' }} />
          Profile & Biography
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          style={{
            ...styles.tabItem,
            ...(activeTab === 'skills' ? styles.tabItemActive : {}),
          }}
        >
          <GraduationCap size={16} style={{ marginRight: '8px' }} />
          Skills & Journey
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          style={{
            ...styles.tabItem,
            ...(activeTab === 'theme' ? styles.tabItemActive : {}),
          }}
        >
          <Sliders size={16} style={{ marginRight: '8px' }} />
          Theme & Visuals
        </button>

        <button
          onClick={() => setActiveTab('rawJson')}
          style={{
            ...styles.tabItem,
            ...(activeTab === 'rawJson' ? styles.tabItemActive : {}),
          }}
        >
          <Code2 size={16} style={{ marginRight: '8px' }} />
          Disk Preview (projects.json)
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContainer}>
        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div style={styles.projectsLayout}>
            {/* Project List Sidebar */}
            <div style={styles.projectSidebar}>
              <div style={styles.sidebarHeader}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Projects on File</h3>
                <button onClick={handleAddProject} style={styles.addProjectBtn}>
                  <Plus size={15} style={{ marginRight: '4px' }} />
                  Add Project
                </button>
              </div>

              <div style={styles.projectList}>
                {profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedProjectIndex(idx)}
                    style={{
                      ...styles.projectCard,
                      ...(selectedProjectIndex === idx ? styles.projectCardActive : {}),
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={styles.projectCardIndex}>Chapter 0{idx + 1} · {proj.year}</div>
                      <div style={styles.projectCardTitle}>{proj.title || 'Untitled Project'}</div>
                      <div style={styles.projectCardCategory}>{proj.category || 'General'}</div>
                    </div>

                    <div style={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveProject(idx, 'up')}
                        disabled={idx === 0}
                        style={styles.iconBtn}
                        title="Move Up"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => handleMoveProject(idx, 'down')}
                        disabled={idx === profile.projects.length - 1}
                        style={styles.iconBtn}
                        title="Move Down"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(idx)}
                        style={{ ...styles.iconBtn, color: '#dc2626' }}
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Project Editor */}
            {currentProject && selectedProjectIndex !== null && (
              <div style={styles.editorPanel}>
                <div style={styles.panelHeader}>
                  <div>
                    <span style={styles.sectionBadge}>Chapter 0{selectedProjectIndex + 1}</span>
                    <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 600 }}>
                      Editing: {currentProject.title}
                    </h2>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Changes apply immediately to <code>projects.json</code> upon clicking Save
                  </span>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Project Title</label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'title', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <input
                      type="text"
                      value={currentProject.category}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'category', e.target.value)}
                      placeholder="e.g. Web development, Product design"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year</label>
                    <input
                      type="text"
                      value={currentProject.year}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'year', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Live Demo / Repository URL</label>
                    <input
                      type="url"
                      value={currentProject.url}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'url', e.target.value)}
                      placeholder="https://example.com/project"
                      style={styles.input}
                    />
                  </div>

                  <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                    <label style={styles.label}>Project Image URL (Optional)</label>
                    <input
                      type="text"
                      value={currentProject.image}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'image', e.target.value)}
                      placeholder="https://... or /api/media/... (leave blank for abstract typographic art)"
                      style={styles.input}
                    />
                  </div>

                  <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                    <label style={styles.label}>Project Narrative & Description</label>
                    <textarea
                      rows={5}
                      value={currentProject.description}
                      onChange={(e) => handleUpdateProject(selectedProjectIndex, 'description', e.target.value)}
                      style={styles.textarea}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & BIO */}
        {activeTab === 'bio' && (
          <div style={styles.editorPanel}>
            <div style={styles.panelHeader}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Profile Details</h2>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Stored in <code>projects.json</code> root</span>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Professional Role</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Availability Status</label>
                <input
                  type="text"
                  value={profile.availability}
                  onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                  placeholder="e.g. Open to internships & collaborations"
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Hero Headline (Line breaks enabled)</label>
                <textarea
                  rows={2}
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Biography / Story</label>
                <textarea
                  rows={6}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>GitHub Profile URL</label>
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS & JOURNEY */}
        {activeTab === 'skills' && (
          <div style={styles.editorPanel}>
            <div style={styles.panelHeader}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Skills & Journey</h2>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Featured competencies, education and milestones</span>
            </div>

            {/* Skills Tags */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ ...styles.label, marginBottom: '8px' }}>Technical & Creative Skills</label>
              <div style={styles.skillTagList}>
                {profile.skills.map((skill, i) => (
                  <span key={i} style={styles.skillTag}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(i)}
                      style={styles.tagRemoveBtn}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '420px', marginTop: '12px' }}>
                <input
                  type="text"
                  id="new-skill-input"
                  placeholder="Type new skill and press Add"
                  style={styles.input}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.currentTarget;
                      handleAddSkill(target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-skill-input') as HTMLInputElement;
                    if (input) {
                      handleAddSkill(input.value);
                      input.value = '';
                    }
                  }}
                  style={styles.addSkillBtn}
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Education */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={styles.label}>
                  <GraduationCap size={16} style={{ marginRight: '6px' }} />
                  Education Details
                </label>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.showEducation}
                    onChange={(e) => setProfile({ ...profile, showEducation: e.target.checked })}
                  />
                  Display Education Section
                </label>
              </div>

              {profile.education.map((edu, idx) => (
                <div key={idx} style={styles.journeyCard}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Degree / Course</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[idx] = { ...updated[idx], degree: e.target.value };
                          setProfile({ ...profile, education: updated });
                        }}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Institution / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[idx] = { ...updated[idx], school: e.target.value };
                          setProfile({ ...profile, education: updated });
                        }}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Period</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[idx] = { ...updated[idx], period: e.target.value };
                          setProfile({ ...profile, education: updated });
                        }}
                        style={styles.input}
                      />
                    </div>
                    <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                      <label style={styles.label}>Coursework Details</label>
                      <input
                        type="text"
                        value={edu.detail}
                        onChange={(e) => {
                          const updated = [...profile.education];
                          updated[idx] = { ...updated[idx], detail: e.target.value };
                          setProfile({ ...profile, education: updated });
                        }}
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={styles.label}>
                  <Award size={16} style={{ marginRight: '6px' }} />
                  Highlights & Achievements
                </label>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.showAchievements}
                    onChange={(e) => setProfile({ ...profile, showAchievements: e.target.checked })}
                  />
                  Display Highlights Section
                </label>
              </div>

              {profile.achievements.map((ach, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={ach}
                    onChange={(e) => {
                      const updated = [...profile.achievements];
                      updated[idx] = e.target.value;
                      setProfile({ ...profile, achievements: updated });
                    }}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = profile.achievements.filter((_, i) => i !== idx);
                      setProfile({ ...profile, achievements: updated });
                    }}
                    style={{ ...styles.iconBtn, color: '#dc2626' }}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, achievements: [...profile.achievements, 'New milestone / certification'] })}
                style={{ ...styles.addProjectBtn, marginTop: '8px' }}
              >
                <Plus size={14} style={{ marginRight: '4px' }} />
                Add Milestone
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: THEME */}
        {activeTab === 'theme' && (
          <div style={styles.editorPanel}>
            <div style={styles.panelHeader}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Theme & Visual Styling</h2>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Configures appearance and layout format</span>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={profile.accent}
                    onChange={(e) => setProfile({ ...profile, accent: e.target.value })}
                    style={{ width: '50px', height: '42px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    value={profile.accent}
                    onChange={(e) => setProfile({ ...profile, accent: e.target.value })}
                    style={{ ...styles.input, maxWidth: '140px' }}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Accent Presets</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['#1b637d', '#0f766e', '#2563eb', '#7c3aed', '#db2777', '#d97706'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfile({ ...profile, accent: color })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: profile.accent.toLowerCase() === color.toLowerCase() ? '3px solid #000' : '1px solid #e5e7eb',
                        cursor: 'pointer',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Layout Variation</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  {[
                    { key: 'split', label: 'Split Chapters (Default for Portfolio 06)' },
                    { key: 'editorial', label: 'Editorial' },
                    { key: 'centered', label: 'Centered' },
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="layout"
                        value={item.key}
                        checked={profile.layout === item.key}
                        onChange={() => setProfile({ ...profile, layout: item.key as any })}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RAW JSON FILE PREVIEW */}
        {activeTab === 'rawJson' && (
          <div style={styles.editorPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Local projects.json Content</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Target file on hard drive: <code>d:\...\student-portfolio-06\projects.json</code>
                </p>
              </div>
              <button onClick={handleSaveToDisk} style={styles.saveButton}>
                <Save size={15} style={{ marginRight: '6px' }} />
                Instant Save to Disk
              </button>
            </div>

            <pre style={styles.jsonPreview}>
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

// STYLES
const styles: Record<string, React.CSSProperties> = {
  centerContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1b637d',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  btnSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    marginRight: '8px',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  authWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top, #1b3438 0%, #0d1b1d 100%)',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  authCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(16px)',
    borderRadius: '18px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
    padding: '36px 32px',
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '26px',
  },
  lockIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#e6f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  authTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
    letterSpacing: '-0.02em',
  },
  authSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  form: {
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
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.15s ease',
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  credentialPill: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    border: '1px solid #ccfbf1',
    color: '#0f766e',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    lineHeight: 1.4,
  },
  submitButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1b637d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
  authFooter: {
    textAlign: 'center',
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px solid #f3f4f6',
  },
  backLink: {
    fontSize: '13px',
    color: '#4b5563',
    textDecoration: 'none',
    fontWeight: 500,
  },
  dashboard: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  adminLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  jwtStatusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  livePulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'inline-block',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
  },
  diskBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  viewSiteButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  saveBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px',
    borderBottom: '1px solid',
    fontSize: '13px',
  },
  tabNav: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
  },
  tabItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabItemActive: {
    color: '#1b637d',
    borderBottomColor: '#1b637d',
    fontWeight: 600,
  },
  mainContainer: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  projectsLayout: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '24px',
  },
  projectSidebar: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    height: 'fit-content',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  addProjectBtn: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1b637d',
    backgroundColor: '#e6f2f5',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projectCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  projectCardActive: {
    borderColor: '#1b637d',
    backgroundColor: '#f0f7f9',
  },
  projectCardIndex: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
  },
  projectCardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '2px 0',
  },
  projectCardCategory: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  projectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  editorPanel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  sectionBadge: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#1b637d',
    backgroundColor: '#e6f2f5',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    backgroundColor: '#fff',
  },
  skillTagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  skillTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: 500,
  },
  tagRemoveBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '16px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  addSkillBtn: {
    padding: '10px 16px',
    backgroundColor: '#1b637d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  journeyCard: {
    padding: '18px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  jsonPreview: {
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    padding: '18px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: 1.6,
    overflowX: 'auto',
    maxHeight: '520px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  },
};
