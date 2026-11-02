'use client';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Check,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Moon,
  Search,
  Send,
  Share2,
  Sparkles,
  Sun,
  X
} from 'lucide-react';
import { safeUrl } from '../lib/portfolio';
import {
  Frame,
  Reveal,
  Title,
  Photo,
  Art,
  Skills,
  hasJourney,
  motion,
  AnimatePresence,
  number,
  type Props,
  type Project
} from './portfolio-kit';

function isLightColor(hex?: string) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140;
}

const CARD_THEMES = [
  {
    bg: 'var(--ca-blue, #2b57d6)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ffffff',
    dotColor: '#ffffff',
    tagBg: '#ffffff',
    tagText: 'var(--ca-ink, #191510)'
  },
  {
    bg: 'var(--ca-ink, #191510)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ffffff',
    dotColor: '#ffffff',
    tagBg: '#ffffff',
    tagText: 'var(--ca-ink, #191510)'
  },
  {
    bg: 'var(--ca-yellow, #f7c948)',
    text: 'var(--ca-ink, #191510)',
    textMuted: 'rgba(25, 21, 16, 0.85)',
    borderColor: 'var(--ca-ink, #191510)',
    dotColor: 'var(--ca-ink, #191510)',
    tagBg: 'var(--ca-ink, #191510)',
    tagText: '#ffffff'
  },
  {
    bg: 'var(--ca-magenta, #ff4d8d)',
    text: 'var(--ca-ink, #191510)',
    textMuted: 'rgba(25, 21, 16, 0.85)',
    borderColor: 'var(--ca-ink, #191510)',
    dotColor: 'var(--ca-ink, #191510)',
    tagBg: 'var(--ca-ink, #191510)',
    tagText: '#ffffff'
  },
  {
    bg: 'var(--ca-green, #16b06a)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ffffff',
    dotColor: '#ffffff',
    tagBg: '#ffffff',
    tagText: 'var(--ca-ink, #191510)'
  },
  {
    bg: 'var(--ca-orange, #ff6a35)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ffffff',
    dotColor: '#ffffff',
    tagBg: '#ffffff',
    tagText: 'var(--ca-ink, #191510)'
  }
];

export default function Portfolio({ profile: p, preview }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'midnight'>('light');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Initialize theme from localStorage if available
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio-theme-mode');
      if (savedTheme === 'midnight' || savedTheme === 'light') {
        requestAnimationFrame(() => {
          setThemeMode(savedTheme);
        });
      }
    } catch {
      // Ignore if localStorage is disabled
    }
  }, []);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'midnight' : 'light';
    setThemeMode(next);
    try {
      localStorage.setItem('portfolio-theme-mode', next);
    } catch {
      // Ignore
    }
  };

  // Track scroll progress and scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
      setScrolledDown(winScroll > 320);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeDialog = useCallback(() => setSelected(null), []);

  // Copy email helper
  const copyEmail = useCallback(async () => {
    if (!p.email) return;
    try {
      await navigator.clipboard.writeText(p.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback
      window.location.href = `mailto:${p.email}`;
    }
  }, [p.email]);

  // Copy shareable link
  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore
    }
  }, []);

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    p.projects.forEach(x => {
      if (x.category?.trim()) set.add(x.category.trim());
    });
    return ['ALL', ...Array.from(set)];
  }, [p.projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return p.projects.filter(proj => {
      const matchesCat =
        selectedCategory === 'ALL' || proj.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !searchQuery.trim() ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [p.projects, selectedCategory, searchQuery]);

  // Handle direct inquiry email generation
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = p.email || 'student04@campus.edu';
    const sub = encodeURIComponent(inquirySubject || `Portfolio Inquiry from ${inquiryName || 'Visitor'}`);
    const body = encodeURIComponent(
      `Hello ${p.name},\n\n${inquiryMessage}\n\nFrom: ${inquiryName || 'Anonymous'}\nContact: ${inquiryEmail || 'N/A'}`
    );
    window.location.href = `mailto:${targetEmail}?subject=${sub}&body=${body}`;
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setShowInquiryModal(false);
    }, 2000);
  };

  const resumeUrl = safeUrl(p.resume);
  const githubUrl = safeUrl(p.github);
  const linkedinUrl = safeUrl(p.linkedin);
  const instagramUrl = safeUrl(p.instagram);

  const isLightAccent = isLightColor(p.accent);
  const dynamicCoverBg = themeMode === 'midnight' ? '#181c18' : (p.accent || '#f4e56b');
  const dynamicCoverFg = themeMode === 'midnight' ? '#f5f4ed' : (isLightAccent ? '#171b17' : '#ffffff');

  return (
    <div
      className={`poster-app ${themeMode === 'midnight' ? 'theme-midnight' : 'theme-light'}`}
      data-theme={themeMode}
      style={{
        '--cover-bg': dynamicCoverBg,
        '--cover-fg': dynamicCoverFg,
        '--accent': p.accent || (themeMode === 'midnight' ? '#e5f84d' : '#f4e56b')
      } as CSSProperties}
    >
      {/* Scroll Progress Bar */}
      <div
        className="poster-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <Frame profile={p} preview={preview} theme="poster-folio">
        {/* Navigation Header */}
        <header className="poster-nav">
          <div className="poster-nav-brand">
            <a href="#top" className="poster-logo">
              {p.name.toUpperCase()}
              <span className="poster-logo-dot" />
            </a>
          </div>

          <nav className={`poster-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#work" onClick={() => setMobileMenuOpen(false)}>
              THE WORK ↓
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>
              ABOUT ↓
            </a>
            {hasJourney(p) && (
              <a href="#journey" onClick={() => setMobileMenuOpen(false)}>
                JOURNEY ↓
              </a>
            )}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              GET IN TOUCH ↗
            </a>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="poster-nav-resume-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download size={14} /> CV / RÉSUMÉ
              </a>
            )}
          </nav>

          <div className="poster-nav-actions">
            {/* Theme Toggle Button */}
            <button
              className="poster-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${themeMode === 'light' ? 'Midnight' : 'Light'} Mode`}
              aria-label="Toggle dark/light mode"
            >
              {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span className="btn-label-text">{themeMode === 'light' ? 'MIDNIGHT' : 'LIGHT'}</span>
            </button>

            {/* Share Link Button */}
            <button
              className="poster-icon-btn"
              onClick={copyShareLink}
              title="Share portfolio link"
              aria-label="Share portfolio"
            >
              {copiedLink ? <Check size={16} color="#00aa55" /> : <Share2 size={16} />}
              <span className="btn-label-text">{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="poster-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <span className="menu-bars"><i /><i /><i /></span>}
            </button>
          </div>
        </header>

        <main id="top">
          {/* Hero Poster Cover */}
          <section className="poster-cover">
            <div className="poster-topline">
              <span className="poster-topline-role">
                <Sparkles size={15} className="sparkle-icon" />
                {p.role}
              </span>
              <span className="poster-topline-loc">
                <MapPin size={14} /> {p.location || 'Everywhere'}
              </span>
            </div>

            <div className="poster-headline-container">
              <Title text={p.headline} mode="letters" />
            </div>

            {/* Quick Stats Strip */}
            <div className="poster-stats-bar">
              <div className="poster-stat-item">
                <span className="stat-label">PROJECTS</span>
                <span className="stat-val">{number(p.projects.length)} ACTIVE</span>
              </div>
              <div className="poster-stat-item">
                <span className="stat-label">TOOLKIT</span>
                <span className="stat-val">{p.skills.filter(Boolean).length} SKILLS</span>
              </div>
              <div className="poster-stat-item">
                <span className="stat-label">ACADEMICS</span>
                <span className="stat-val">
                  {p.education[0]?.period ? p.education[0].period.split('—')[1]?.trim() || p.education[0].period : 'CLASS OF 2028'}
                </span>
              </div>
              <div className="poster-stat-item stat-availability">
                <span className="stat-label">OPPORTUNITY</span>
                <span className="stat-val">
                  <span className="beacon-dot" />
                  {p.availability || 'AVAILABLE FOR HIRE'}
                </span>
              </div>
            </div>

            {/* Hero Actions & Navigation Arrow */}
            <div className="poster-cover-bottom">
              <div className="poster-cta-group">
                <a className="poster-cta-btn primary" href="#work">
                  EXPLORE WORK ↓
                </a>
                {resumeUrl ? (
                  <a className="poster-cta-btn secondary" href={resumeUrl} target="_blank" rel="noreferrer">
                    <Download size={16} /> DOWNLOAD CV
                  </a>
                ) : p.email ? (
                  <button className="poster-cta-btn secondary" onClick={copyEmail}>
                    {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                    {copiedEmail ? 'EMAIL COPIED!' : 'COPY EMAIL'}
                  </button>
                ) : null}
              </div>

              <a className="poster-arrow" href="#work" aria-label="See selected projects">
                ↙
              </a>
            </div>
          </section>

          {/* Infinite Skills Marquee Ticker */}
          {p.skills.some(Boolean) && (
            <div className="poster-tape" title="Click any skill to filter projects!">
              <div>
                {[0, 1].map(n => (
                  <span key={n} aria-hidden={n === 1}>
                    {p.skills.filter(Boolean).map((s, i) => (
                      <button
                        key={i}
                        className="tape-skill-btn"
                        onClick={() => {
                          setSearchQuery(s);
                          const workSec = document.getElementById('work');
                          workSec?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {s.toUpperCase()} <b aria-hidden="true">✳</b>{' '}
                      </button>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          <section id="work" className="poster-work">
            {/* Playful Artsy Header */}
            <div className="ca-work-header">
              <div className="flex flex-col items-center">
                <p className="ca-hand ca-work-hand-label">explore my work!</p>
                <svg
                  viewBox="0 0 64 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="ca-doodle-squiggle"
                  aria-hidden="true"
                >
                  <path d="M3 4c18-3 40-3 58 0" />
                  <path d="M9 9c14-2.5 32-2.5 46 0" />
                </svg>
              </div>

              <h2 className="ca-display ca-work-headline">
                FEATURED WORKS
              </h2>

              <div className="ca-tape-subtitle">
                A few products I helped make simpler, calmer, and easier to trust.
              </div>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="poster-filter-bar">
              <div className="poster-category-pills" role="tablist" aria-label="Filter projects by category">
                {categories.map(cat => {
                  const count =
                    cat === 'ALL'
                      ? p.projects.length
                      : p.projects.filter(x => x.category?.toLowerCase() === cat.toLowerCase()).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={isSelected}
                      className={`poster-filter-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.toUpperCase()} <span className="pill-count">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search */}
              <div className="poster-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search projects by keyword"
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Projects Deck Showcase (Scroll-Stacked Sticky Cards) */}
            {filteredProjects.length ? (
              <div className="ca-projects-stack">
                {filteredProjects.map((x, i) => {
                  const themeIndex = i % CARD_THEMES.length;
                  const theme = CARD_THEMES[themeIndex];
                  const tabMargin =
                    i === 0
                      ? '0'
                      : `min(calc(${21 * i}% - 72px), calc(100% - 340px))`;

                  return (
                    <article
                      key={x.title + i}
                      className="ca-project-article"
                      style={{
                        '--ca-z-index': i + 10
                      } as CSSProperties}
                    >
                      {/* Folder Tab Header Row with Side Line showing Student Name */}
                      <div className="ca-tab-row">
                        <div className="ca-tab-slot" style={{ marginLeft: tabMargin }}>
                          <span
                            className={`ca-mono ca-tab ${i === 0 ? 'ca-tab-0' : 'ca-tab-stepped'}`}
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text
                            }}
                            onClick={() => setSelected(x)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelected(x);
                              }
                            }}
                          >
                            Project {number(i)}
                          </span>
                        </div>

                        {/* Tab Side Line showing Student Name */}
                        <div className="ca-tab-side-line" aria-label={`Author: ${p.name}`}>
                          <span className="ca-tab-side-rule" />
                          <span className="ca-mono ca-tab-student-name">
                            {p.name}
                          </span>
                        </div>
                      </div>

                      {/* Card Body Grid */}
                      <div
                        className="ca-card-grid"
                        style={{ backgroundColor: theme.bg }}
                      >
                        {/* Left Column: Metadata, Title, Description, Actions, Chamfered Tag Pills */}
                        <div className="ca-info-col">
                          <div>
                            <span
                              className="ca-mono ca-date-badge"
                              style={{ color: theme.text }}
                            >
                              <span
                                className="ca-date-dot"
                                style={{ backgroundColor: theme.dotColor }}
                              />
                              {x.year ? `MAR 19, ${x.year}` : 'MAR 19, 2026'}
                            </span>

                            <h3
                              className="ca-card-title"
                              style={{ color: theme.text }}
                              onClick={() => setSelected(x)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelected(x);
                                }
                              }}
                            >
                              {x.title}
                            </h3>

                            <p
                              className="ca-card-desc"
                              style={{ color: theme.textMuted }}
                            >
                              {x.description || "Making a whole city's systems and connections effortless."}
                            </p>

                            <div className="ca-actions-row">
                              <button
                                className="ca-mono ca-view-btn"
                                style={{
                                  color: theme.text,
                                  borderColor: theme.borderColor
                                }}
                                onClick={() => setSelected(x)}
                                aria-label={`View details for ${x.title}`}
                              >
                                VIEW PROJECT
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                >
                                  <path d="M7 17 17 7M9 7h8v8" />
                                </svg>
                              </button>

                              {safeUrl(x.url) && (
                                <a
                                  href={safeUrl(x.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ca-mono ca-live-demo-pill"
                                  style={{
                                    color: theme.text,
                                    borderColor: theme.borderColor
                                  }}
                                  onClick={e => e.stopPropagation()}
                                  title="Open external project URL"
                                >
                                  <ExternalLink size={12} /> LIVE DEMO
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Chamfered Category Tag Pills at Card Bottom */}
                          <div className="ca-tags-group">
                            <span
                              className="ca-mono ca-tag-pill"
                              style={{
                                backgroundColor: theme.tagBg,
                                color: theme.tagText
                              }}
                            >
                              {x.category || 'Featured'}
                            </span>
                            <span
                              className="ca-mono ca-tag-pill"
                              style={{
                                backgroundColor: theme.tagBg,
                                color: theme.tagText
                              }}
                            >
                              Case Study
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Masking Tape and Photo Frame */}
                        <div className="ca-visual-col">
                          <div className="ca-photo-wrapper">
                            {/* Angled Frosted Masking Tape Strips */}
                            <span aria-hidden="true" className="ca-tape-tl" />
                            <span aria-hidden="true" className="ca-tape-tr" />

                            {/* Photo Frame with 4px border */}
                            <div
                              className="ca-photo-frame"
                              style={{ borderColor: theme.borderColor }}
                              onClick={() => setSelected(x)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelected(x);
                                }
                              }}
                              aria-label={`Expand details for ${x.title}`}
                            >
                              <div className="relative overflow-hidden h-full w-full">
                                {safeUrl(x.image) ? (
                                  <img
                                    src={safeUrl(x.image)}
                                    alt={x.title}
                                    loading="lazy"
                                    className="ca-photo-img"
                                  />
                                ) : (
                                  <div className="taped-device-mockup">
                                    <div className="mockup-status-bar">
                                      <span className="mockup-clock">10:38</span>
                                      <span className="mockup-island" />
                                      <span className="mockup-battery">100%</span>
                                    </div>
                                    <div className="mockup-screen-content">
                                      <span className="mockup-sub-label">Split Bill &middot; {x.category}</span>
                                      <div className="mockup-stat-card">
                                        <span className="mockup-currency">$</span>
                                        <span className="mockup-amount">560,42</span>
                                      </div>
                                      <div className="mockup-people-row">
                                        <div className="mockup-avatar avatar-1">✦</div>
                                        <div className="mockup-avatar">SJ</div>
                                        <div className="mockup-avatar">AL</div>
                                        <span className="mockup-tag">{x.title}</span>
                                      </div>
                                    </div>
                                    <div className="mockup-bottom-hint">
                                      <span>CLICK TO EXPAND PROJECT ↘</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="poster-empty-results">
                <p>No projects matched &ldquo;{searchQuery || selectedCategory}&rdquo;.</p>
                <button
                  className="poster-cta-btn secondary"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                  }}
                >
                  RESET FILTERS
                </button>
              </div>
            )}
          </section>

          {/* About Section */}
          <section id="about" className="poster-about">
            <div className="poster-about-left">
              <span className="section-tag">[02] BIOGRAPHY</span>
              <h2>
                WHO’S
                <br />
                BEHIND IT?
              </h2>

              <div className="poster-photo-container">
                <Photo p={p} />
                <div className="photo-corner-badge">
                  <span>STUDENT 04</span>
                </div>
              </div>

              {/* Quick links & Contact badges in About column */}
              <div className="poster-quick-contact-card">
                <h3>GET DIRECT ACCESS</h3>
                <p>Looking for a driven student to join your team?</p>
                <div className="quick-actions-row">
                  {p.email && (
                    <button className="poster-badge-btn" onClick={copyEmail}>
                      {copiedEmail ? <Check size={14} /> : <Mail size={14} />}
                      {copiedEmail ? 'EMAIL COPIED' : 'COPY EMAIL'}
                    </button>
                  )}
                  {resumeUrl && (
                    <a className="poster-badge-btn" href={resumeUrl} target="_blank" rel="noreferrer">
                      <Download size={14} /> CV / RÉSUMÉ
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="poster-about-right">
              <Reveal effect="clip">
                <div className="poster-bio-card">
                  <p className="bio">{p.bio}</p>
                </div>

                <div className="poster-toolkit-block">
                  <div className="toolkit-header">
                    <span className="toolkit-label">CORE TOOLKIT & SKILLS</span>
                    <span className="toolkit-count">{p.skills.filter(Boolean).length} COMPETENCIES</span>
                  </div>
                  <Skills p={p} />
                </div>
              </Reveal>
            </div>
          </section>

          {/* Journey Section (Education, Experience, Achievements) */}
          {hasJourney(p) && (
            <section id="journey" className="poster-journey-section">
              <div className="poster-section-title">
                <div className="section-eyebrow-group">
                  <span className="section-tag">[03] THE JOURNEY</span>
                  <span className="section-count">BACKGROUND & MILESTONES</span>
                </div>
                <h2>
                  PROVEN PATH,
                  <br />
                  EXPANDING HORIZONS.
                </h2>
              </div>

              <div className="poster-journey-grid">
                {p.showEducation && p.education.length > 0 && (
                  <div className="poster-journey-column">
                    <div className="column-heading">
                      <GraduationCap size={22} />
                      <h3>EDUCATION</h3>
                    </div>
                    <div className="journey-card-list">
                      {p.education.map((x, i) => (
                        <article key={i} className="poster-journey-card">
                          <span className="journey-period-badge">{x.period}</span>
                          <h4>{x.degree}</h4>
                          <p className="journey-institution">{x.school}</p>
                          {x.detail && <p className="journey-detail">{x.detail}</p>}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {p.showExperience && p.experiences.length > 0 && (
                  <div className="poster-journey-column">
                    <div className="column-heading">
                      <Briefcase size={22} />
                      <h3>EXPERIENCE</h3>
                    </div>
                    <div className="journey-card-list">
                      {p.experiences.map((x, i) => (
                        <article key={i} className="poster-journey-card">
                          <span className="journey-period-badge">{x.period}</span>
                          <h4>{x.role}</h4>
                          <p className="journey-institution">{x.company}</p>
                          {x.detail && <p className="journey-detail">{x.detail}</p>}
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {p.showAchievements && p.achievements.filter(Boolean).length > 0 && (
                  <div className="poster-journey-column full-span-highlights">
                    <div className="column-heading">
                      <Award size={22} />
                      <h3>HIGHLIGHTS & HONORS</h3>
                    </div>
                    <div className="poster-achievements-grid">
                      {p.achievements.filter(Boolean).map((x, i) => (
                        <div key={i} className="poster-achievement-card">
                          <span className="achievement-num">{number(i)}</span>
                          <p>{x}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer & Contact Section */}
          <footer id="contact" className="poster-contact">
            <div className="poster-contact-title-wrap">
              <span className="section-tag">[04] CONNECT</span>
              <h2>
                LET’S
                <br />
                BUILD.
              </h2>
            </div>

            <div className="poster-contact-content">
              {p.email ? (
                <div className="poster-email-interactive">
                  <a className="email" href={`mailto:${p.email}`}>
                    {p.email}
                  </a>
                  <div className="contact-quick-buttons">
                    <button className="poster-cta-btn secondary" onClick={copyEmail}>
                      {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                      {copiedEmail ? 'COPIED TO CLIPBOARD!' : 'COPY EMAIL ADDRESS'}
                    </button>
                    <button
                      className="poster-cta-btn primary"
                      onClick={() => setShowInquiryModal(true)}
                    >
                      <Send size={16} /> SEND DIRECT MESSAGE
                    </button>
                  </div>
                </div>
              ) : (
                <p className="contact-empty">Contact details coming soon.</p>
              )}

              {/* Social Link Badges */}
              <div className="poster-socials-grid">
                {githubUrl && (
                  <a href={githubUrl} target="_blank" rel="noreferrer" className="poster-social-badge">
                    <span>GITHUB</span> <ArrowUpRight size={16} />
                  </a>
                )}
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noreferrer" className="poster-social-badge">
                    <span>LINKEDIN</span> <ArrowUpRight size={16} />
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="poster-social-badge">
                    <span>INSTAGRAM</span> <ArrowUpRight size={16} />
                  </a>
                )}
                {resumeUrl && (
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="poster-social-badge resume">
                    <Download size={16} /> <span>DOWNLOAD CV</span>
                  </a>
                )}
              </div>

              <div className="poster-footer-signoff">
                <span className="signoff-name">
                  {p.name.toUpperCase()} / {p.role.toUpperCase()}
                </span>
                <span className="signoff-note">
                  Crafted with Bold Poster Architecture &middot; {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </footer>
        </main>

        {/* Floating Back-To-Top Button */}
        <AnimatePresence>
          {scrolledDown && (
            <motion.button
              className="poster-back-to-top"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              <ChevronUp size={18} />
              <span>TOP</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Custom Brutalist Project Dialog */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="poster-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            >
              <motion.div
                className="poster-project-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={selected.title}
                initial={{ y: 40, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 25, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="poster-modal-close"
                  aria-label="Close project modal"
                  onClick={closeDialog}
                >
                  <X size={24} />
                </button>

                {/* Art Preview */}
                <div className="dialog-art-wrap">
                  <Art project={selected} />
                </div>

                <div className="dialog-content-body">
                  <div className="dialog-tags-row">
                    <span className="dialog-category-badge">{selected.category}</span>
                    <span className="dialog-year-badge">{selected.year || '2026'}</span>
                  </div>

                  <h2>{selected.title}</h2>
                  <p className="dialog-description">
                    {selected.description || 'Comprehensive project details and case study coming soon.'}
                  </p>

                  <div className="dialog-actions-row">
                    {safeUrl(selected.url) && (
                      <a
                        className="poster-cta-btn primary"
                        href={safeUrl(selected.url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        VISIT LIVE PROJECT <ArrowUpRight size={18} />
                      </a>
                    )}
                    <button className="poster-cta-btn secondary" onClick={closeDialog}>
                      CLOSE PREVIEW
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Inquiry / Direct Contact Modal */}
        <AnimatePresence>
          {showInquiryModal && (
            <motion.div
              className="poster-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInquiryModal(false)}
            >
              <motion.div
                className="poster-inquiry-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Send direct message"
                initial={{ y: 40, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 25, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="poster-modal-close"
                  aria-label="Close message dialog"
                  onClick={() => setShowInquiryModal(false)}
                >
                  <X size={24} />
                </button>

                <div className="inquiry-dialog-header">
                  <span className="section-tag">DIRECT TRANSMISSION</span>
                  <h2>SEND A MESSAGE TO {p.name.toUpperCase()}</h2>
                  <p>Inquire about internships, freelance projects, or tech collaborations.</p>
                </div>

                {inquirySuccess ? (
                  <div className="inquiry-success-notice">
                    <Check size={36} />
                    <h3>MESSAGE PREPARED!</h3>
                    <p>Your mail application has opened to complete sending.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="poster-inquiry-form">
                    <div className="form-field">
                      <label htmlFor="inquiry-name">YOUR NAME</label>
                      <input
                        id="inquiry-name"
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={inquiryName}
                        onChange={e => setInquiryName(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="inquiry-email">YOUR EMAIL</label>
                      <input
                        id="inquiry-email"
                        type="email"
                        required
                        placeholder="sarah@company.com"
                        value={inquiryEmail}
                        onChange={e => setInquiryEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="inquiry-subject">SUBJECT</label>
                      <input
                        id="inquiry-subject"
                        type="text"
                        placeholder="Internship opportunity / Collaboration"
                        value={inquirySubject}
                        onChange={e => setInquirySubject(e.target.value)}
                      />
                    </div>

                    <div className="form-field full">
                      <label htmlFor="inquiry-msg">MESSAGE</label>
                      <textarea
                        id="inquiry-msg"
                        rows={4}
                        required
                        placeholder="Hi there! I loved your projects and would love to chat about..."
                        value={inquiryMessage}
                        onChange={e => setInquiryMessage(e.target.value)}
                      />
                    </div>

                    <div className="inquiry-actions">
                      <button type="submit" className="poster-cta-btn primary">
                        <Send size={16} /> LAUNCH IN MAIL CLIENT
                      </button>
                      <button
                        type="button"
                        className="poster-cta-btn secondary"
                        onClick={() => setShowInquiryModal(false)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Frame>
    </div>
  );
}
