'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  Frame,
  Reveal,
  Title,
  Photo,
  Art,
  ProjectDialog,
  Resume,
  Links,
  motion,
  AnimatePresence,
  useReducedMotion,
  ArrowUpRight,
  ArrowDown,
  ExternalLink,
  Copy,
  Check,
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
  Code2,
  Server,
  Database,
  Terminal,
  Layers,
  Layout,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Search,
  Filter,
  number,
  type Props,
  type Project
} from './portfolio-kit';
import { HeroGraphic } from './components/hero-graphic';
import { safeUrl } from '../lib/portfolio';

// Categorized technical toolkit mapped to existing portfolio technologies
const TECHNICAL_CATEGORIES = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: Code2,
    summary: 'Component-driven architectures, reactive state, and accessible responsive interfaces.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML5 / Modern CSS', 'State Management']
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: Server,
    summary: 'Distributed edge compute, serverless APIs, and asynchronous microservices.',
    skills: ['Node.js', 'Express', 'Cloudflare Workers', 'RESTful APIs', 'Serverless Functions']
  },
  {
    id: 'databases',
    title: 'Databases & ORM',
    icon: Database,
    summary: 'Relational data structures, migrations, indexing, and type-safe query builders.',
    skills: ['PostgreSQL', 'SQLite / D1', 'Drizzle ORM', 'Data Modeling']
  },
  {
    id: 'languages',
    title: 'Programming Languages',
    icon: Terminal,
    summary: 'Type-safe functional systems, high-level scripting, and computational languages.',
    skills: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'SQL']
  },
  {
    id: 'tools',
    title: 'Tools & DevOps',
    icon: Layers,
    summary: 'Modern package workflows, git operations, local emulation, and deployment pipelines.',
    skills: ['Git & GitHub', 'Vite', 'Postman', 'Linux / Bash', 'CI/CD Automation']
  },
  {
    id: 'design',
    title: 'UI/UX & Design Systems',
    icon: Layout,
    summary: 'Design tokens, precision layout grids, micro-interactions, and visual storytelling.',
    skills: ['Figma', 'Design Systems', 'Wireframing', 'Responsive Grids', 'Motion Design']
  }
];

export default function Portfolio({ profile: initialProfile, preview }: Props) {
  const [p, setP] = useState(initialProfile);
  const [selected, setSelected] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Project Category Filter
  const [projectCategory, setProjectCategory] = useState<string>('all');

  // Skill Keyword Search
  const [skillQuery, setSkillQuery] = useState('');

  // Quick Message Composer in Contact
  const [inquiryName, setInquiryName] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const close = useCallback(() => setSelected(null), []);

  // Track active section and scroll progress
  useEffect(() => {
    const sections = ['top', 'work', 'profile', 'skills', 'journey', 'contact'];
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((y / totalHeight) * 100);
      }

      const triggerPoint = y + 240;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= triggerPoint) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy email helper
  const handleCopyEmail = async () => {
    if (!p.email) return;
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  // Extract unique project categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    p.projects.forEach((proj) => {
      if (proj.category) set.add(proj.category);
    });
    return Array.from(set);
  }, [p.projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (projectCategory === 'all') return p.projects;
    return p.projects.filter(
      (proj) => proj.category.toLowerCase() === projectCategory.toLowerCase()
    );
  }, [p.projects, projectCategory]);

  // Extract extra skills
  const allCategorySkills = new Set(
    TECHNICAL_CATEGORIES.flatMap((c) => c.skills.map((s) => s.toLowerCase()))
  );
  const extraSkills = p.skills.filter(
    (s) => s && !allCategorySkills.has(s.toLowerCase())
  );

  return (
    <Frame profile={p} preview={preview} theme="swiss-folio">
      {/* ─── READING PROGRESS BAR ─── */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* ─── STICKY NAVIGATION BAR ─── */}
      <header
        className={`swiss-navbar ${scrolled ? 'nav-scrolled' : ''}`}
        role="banner"
      >
        <div className="nav-container">
          <a
            href="#top"
            className="nav-brand"
            aria-label={`${p.name} - Home`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-name">{p.name || 'Satyam Mallik'}</span>
            <span className="brand-badge">Full-Stack</span>
          </a>

          <nav className="nav-links desktop-only" aria-label="Main Navigation">
            <a href="#top" className={activeSection === 'top' ? 'active' : ''}>
              Home
            </a>
            <a href="#work" className={activeSection === 'work' ? 'active' : ''}>
              Work
            </a>
            <a href="#profile" className={activeSection === 'profile' ? 'active' : ''}>
              Profile
            </a>
            <a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>
              Skills
            </a>
            <a href="#journey" className={activeSection === 'journey' ? 'active' : ''}>
              Journey
            </a>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>
              Contact
            </a>
          </nav>

          <div className="nav-cta-wrap desktop-only">
            <a href="#contact" className="nav-cta-button">
              <span>Let’s Talk</span>
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-nav-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className="mobile-nav-inner">
                <div className="mobile-links-list">
                  {[
                    { href: '#top', label: '01 / Home' },
                    { href: '#work', label: '02 / Work' },
                    { href: '#profile', label: '03 / Profile' },
                    { href: '#skills', label: '04 / Skills' },
                    { href: '#journey', label: '05 / Journey' },
                    { href: '#contact', label: '06 / Contact' }
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={activeSection === item.href.slice(1) ? 'active' : ''}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <div className="mobile-cta-row">
                  <a
                    href="#contact"
                    className="button-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Get in Touch</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top" className="swiss-main-flow">
        {/* ─── SECTION 01: HERO SECTION ─── */}
        <section className="hero-section" aria-label="Introduction">
          <div className="hero-grid">
            <div className="hero-copy-col">
              <div className="hero-eyebrow">
                <span className="eyebrow-tag">FULL-STACK DEVELOPER & UI ENGINEER · BENGALURU</span>
              </div>

              <div className="hero-headline-wrap">
                <Title text={p.headline || 'From first idea.\nTo resilient product.'} />
              </div>

              <p className="hero-subtext">
                {p.bio
                  ? p.bio.split('\n')[0]
                  : 'Architecting thoughtful digital experiences, robust web applications, and intentional user interfaces at the intersection of design precision and system performance.'}
              </p>

              {/* Action buttons */}
              <div className="hero-actions-row">
                <a href="#work" className="hero-btn primary">
                  <span>View Selected Work</span>
                  <ArrowDown size={17} />
                </a>
                <a href="#contact" className="hero-btn secondary">
                  <span>Contact Me</span>
                  <ArrowUpRight size={17} />
                </a>
                {safeUrl(p.resume) && (
                  <a
                    href={safeUrl(p.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="hero-btn tertiary"
                  >
                    <span>Résumé</span>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              {/* Clean Quick specs readout */}
              <div className="hero-specs-bar clean">
                <div className="spec-item">
                  <span className="spec-val">0{p.projects.length}</span>
                  <span className="spec-lbl">Selected Projects</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">{p.skills.length}+</span>
                  <span className="spec-lbl">Technologies</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">100%</span>
                  <span className="spec-lbl">Type Safety</span>
                </div>
              </div>
            </div>

            {/* Right side interactive geometric visual */}
            <div className="hero-visual-col">
              <HeroGraphic
                projectsCount={p.projects.length}
                skillsCount={p.skills.length}
              />
            </div>
          </div>
        </section>

        {/* ─── SECTION 02: SELECTED WORK ─── */}
        <section id="work" className="section-block work-section" aria-label="Selected Projects">
          <div className="section-header-row">
            <div className="section-tag-group">
              <span className="section-index">01</span>
              <div className="section-title-wrap">
                <h2 className="section-title">Selected Work</h2>
                <p className="section-subtitle">
                  Production applications, system designs, and interactive engineering experiments.
                </p>
              </div>
            </div>

            {/* Project Category Filter */}
            <div className="work-filter-bar">
              <button
                type="button"
                className={`filter-btn ${projectCategory === 'all' ? 'active' : ''}`}
                onClick={() => setProjectCategory('all')}
              >
                All Projects ({p.projects.length})
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${projectCategory === cat ? 'active' : ''}`}
                  onClick={() => setProjectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="projects-editorial-list">
            <AnimatePresence mode="popLayout">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, i) => {
                  const isEven = i % 2 === 1;
                  return (
                    <motion.div
                      key={project.title}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <article
                        className={`project-editorial-card ${
                          isEven ? 'layout-reversed' : 'layout-standard'
                        }`}
                      >
                        {/* Project info column */}
                        <div className="project-info-side">
                          <div className="project-card-top">
                            <span className="project-huge-number">{number(i)}</span>
                            <div className="project-category-badge">
                              <span className="cat-pill">{project.category}</span>
                              <span className="year-pill">{project.year}</span>
                            </div>
                          </div>

                          <h3 className="project-card-title">{project.title}</h3>
                          <p className="project-card-desc">{project.description}</p>

                          {/* Technology stack tags */}
                          <div className="project-tech-stack">
                            {p.skills.slice(i * 3, i * 3 + 4).map((tech, tIdx) => (
                              <span key={tIdx} className="tech-badge">
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* Interactive actions */}
                          <div className="project-card-actions">
                            <button
                              type="button"
                              className="project-action-btn primary"
                              onClick={() => setSelected(project)}
                            >
                              <span>Explore Details</span>
                              <ArrowUpRight size={16} />
                            </button>

                            {safeUrl(project.url) ? (
                              <a
                                href={safeUrl(project.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="project-action-btn secondary"
                                aria-label={`Visit repository or live demo for ${project.title}`}
                              >
                                <Github size={16} />
                                <span>Code / Demo</span>
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              safeUrl(p.github) && (
                                <a
                                  href={safeUrl(p.github)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="project-action-btn secondary"
                                  aria-label="Visit GitHub Profile"
                                >
                                  <Github size={16} />
                                  <span>GitHub</span>
                                  <ExternalLink size={14} />
                                </a>
                              )
                            )}
                          </div>
                        </div>

                        {/* Project visual art / mockup column */}
                        <div
                          className="project-visual-side"
                          onClick={() => setSelected(project)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelected(project);
                            }
                          }}
                          aria-label={`Open preview for ${project.title}`}
                        >
                          <div className="project-visual-frame">
                            <Art project={project} index={i} />
                            <div className="project-hover-overlay">
                              <span className="overlay-pill">
                                <span>Open Case Study</span>
                                <ArrowUpRight size={15} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </motion.div>
                  );
                })
              ) : (
                <div className="empty-work-box">
                  <p>No projects found in this category.</p>
                  <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={() => setProjectCategory('all')}
                  >
                    Show All Projects
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ─── SECTION 03: PROFILE & PHILOSOPHY ─── */}
        <section id="profile" className="section-block profile-section" aria-label="Profile and Background">
          <div className="section-header-row">
            <div className="section-tag-group">
              <span className="section-index">02</span>
              <div className="section-title-wrap">
                <h2 className="section-title">Profile & Philosophy</h2>
                <p className="section-subtitle">
                  Background, architectural principles, and engineering mindset.
                </p>
              </div>
            </div>
            <span className="section-counter">Background // 03</span>
          </div>

          <div className="profile-two-col-grid">
            {/* Left Column: Monogram, Persona, Quick Facts */}
            <div className="profile-left-col">
              <div className="profile-identity-card">
                <Photo p={p} className="custom-portrait-wrap" />

                <div className="profile-identity-meta">
                  <h3 className="profile-name">{p.name || 'Satyam Mallik'}</h3>
                  <p className="profile-role-tag">{p.role || 'Full-Stack Developer'}</p>
                  <p className="profile-loc">
                    <span className="loc-pin" /> {p.location || 'Bengaluru, India'}
                  </p>
                </div>

                <div className="profile-quick-facts">
                  <div className="fact-row">
                    <span className="fact-label">Discipline</span>
                    <span className="fact-value">Full-Stack Systems & UI</span>
                  </div>
                  <div className="fact-row">
                    <span className="fact-label">Education</span>
                    <span className="fact-value">B.Tech Computer Science</span>
                  </div>
                  <div className="fact-row">
                    <span className="fact-label">Status</span>
                    <span className="fact-value accent">Open to Roles</span>
                  </div>
                </div>

                {/* Social quick links */}
                <div className="profile-social-actions">
                  {safeUrl(p.github) && (
                    <a
                      href={safeUrl(p.github)}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-social-chip"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {safeUrl(p.linkedin) && (
                    <a
                      href={safeUrl(p.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-social-chip"
                    >
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {safeUrl(p.resume) && (
                    <a
                      href={safeUrl(p.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-social-chip"
                    >
                      <ExternalLink size={15} />
                      <span>Résumé</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Narrative, Core Principles, Focus Areas */}
            <div className="profile-right-col">
              <Reveal>
                <div className="editorial-lead-box">
                  <span className="lead-tag">ENGINEERING MINDSET</span>
                  <h3 className="editorial-lead-heading">
                    Bridging design precision with resilient software architecture.
                  </h3>
                  <div className="editorial-bio-body">
                    {p.bio ? (
                      p.bio.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="bio-paragraph">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="bio-paragraph">
                        I specialize in creating clean, maintainable web applications from first principles. My work centers on intuitive UI engineering, robust APIs, and disciplined code quality.
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* 3 Core Philosophy Cards */}
              <div className="philosophy-cards-grid">
                <Reveal delay={0.1}>
                  <div className="philosophy-card">
                    <div className="ph-card-header">
                      <span className="ph-number">01</span>
                      <Code2 size={20} className="ph-icon" />
                    </div>
                    <h4 className="ph-title">System Rigor</h4>
                    <p className="ph-desc">
                      Strong end-to-end type safety, resilient database transactions, and deterministic state flows from backend storage to interface components.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.2}>
                  <div className="philosophy-card">
                    <div className="ph-card-header">
                      <span className="ph-number">02</span>
                      <Layout size={20} className="ph-icon" />
                    </div>
                    <h4 className="ph-title">Design Precision</h4>
                    <p className="ph-desc">
                      Strict typographic hierarchy, fluid micro-interactions, responsive grid systems, and accessible interactions adhering to Swiss design roots.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="philosophy-card">
                    <div className="ph-card-header">
                      <span className="ph-number">03</span>
                      <Sparkles size={20} className="ph-icon" />
                    </div>
                    <h4 className="ph-title">Product Velocity</h4>
                    <p className="ph-desc">
                      Rapid iterative prototyping, clean modular code separation, comprehensive error handling, and zero-compromise runtime performance.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 04: TECHNICAL SKILLS ─── */}
        <section id="skills" className="section-block skills-section" aria-label="Technical Skills">
          <div className="section-header-row">
            <div className="section-tag-group">
              <span className="section-index">03</span>
              <div className="section-title-wrap">
                <h2 className="section-title">Technical Skills</h2>
                <p className="section-subtitle">
                  Technologies, frameworks, databases, and design methodologies actively leveraged.
                </p>
              </div>
            </div>

            {/* Skill Keyword Search */}
            <div className="skill-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Filter by keyword (e.g. React, SQL, Cloudflare)..."
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                className="skill-search-input"
              />
              {skillQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSkillQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        <div className="skills-domains-grid">
          {TECHNICAL_CATEGORIES.map((domain, idx) => {
            const DomainIcon = domain.icon;
            return (
              <Reveal key={domain.id} effect="scale" delay={idx * 0.08}>
                <div className="skill-domain-card">
                  <div className="skill-domain-header">
                    <div className="domain-icon-wrap">
                      <DomainIcon size={20} />
                    </div>
                    <span className="domain-index">0{idx + 1}</span>
                  </div>

                  <h3 className="domain-name">{domain.title}</h3>
                  <p className="domain-summary">{domain.summary}</p>

                  <div className="domain-skills-wrap">
                    {domain.skills.map((skillName, sIdx) => {
                      const isMatch =
                        skillQuery.trim().length > 0 &&
                        skillName.toLowerCase().includes(skillQuery.toLowerCase());
                      return (
                        <span
                          key={sIdx}
                          className={`skill-chip ${isMatch ? 'search-highlight' : ''}`}
                        >
                          <span className="chip-bullet" />
                          <span>{skillName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Any extra skills entered in the profile editor */}
        {extraSkills.length > 0 && (
          <div className="extra-skills-block">
            <span className="extra-skills-label">ADDITIONAL SPECIALIZED EXPERTISE</span>
            <div className="extra-skills-pills">
              {extraSkills.map((item, i) => {
                const isMatch =
                  skillQuery.trim().length > 0 &&
                  item.toLowerCase().includes(skillQuery.toLowerCase());
                return (
                  <span
                    key={i}
                    className={`skill-chip custom ${isMatch ? 'search-highlight' : ''}`}
                  >
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ─── SECTION 05: EXPERIENCE & EDUCATION (JOURNEY) ─── */}
      <section id="journey" className="section-block journey-section" aria-label="Experience and Education">
        <div className="section-header-row">
          <div className="section-tag-group">
            <span className="section-index">04</span>
            <div className="section-title-wrap">
              <h2 className="section-title">Experience & Journey</h2>
              <p className="section-subtitle">
                Professional milestones, academic background, and recognized technical achievements.
              </p>
            </div>
          </div>
          <span className="section-counter">Timeline // 2024 — Present</span>
        </div>

        <div className="journey-dual-grid">
          {/* Professional Experience Column */}
          {p.showExperience && (
            <div className="journey-column">
              <div className="journey-col-header">
                <Briefcase size={20} className="journey-icon" />
                <h3 className="journey-col-title">Experience & Positions</h3>
              </div>

              <div className="journey-entries-list">
                {p.experiences.length > 0 ? (
                  p.experiences.map((exp, i) => (
                    <Reveal key={exp.company + i} delay={i * 0.1}>
                      <article className="journey-card">
                        <div className="journey-card-meta">
                          <span className="journey-period">{exp.period}</span>
                          <span className="journey-order">#{number(i)}</span>
                        </div>
                        <h4 className="journey-role">{exp.role}</h4>
                        <p className="journey-org">{exp.company}</p>
                        <p className="journey-detail">{exp.detail}</p>
                      </article>
                    </Reveal>
                  ))
                ) : (
                  <p className="journey-empty-note">
                    Experience details can be customized in the admin console.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Education Column */}
          {p.showEducation && (
            <div className="journey-column">
              <div className="journey-col-header">
                <GraduationCap size={20} className="journey-icon" />
                <h3 className="journey-col-title">Education & Academics</h3>
              </div>

              <div className="journey-entries-list">
                {p.education.length > 0 ? (
                  p.education.map((edu, i) => (
                    <Reveal key={edu.school + i} delay={i * 0.1}>
                      <article className="journey-card">
                        <div className="journey-card-meta">
                          <span className="journey-period">{edu.period}</span>
                          <span className="journey-order">#{number(i)}</span>
                        </div>
                        <h4 className="journey-role">{edu.degree}</h4>
                        <p className="journey-org">{edu.school}</p>
                        <p className="journey-detail">{edu.detail}</p>
                      </article>
                    </Reveal>
                  ))
                ) : (
                  <p className="journey-empty-note">
                    Education details can be configured in the admin console.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Honors & Achievements Row */}
        {p.showAchievements && p.achievements.filter(Boolean).length > 0 && (
          <div className="achievements-section-block">
            <div className="achievements-header">
              <Award size={20} className="achieve-icon" />
              <h3 className="achievements-title">Honors & Achievements</h3>
            </div>

            <div className="achievements-grid">
              {p.achievements.filter(Boolean).map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="achievement-box">
                    <span className="achievement-num">{number(i)}</span>
                    <p className="achievement-text">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── SECTION 06: CONTACT & FOOTER ─── */}
      <section id="contact" className="section-block contact-section" aria-label="Contact Information">
        <div className="section-header-row contact-invert-header">
          <div className="section-tag-group">
            <span className="section-index">05</span>
            <div className="section-title-wrap">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-subtitle">
                Initiate a conversation about full-stack engineering, internships, or collaboration.
              </p>
            </div>
          </div>
          <span className="section-counter">INBOX // ALWAYS OPEN</span>
        </div>

        <div className="contact-main-grid">
          <div className="contact-headline-col">
            <h3 className="contact-giant-heading">
              Good work starts with a thoughtful conversation.
            </h3>
            <p className="contact-lead-desc">
              Whether you have an upcoming full-stack opportunity, are looking for an engineering intern who cares about craft, or just want to discuss modern web systems — I would love to hear from you.
            </p>

            {/* Direct Inquiry Composer */}
            <div className="contact-composer-card">
              <span className="composer-tag">DIRECT INQUIRY COMPOSER</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetEmail = p.email || 'satyam.mallik@outlook.com';
                  const subject = encodeURIComponent(
                    inquirySubject || `Inquiry from ${inquiryName || 'Visitor'}`
                  );
                  const body = encodeURIComponent(
                    `Hi Satyam,\n\n${inquiryMessage}\n\nFrom,\n${inquiryName || 'Visitor'}`
                  );
                  window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
                }}
                className="composer-form"
              >
                <div className="composer-row">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject / Project"
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Tell me about your project, timeline, or opportunity..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  required
                />
                <button type="submit" className="composer-send-btn">
                  <span>Draft in Email Client</span>
                  <ArrowUpRight size={15} />
                </button>
              </form>
            </div>
          </div>

          <div className="contact-actions-col">
            {/* Direct email card */}
            <div className="contact-action-box">
              <span className="action-box-tag">PRIMARY CONTACT CHANNEL</span>
              <div className="email-display-row">
                <Mail size={22} className="mail-icon" />
                <a
                  href={`mailto:${p.email || 'satyam.mallik@outlook.com'}`}
                  className="email-address-link"
                >
                  {p.email || 'satyam.mallik@outlook.com'}
                </a>
              </div>

              <div className="email-button-group">
                <a
                  href={`mailto:${p.email || 'satyam.mallik@outlook.com'}`}
                  className="contact-cta-btn primary"
                >
                  <Mail size={16} />
                  <span>Send Email</span>
                  <ArrowUpRight size={16} />
                </a>

                <button
                  type="button"
                  className="contact-cta-btn secondary"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-success" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Connected profiles list */}
            <div className="connected-profiles-card">
              <span className="profiles-card-tag">ONLINE CHANNELS</span>
              <div className="profiles-links-grid">
                {safeUrl(p.github) && (
                  <a
                    href={safeUrl(p.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-link-item"
                  >
                    <div className="link-item-left">
                      <Github size={18} />
                      <div>
                        <strong>GitHub</strong>
                        <span>@malliksatyam46</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} />
                  </a>
                )}

                {safeUrl(p.linkedin) && (
                  <a
                    href={safeUrl(p.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-link-item"
                  >
                    <div className="link-item-left">
                      <Linkedin size={18} />
                      <div>
                        <strong>LinkedIn</strong>
                        <span>/in/satyam-mallik</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} />
                  </a>
                )}

                {safeUrl(p.resume) && (
                  <a
                    href={safeUrl(p.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-link-item"
                  >
                    <div className="link-item-left">
                      <ExternalLink size={18} />
                      <div>
                        <strong>Curriculum Vitae</strong>
                        <span>Download PDF Résumé</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Swiss Footer */}
        <footer className="swiss-footer-bottom">
          <div className="footer-left">
            <span>© {new Date().getFullYear()} {p.name || 'Satyam Mallik'}.</span>
            <span className="footer-sep">/</span>
            <span>All rights reserved.</span>
          </div>

          <div className="footer-center">
            <span>Designed with Swiss Grid rigor · Powered by Next.js & Motion</span>
          </div>

          <div className="footer-right">
            <a href="#top" className="back-to-top-btn" aria-label="Back to top">
              <span>Top of page</span>
              <ArrowUpRight size={14} className="top-arrow" />
            </a>
          </div>
        </footer>
      </section>
    </main>

    {/* Project detail modal */}
    <ProjectDialog project={selected} onClose={close} />
  </Frame>
  );
}
