'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Frame,
  Reveal,
  Title,
  Photo,
  Art,
  Skills,
  Contact,
  Journey,
  hasJourney,
  EmptyWork,
  motion,
  AnimatePresence,
  ArrowUpRight,
  number,
  ProjectDialog,
  useFolio,
  type Props,
  type Project,
} from './portfolio-kit';
import { safeUrl } from '../lib/portfolio';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  Clock,
  MapPin,
  Mail,
  Send,
  Copy,
  Check,
  Download,
  ChevronUp,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  MessageSquare,
  Compass,
  ArrowDown,
  Layers,
  Code as CodeIcon,
  Sun,
  Moon,
  Volume2,
  CheckCircle2,
} from 'lucide-react';

// ─── BRAND & SOCIAL ICONS ───────────────────────────────────────────────────
function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function BehanceIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.8 12.3c.7-.3 1.2-.8 1.6-1.5.4-.7.6-1.5.6-2.4 0-1.2-.4-2.2-1.3-3-.9-.7-2.1-1.1-3.6-1.1H0v15.4h5.4c1.7 0 3-.4 4-1.2 1-.8 1.5-2 1.5-3.5 0-1.1-.3-2-.9-2.7zm-4.7-5.5h1.9c.7 0 1.2.2 1.6.5.4.3.6.8.6 1.4 0 .6-.2 1.1-.6 1.4-.4.3-1 .5-1.7.5H3.1V6.8zm2.2 10.3H3.1v-3.7h2.2c.8 0 1.4.2 1.8.6.4.4.6.9.6 1.5 0 .6-.2 1.1-.6 1.4-.4.2-1 .2-1.8.2zm11-12.8h4.4v1.5h-4.4V4.3zm6.6 9.4c0-1.6-.4-3-1.3-4.1-.9-1.1-2.2-1.6-3.8-1.6-1.5 0-2.8.5-3.8 1.6-.9 1.1-1.4 2.5-1.4 4.1 0 1.7.5 3.1 1.4 4.1 1 1 2.3 1.5 4 1.5 1.4 0 2.6-.4 3.5-1.2.9-.8 1.4-1.8 1.6-3h-2.5c-.2.5-.5.9-.9 1.2-.4.3-1 .4-1.7.4-.9 0-1.6-.3-2.1-.8-.5-.5-.8-1.3-.8-2.2h9.1v-.1zm-6.7-1.8c.1-.8.3-1.4.7-1.8.4-.4.9-.7 1.6-.7.6 0 1.2.2 1.6.6.4.4.7 1 .8 1.9h-4.7z" />
    </svg>
  );
}

function DribbbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </svg>
  );
}

// ─── MASTHEAD THEME TOGGLE BUTTON ──────────────────────────────────────────
function MastheadThemeToggle() {
  const { themeMode, toggleTheme } = useFolio();
  const isDark = themeMode === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`masthead-theme-switch ${isDark ? 'dark' : 'light'}`}
      aria-label={`Switch to ${isDark ? 'Morning' : 'Evening'} edition`}
      title={`Currently reading ${isDark ? 'Evening Edition' : 'Morning Edition'}. Click to toggle.`}
    >
      <div className="switch-track">
        <motion.div
          className="switch-thumb"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <Moon size={12} className="thumb-icon moon" />
          ) : (
            <Sun size={12} className="thumb-icon sun" />
          )}
        </motion.div>
      </div>
      <span className="switch-text">
        {isDark ? 'Evening' : 'Morning'}
      </span>
    </button>
  );
}

// ─── INNER JOURNAL COMPONENT (WITH FOLIO CONTEXT) ───────────────────────────
function JournalContent({ profile: p, preview }: Props) {
  const { themeMode, toggleTheme } = useFolio();

  // Rotating Headline Keywords
  const rotatingWords = [
    'Human Empathy',
    'Interaction Physics',
    'Design Systems',
    'Tangible Products',
    'Fluid Motion',
  ];
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2900);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  // Navigation & Interactive states
  const [expanded, setExpanded] = useState<number | null>(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'accordion' | 'grid'>('accordion');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);

  // Dispatch composer state
  const [dispatchName, setDispatchName] = useState('');
  const [dispatchEmail, setDispatchEmail] = useState('');
  const [dispatchTopic, setDispatchTopic] = useState('Summer Internship / Project');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchCopied, setDispatchCopied] = useState(false);

  // Compute unique categories from projects
  const categories = useMemo(() => {
    const list = p.projects.map((x) => x.category?.trim()).filter(Boolean);
    return ['All', ...Array.from(new Set(list))];
  }, [p.projects]);

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return p.projects.filter((item) => {
      const matchCategory =
        activeCategory === 'All' ||
        item.category?.toLowerCase() === activeCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);
      const matchSkill =
        !activeSkillFilter ||
        item.title?.toLowerCase().includes(activeSkillFilter.toLowerCase()) ||
        item.category?.toLowerCase().includes(activeSkillFilter.toLowerCase()) ||
        item.description?.toLowerCase().includes(activeSkillFilter.toLowerCase());
      return matchCategory && matchSearch && matchSkill;
    });
  }, [p.projects, activeCategory, searchQuery, activeSkillFilter]);

  // Copy email handler
  const copyEmailToClipboard = () => {
    if (!p.email) return;
    navigator.clipboard.writeText(p.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Dispatch composer copy handler
  const copyDispatchNote = () => {
    const letter = `Subject: ${dispatchTopic}\nFrom: ${dispatchName || 'Visitor'} (${dispatchEmail || 'No email provided'})\nTo: ${p.name} <${p.email}>\n\nMessage:\n${dispatchMessage}`;
    navigator.clipboard.writeText(letter);
    setDispatchCopied(true);
    setTimeout(() => setDispatchCopied(false), 2500);
  };

  // Mailto link for dispatch composer
  const mailtoLink = useMemo(() => {
    if (!p.email) return '#contact';
    const sub = encodeURIComponent(
      `[B.Tech Design Dispatch] ${dispatchTopic} - from ${dispatchName || 'Visitor'}`
    );
    const body = encodeURIComponent(
      `Hello ${p.name},\n\n${dispatchMessage}\n\nBest regards,\n${dispatchName}\n${dispatchEmail}`
    );
    return `mailto:${p.email}?subject=${sub}&body=${body}`;
  }, [p.email, p.name, dispatchTopic, dispatchName, dispatchEmail, dispatchMessage]);

  // Split bio for editorial Drop Cap
  const bioFirstLetter = p.bio?.trim().charAt(0) || '';
  const bioRest = p.bio?.trim().slice(1) || '';

  return (
    <>
      {/* ─── CLEAN TOP HEADER BAR (FIXED/STICKY AT PAGE TOP) ────────── */}
      <header className="home-top-header-bar" id="top-header">
        <div className="header-bar-inner">
          {/* Brand Identity / Home Anchor */}
          <a href="#home" className="header-brand-box">
            <span className="brand-dot" aria-hidden="true" />
            <div className="brand-titles">
              <strong className="brand-name">{p.name}</strong>
              <span className="brand-role">B.Tech in Design</span>
            </div>
          </a>

          {/* Clean Central Navigation */}
          <nav className="header-nav-menu" aria-label="Main Navigation">
            <a href="#home" className="header-nav-link active">Home</a>
            <a href="#about" className="header-nav-link">About</a>
            <a href="#projects" className="header-nav-link">Projects</a>
            <a href="#skills" className="header-nav-link">Skills</a>
            <a href="#contact" className="header-nav-link">Contact</a>
          </nav>

          {/* Header Actions: Résumé & Theme Switcher */}
          <div className="header-actions-group">
            {safeUrl(p.resume) && (
              <a href={safeUrl(p.resume)} target="_blank" rel="noreferrer" className="header-resume-pill" title="Download CV">
                <FileText size={13} />
                <span>Résumé</span>
              </a>
            )}

            {/* Edition Theme Toggle */}
            <MastheadThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────── */}
      <main id="top" className="journal-main-flow">
        {/* ─── SECTION I: HOME (REDESIGNED ANIMATED B.TECH DESIGN HERO) ── */}
        <section id="home" className="design-architect-hero" aria-labelledby="hero-title">
          <div className="hero-grid-split">
            {/* Left Column: Kinetic Typography, Bio & Actions */}
            <div className="hero-content-col">
              {/* Kinetic Animated Headline with Rotating Keyword Ticker */}
              <motion.h1
                id="hero-title"
                className="hero-kinetic-title"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Designing digital systems where{' '}
                <span className="rotator-inline-box">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingIndex}
                      initial={{ y: 26, opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -26, opacity: 0, filter: 'blur(6px)' }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      className="rotator-highlight-word"
                    >
                      {rotatingWords[rotatingIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>{' '}
                meets thoughtful code.
              </motion.h1>

              {/* Lead Summary - Single crisp line */}
              <motion.p
                className="hero-narrative-summary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {p.headline ||
                  'Crafting human-centered digital experiences, design systems, and frontend craft.'}
              </motion.p>

              {/* Hero Action Buttons */}
              <motion.div
                className="hero-button-row"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32 }}
              >
                <a href="#projects" className="hero-btn-primary">
                  <span>Explore Projects</span>
                  <ArrowDown size={15} className="btn-icon-move" />
                </a>

                <a href="#contact" className="hero-btn-secondary">
                  <span>Write a Letter</span>
                  <ArrowUpRight size={15} className="btn-icon-move" />
                </a>

                {safeUrl(p.resume) && (
                  <a
                    href={safeUrl(p.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="hero-btn-ghost"
                  >
                    <FileText size={15} />
                    <span>Résumé</span>
                  </a>
                )}
              </motion.div>

              {/* Metrics Strip without dividing separator lines */}
              <motion.div
                className="hero-stats-band"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="stat-unit">
                  <span className="unit-number">{number(p.projects.length - 1)}</span>
                  <span className="unit-label">Case Studies</span>
                </div>
                <div className="stat-unit">
                  <span className="unit-number">{number(p.skills.length - 1)}</span>
                  <span className="unit-label">Disciplines</span>
                </div>
                <div className="stat-unit">
                  <span className="unit-number">8.9</span>
                  <span className="unit-label">NIT CGPA</span>
                </div>
                <div className="stat-unit">
                  <span className="unit-number">2026</span>
                  <span className="unit-label">Class Cohort</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Student Portrait Visual Frame */}
            <div className="hero-visual-col">
              <div className="studio-canvas-container">
                {/* Ambient Soft Glow Behind Photo */}
                <div className="canvas-glow-orb orb-alpha" aria-hidden="true" />
                <div className="canvas-glow-orb orb-beta" aria-hidden="true" />

                {/* Editorial Student Portrait Showcase */}
                <motion.div
                  className="student-portrait-card"
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="portrait-image-wrapper">
                    <img
                      src={safeUrl(p.photo) || '/student-portrait.jpg'}
                      alt={p.name}
                      className="student-main-portrait"
                    />
                    <div className="portrait-gradient-overlay" />

                    {/* Floating Info Pill on Portrait */}
                    <div className="portrait-info-pill">
                      <span className="portrait-status-dot" />
                      <div className="portrait-pill-text">
                        <strong>{p.name}</strong>
                        <small>B.Tech in Design · {p.location || 'India'}</small>
                      </div>
                    </div>

                    {/* Edition Marker */}
                    <div className="portrait-edition-tag">
                      <span>2026 Cohort</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Floating Scroll Prompt */}
          <div className="hero-scroll-indicator-wrap">
            <a href="#about" className="scroll-indicator-link" aria-label="Scroll down to about section">
              <span className="scroll-mouse-track">
                <span className="scroll-wheel-pip" />
              </span>
              <span className="scroll-text">Scroll to explore</span>
            </a>
          </div>
        </section>

        {/* ─── SECTION II: ABOUT (BEHIND THE PAGES) ─────────────── */}
        <section id="about" className="journal-about" aria-labelledby="about-heading">
          <div className="journal-section-head">
            <div className="section-title-wrap">
              <span className="chapter-marker">Section II · Background & Pedigree</span>
              <h2 id="about-heading">About the Designer</h2>
            </div>
            <span className="section-subtext">The Author's Statement & Academic Path</span>
          </div>

          <div className="journal-columns">
            {/* Left: Author's Note with Drop Cap */}
            <Reveal className="journal-author-col">
              <div className="col-header">
                <h3>Design Philosophy & Purpose</h3>
                <span className="col-sub">B.Tech in Design Undergraduate Perspective</span>
              </div>

              <div className="journal-bio-text">
                <p className="bio-lead">
                  <span className="journal-drop-cap">{bioFirstLetter}</span>
                  {bioRest}
                </p>
              </div>

              <div className="author-footnote">
                <div className="footnote-item">
                  <strong>Location:</strong> {p.location || 'India'}
                </div>
                <div className="footnote-item">
                  <strong>Degree:</strong> B.Tech in Design (2022 — 2026)
                </div>
                <div className="footnote-item">
                  <strong>Availability:</strong> {p.availability}
                </div>
              </div>
            </Reveal>

            {/* Right: Quick Disciplines Highlight */}
            <Reveal delay={0.1} className="journal-toolkit-col">
              <div className="col-header">
                <h3>Core Competencies</h3>
                <span className="col-sub">Click any skill to filter projects</span>
              </div>

              <div className="skills-editorial-grid">
                {p.skills.filter(Boolean).map((skill, i) => {
                  const isMatching = activeSkillFilter === skill;
                  return (
                    <button
                      key={i}
                      className={`journal-skill-pill ${isMatching ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSkillFilter(isMatching ? null : skill);
                        const el = document.getElementById('projects');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      title={`Filter projects with ${skill}`}
                    >
                      <Sparkles size={13} className="skill-sparkle" />
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="toolkit-note">
                <p>
                  * Rigorously tested in studio courses, design sprints, and responsive web deployments.
                </p>
              </div>
            </Reveal>
          </div>

          {/* ─── CHRONICLES / TIMELINE SPREAD ─────────────────── */}
          {hasJourney(p) && (
            <div id="chronicles" className="journal-chronicles-spread">
              <div className="chronicles-masthead">
                <span className="chronicles-label">Academic & Professional Journey</span>
                <h3>Education, Experience & Milestones</h3>
              </div>

              <div className="chronicles-grid">
                {/* Education Column */}
                {p.showEducation && p.education.length > 0 && (
                  <div className="chronicles-column">
                    <div className="chronicle-head">
                      <GraduationCap size={18} />
                      <h4>Academic Pedigree</h4>
                    </div>

                    <div className="chronicle-items">
                      {p.education.map((edu, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                          <article className="chronicle-entry">
                            <span className="chronicle-beacon" aria-hidden="true" />
                            <span className="chronicle-period">{edu.period}</span>
                            <h5>{edu.degree}</h5>
                            <p className="chronicle-org">{edu.school}</p>
                            <p className="chronicle-detail">{edu.detail}</p>
                          </article>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Column */}
                {p.showExperience && p.experiences.length > 0 && (
                  <div className="chronicles-column">
                    <div className="chronicle-head">
                      <Briefcase size={18} />
                      <h4>Design Experience & Roles</h4>
                    </div>

                    <div className="chronicle-items">
                      {p.experiences.map((exp, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                          <article className="chronicle-entry">
                            <span className="chronicle-beacon" aria-hidden="true" />
                            <span className="chronicle-period">{exp.period}</span>
                            <h5>{exp.role}</h5>
                            <p className="chronicle-org">{exp.company}</p>
                            <p className="chronicle-detail">{exp.detail}</p>
                          </article>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements / Honors Ribbon */}
              {p.showAchievements && p.achievements.filter(Boolean).length > 0 && (
                <div className="journal-honors-ribbon">
                  <div className="honors-head">
                    <Award size={18} />
                    <h4>Honors, Hackathons & Community Distinctions</h4>
                  </div>
                  <div className="honors-list">
                    {p.achievements.filter(Boolean).map((ach, i) => (
                      <Reveal key={i} delay={i * 0.07}>
                        <div className="honor-entry shimmer-card">
                          <span className="honor-medal">No. {number(i)}</span>
                          <p>{ach}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─── SECTION III: PROJECTS (SELECTED STORIES) ─────────── */}
        <section id="projects" className="journal-work" aria-labelledby="work-heading">
          {/* Backwards-compatibility anchor for #work */}
          <div id="work" />

          <div className="journal-section-head">
            <div className="section-title-wrap">
              <span className="chapter-marker">Section III · Featured Portfolio</span>
              <h2 id="work-heading">Selected Projects & Case Studies</h2>
            </div>

            <div className="journal-controls">
              {/* Search Bar */}
              <div className="journal-search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects, categories, keywords…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="journal-search-input"
                  aria-label="Search projects"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="clear-search-btn"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* View Switcher: Story Fold vs Grid */}
              <div
                className="journal-view-toggle"
                role="radiogroup"
                aria-label="Project view mode"
              >
                <button
                  className={`view-btn ${viewMode === 'accordion' ? 'active' : ''}`}
                  onClick={() => setViewMode('accordion')}
                  title="Case Studies Fold (Accordion)"
                  aria-label="Story fold view"
                >
                  <List size={16} />
                  <span>Stories</span>
                </button>
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Gallery Grid"
                  aria-label="Gallery grid view"
                >
                  <LayoutGrid size={16} />
                  <span>Gallery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="journal-category-bar">
            <div className="category-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveSkillFilter(null);
                  }}
                >
                  {cat}
                  <span className="category-count">
                    {cat === 'All'
                      ? p.projects.length
                      : p.projects.filter((x) => x.category?.trim() === cat).length}
                  </span>
                </button>
              ))}
              {activeSkillFilter && (
                <button
                  className="category-pill active skill-filter-pill"
                  onClick={() => setActiveSkillFilter(null)}
                  title="Remove skill filter"
                >
                  Filtered by: <strong>{activeSkillFilter}</strong>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Project List / Grid */}
          {filteredProjects.length > 0 ? (
            viewMode === 'accordion' ? (
              /* ACCORDION VIEW */
              <div className="journal-stories-accordion">
                {filteredProjects.map((project, idx) => {
                  const isExpanded = expanded === idx;
                  return (
                    <article
                      className={`journal-article ${isExpanded ? 'expanded' : ''}`}
                      key={project.title + idx}
                    >
                      <button
                        className="journal-article-toggle"
                        onClick={() => setExpanded(isExpanded ? null : idx)}
                        aria-expanded={isExpanded}
                        aria-controls={`story-${idx}`}
                      >
                        <span className="story-idx">{number(idx)}</span>

                        <div className="story-header-text">
                          <div className="story-meta-tags">
                            <span className="story-cat-tag">{project.category}</span>
                            <span className="story-bullet">·</span>
                            <span className="story-year-tag">{project.year}</span>
                          </div>
                          <h3>{project.title}</h3>
                        </div>

                        <span className={`journal-plus ${isExpanded ? 'rotated' : ''}`} aria-hidden="true">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={`story-${idx}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                            className="journal-article-body"
                          >
                            <div className="article-body-inner">
                              <div
                                className="story-art-container"
                                onClick={() => setSelectedProject(project)}
                                role="button"
                                tabIndex={0}
                                title="Click to view full preview"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setSelectedProject(project);
                                }}
                              >
                                <Art project={project} index={idx} />
                                <span className="art-inspect-badge">Inspect Case Study ↗</span>
                              </div>

                              <div className="story-description-wrap">
                                <p className="story-desc">
                                  {project.description ||
                                    'An ambitious study exploring modern digital interfaces, usability patterns, and responsive layout.'}
                                </p>

                                <div className="story-actions">
                                  {safeUrl(project.url) && (
                                    <a
                                      className="journal-read"
                                      href={safeUrl(project.url)}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Explore repository / project <ArrowUpRight size={17} />
                                    </a>
                                  )}
                                  <button
                                    className="journal-inspect-btn"
                                    onClick={() => setSelectedProject(project)}
                                  >
                                    View case study details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW */
              <motion.div
                className="journal-grid-view"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
              >
                {filteredProjects.map((project, idx) => (
                  <motion.article
                    className="journal-story-card"
                    key={project.title + idx}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="story-card-art">
                      <Art project={project} index={idx} />
                      <div className="story-card-overlay">
                        <span>
                          Inspect Story <ArrowUpRight size={16} />
                        </span>
                      </div>
                    </div>

                    <div className="story-card-content">
                      <div className="story-card-meta">
                        <span className="card-cat">{project.category}</span>
                        <span className="card-year">{project.year}</span>
                      </div>
                      <h3 className="story-card-title">{project.title}</h3>
                      <p className="story-card-desc">
                        {project.description || 'Details for this story coming soon.'}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )
          ) : (
            <div className="journal-empty-filter">
              <Compass size={36} className="empty-icon" />
              <h3>No projects match your filter</h3>
              <p>Try searching for a different term or clearing your active category filter.</p>
              <button
                className="journal-btn primary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setActiveSkillFilter(null);
                }}
              >
                Reset all filters
              </button>
            </div>
          )}
        </section>

        {/* ─── SECTION IV: SKILLS & DESIGN TOOLKIT ──────────────── */}
        <section id="skills" className="journal-skills-section" aria-labelledby="skills-heading">
          <div className="journal-section-head">
            <div className="section-title-wrap">
              <span className="chapter-marker">Section IV · Technical & Creative Stack</span>
              <h2 id="skills-heading">Skills & Design Capabilities</h2>
            </div>
            <span className="section-subtext">Click any skill to filter projects above</span>
          </div>

          <p className="skills-section-lead">
            Curated through specialized B.Tech in Design coursework, studio critiques, software engineering labs, and production-ready deployments.
          </p>

          <div className="skills-discipline-cards">
            {/* UI/UX & Interaction Design */}
            <div className="discipline-card">
              <div className="discipline-head">
                <Layers size={18} className="discipline-icon" />
                <h3>UI/UX & Product Design</h3>
              </div>
              <p className="discipline-desc">
                Crafting human-centered architectures, systematic components, wireframes, and intuitive interaction physics.
              </p>
              <div className="discipline-tags">
                {[
                  'UI/UX Design',
                  'Interaction Design',
                  'Design Systems',
                  'Wireframing & Prototyping',
                  'Information Architecture',
                  'Usability Testing',
                ].map((skill) => (
                  <button
                    key={skill}
                    className={`skill-tag-badge ${activeSkillFilter === skill ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSkillFilter(activeSkillFilter === skill ? null : skill);
                      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={`Filter projects with ${skill}`}
                  >
                    <Sparkles size={11} />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frontend & Creative Code */}
            <div className="discipline-card">
              <div className="discipline-head">
                <CodeIcon size={18} className="discipline-icon" />
                <h3>Frontend & Creative Engineering</h3>
              </div>
              <p className="discipline-desc">
                Bridging mockups to production code with responsive components, accessible interactions, and performant state.
              </p>
              <div className="discipline-tags">
                {[
                  'React & Next.js',
                  'TypeScript',
                  'Tailwind CSS',
                  'Creative Coding & Canvas',
                  'JavaScript',
                  'HTML5 & CSS3',
                ].map((skill) => (
                  <button
                    key={skill}
                    className={`skill-tag-badge ${activeSkillFilter === skill ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSkillFilter(activeSkillFilter === skill ? null : skill);
                      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={`Filter projects with ${skill}`}
                  >
                    <Sparkles size={11} />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Tools & Software */}
            <div className="discipline-card">
              <div className="discipline-head">
                <Compass size={18} className="discipline-icon" />
                <h3>Design Tools & Suites</h3>
              </div>
              <p className="discipline-desc">
                Proficiency in modern industry tools for vector design, design system tokens, 3D modeling, and motion.
              </p>
              <div className="discipline-tags">
                {[
                  'Figma & FigJam',
                  'Adobe Illustrator',
                  'Adobe Photoshop',
                  'After Effects',
                  'Framer',
                  'Blender',
                ].map((skill) => (
                  <button
                    key={skill}
                    className={`skill-tag-badge ${activeSkillFilter === skill ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSkillFilter(activeSkillFilter === skill ? null : skill);
                      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={`Filter projects with ${skill}`}
                  >
                    <Sparkles size={11} />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Human Factors & Research */}
            <div className="discipline-card">
              <div className="discipline-head">
                <BookOpen size={18} className="discipline-icon" />
                <h3>Research & Design Methods</h3>
              </div>
              <p className="discipline-desc">
                Cognitive ergonomics, qualitative interviews, usability testing, and data-driven product validation.
              </p>
              <div className="discipline-tags">
                {[
                  'User Research',
                  'Cognitive Ergonomics',
                  'Design Thinking',
                  'Heuristic Evaluation',
                  'Design Sprints',
                  'Accessibility (a11y)',
                ].map((skill) => (
                  <button
                    key={skill}
                    className={`skill-tag-badge ${activeSkillFilter === skill ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSkillFilter(activeSkillFilter === skill ? null : skill);
                      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={`Filter projects with ${skill}`}
                  >
                    <Sparkles size={11} />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION V: CONTACT & SOCIAL MEDIA TAGS ─────────── */}
        <footer id="contact" className="journal-contact" aria-labelledby="contact-heading">
          <div className="contact-masthead">
            <span className="chapter-marker">Section V · Correspondence & Contact</span>
            <h2 id="contact-heading">
              A new design story<br />starts with hello.
            </h2>
            <p className="contact-invitation">
              Open to summer design internships, product design collaborations, and creative engineering opportunities.
              Whether discussing typography, design systems, or prospective roles, feel free to reach out.
            </p>
          </div>

          <div className="correspondence-container">
            {/* Quick Dispatch Composer */}
            <div className="dispatch-composer-box">
              <div className="composer-head">
                <MessageSquare size={16} />
                <h3>Dispatch a Quick Letter</h3>
              </div>

              <div className="composer-form">
                <div className="composer-row">
                  <div className="composer-field">
                    <label htmlFor="dispatch-name">Your Name</label>
                    <input
                      id="dispatch-name"
                      type="text"
                      placeholder="e.g. Priyanshu Mehta"
                      value={dispatchName}
                      onChange={(e) => setDispatchName(e.target.value)}
                    />
                  </div>

                  <div className="composer-field">
                    <label htmlFor="dispatch-email">Your Email</label>
                    <input
                      id="dispatch-email"
                      type="email"
                      placeholder="priyanshu@company.com"
                      value={dispatchEmail}
                      onChange={(e) => setDispatchEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="composer-field">
                  <label htmlFor="dispatch-topic">Subject of Inquiry</label>
                  <select
                    id="dispatch-topic"
                    value={dispatchTopic}
                    onChange={(e) => setDispatchTopic(e.target.value)}
                  >
                    <option value="Summer Internship / Full-time Role">Summer Internship / Full-time Role</option>
                    <option value="Design Engineering Project">Design Engineering Project</option>
                    <option value="Creative UI/UX Collaboration">Creative UI/UX Collaboration</option>
                    <option value="Portfolio Review / Mentorship">Portfolio Review / Mentorship</option>
                    <option value="Just Saying Hello">Just Saying Hello</option>
                  </select>
                </div>

                <div className="composer-field">
                  <label htmlFor="dispatch-message">Your Message</label>
                  <textarea
                    id="dispatch-message"
                    rows={4}
                    placeholder="Write a brief note or share details regarding the opportunity…"
                    value={dispatchMessage}
                    onChange={(e) => setDispatchMessage(e.target.value)}
                  />
                </div>

                <div className="composer-actions">
                  <a
                    href={mailtoLink}
                    className="journal-btn primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send size={15} /> Send via Mail App
                  </a>
                  <button
                    type="button"
                    className="journal-btn secondary copy-action-btn"
                    onClick={copyDispatchNote}
                  >
                    {dispatchCopied ? <Check size={15} /> : <Copy size={15} />}
                    {dispatchCopied ? 'Copied letter!' : 'Copy letter text'}
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Contact & Social Media Tags Box */}
            <div className="correspondence-direct-box">
              <div className="email-headline-box">
                <span className="direct-label">Direct Correspondence</span>
                {p.email ? (
                  <div className="email-copy-wrap">
                    <a className="email-link" href={`mailto:${p.email}`}>
                      {p.email}
                    </a>
                    <button
                      className="email-copy-btn"
                      onClick={copyEmailToClipboard}
                      aria-label="Copy email address"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                ) : (
                  <p className="contact-empty">Contact details being updated.</p>
                )}
              </div>

              {/* Dedicated Social Media Tags Grid */}
              <div className="journal-social-channels" id="socialmedia-tags">
                <span className="social-label">Official Social Media Tags & Portfolios</span>
                <div className="social-links-grid">
                  {safeUrl(p.github) && (
                    <a
                      href={safeUrl(p.github)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill"
                    >
                      <GithubIcon size={18} />
                      <div className="social-pill-copy">
                        <strong>GitHub</strong>
                        <small>Repositories & Code</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                  {safeUrl(p.linkedin) && (
                    <a
                      href={safeUrl(p.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill"
                    >
                      <LinkedinIcon size={18} />
                      <div className="social-pill-copy">
                        <strong>LinkedIn</strong>
                        <small>Professional Network</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                  {safeUrl(p.behance) && (
                    <a
                      href={safeUrl(p.behance)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill"
                    >
                      <BehanceIcon size={18} />
                      <div className="social-pill-copy">
                        <strong>Behance</strong>
                        <small>Design Case Studies</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                  {safeUrl(p.dribbble) && (
                    <a
                      href={safeUrl(p.dribbble)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill"
                    >
                      <DribbbleIcon size={18} />
                      <div className="social-pill-copy">
                        <strong>Dribbble</strong>
                        <small>UI Visuals & Motion</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                  {safeUrl(p.instagram) && (
                    <a
                      href={safeUrl(p.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill"
                    >
                      <InstagramIcon size={18} />
                      <div className="social-pill-copy">
                        <strong>Instagram</strong>
                        <small>Process Sketches & Stories</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                  {safeUrl(p.resume) && (
                    <a
                      href={safeUrl(p.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill resume-pill"
                    >
                      <Download size={18} />
                      <div className="social-pill-copy">
                        <strong>Download Résumé</strong>
                        <small>B.Tech Design CV (PDF)</small>
                      </div>
                      <ArrowUpRight size={14} className="social-arrow" />
                    </a>
                  )}
                </div>
              </div>

              {/* Colophon Note */}
              <div className="colophon-box">
                <p className="colophon-text">
                  Typeset in <em>Space Grotesk</em> & <em>DM Serif Display</em>. Built for B.Tech in Design craftsmanship.
                </p>
                <small className="colophon-author">
                  {p.name} · {p.location || 'India'} · Volume V
                </small>
              </div>
            </div>
          </div>

          {/* Bottom Back-to-Top Ribbon */}
          <div className="journal-footer-ribbon">
            <span>© {new Date().getFullYear()} The {p.name} Journal · B.Tech in Design</span>
            <a
              href="#top-header"
              className="back-to-masthead"
              aria-label="Return to top of journal"
            >
              Back to Top <ChevronUp size={16} />
            </a>
          </div>
        </footer>
      </main>

      {/* ─── FULL STORY MODAL DIALOG ──────────────────────────── */}
      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

// ─── MAIN DEFAULT EXPORT ────────────────────────────────────────────────────
export default function Portfolio({ profile: p, preview }: Props) {
  return (
    <Frame profile={p} preview={preview} theme="journal-folio">
      <JournalContent profile={p} preview={preview} />
    </Frame>
  );
}
