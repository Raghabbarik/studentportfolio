'use client';

import { useCallback, useState, useMemo, useEffect, type FormEvent } from 'react';
import {
  Search,
  X,
  Send,
  Copy,
  Check,
  ArrowUp,
  Sparkles,
  Filter,
  Code2,
  FolderGit2,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import {
  Frame,
  Reveal,
  Title,
  Photo,
  Art,
  Skills,
  Resume,
  Contact,
  Journey,
  hasJourney,
  EmptyWork,
  ProjectDialog,
  motion,
  ArrowUpRight,
  number,
  type Props,
  type Project
} from './portfolio-kit';
import { safeUrl } from '../lib/portfolio';

export default function Portfolio({ profile: p, preview }: Props) {
  // Theme state
  const [isDark, setIsDark] = useState(false);

  // Project navigation & filter state
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Scroll to top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const close = useCallback(() => setSelected(null), []);

  // Extract distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    p.projects.forEach((proj) => {
      if (proj.category) cats.add(proj.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [p.projects]);

  // Filtered projects based on category and search query
  const filteredProjects = useMemo(() => {
    return p.projects.filter((proj) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        proj.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        proj.category.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [p.projects, selectedCategory, searchQuery]);

  // Adjust active index when list changes
  useEffect(() => {
    if (active >= filteredProjects.length) {
      setActive(0);
    }
  }, [filteredProjects, active]);

  // Copy email handler
  const handleCopyEmail = useCallback(() => {
    if (!p.email) return;
    navigator.clipboard.writeText(p.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  }, [p.email]);

  // Submit contact form
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setFormSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setFormSent(false);
    }, 4500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Frame
      profile={p}
      preview={preview}
      theme="index-folio"
      isDark={isDark}
      onToggleDark={() => setIsDark(!isDark)}
    >
      {/* Editorial Navigation */}
      <header className="index-nav">
        <div className="index-nav-brand">
          <a href="#top" className="brand-title">
            Portfolio
          </a>
        </div>
        <nav className="index-nav-links">
          <a href="#work">Index</a>
          <a href="#about">About</a>
          <a href="#skills-section">Skills</a>
          <a href="#contact">Say hello</a>
        </nav>
        <div className="index-nav-spacer" aria-hidden="true" />
      </header>

      <main id="top">
        {/* Full-Size Creative Hero Section */}
        <section className="creative-hero-section">
          {/* Top Status & Meta Strip */}
          <div className="hero-top-strip">
            <span className="location-tag">📍 {p.location || 'India'}</span>
            <span className="status pulse-badge">{p.availability || 'Open to opportunities'}</span>
          </div>

          {/* Centerpiece Full-Size Creative Artwork Stage */}
          <div className="hero-artwork-container">
            <div className="hero-artwork-stage">
              <img
                src="/hero-creative.jpg"
                alt="Creative Portfolio"
                className="hero-artwork-img"
              />
              {p.name && p.name.trim().toUpperCase() !== 'NAME' && (
                <div className="hero-name-badge-overlay">
                  <div className="hero-name-pill" title={p.name}>
                    {p.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Cue & Elegant Divider */}
          <div className="hero-bottom-strip">
            <a href="#work" className="hero-scroll-cue" aria-label="Scroll to selected work">
              <span className="scroll-cue-text">Selected Work</span>
              <span className="scroll-cue-arrow">↓</span>
            </a>
            <div className="hero-accent-line" aria-hidden="true" />
          </div>
        </section>

        {/* Selected Work Section with Search & Filtering */}
        <section id="work" className="index-work">
          <div className="index-section-label">
            <div className="section-label-left">
              <span>01 / Selected Work</span>
              <span className="count-pill">
                {filteredProjects.length} of {p.projects.length} projects
              </span>
            </div>

            {/* Live Search Input */}
            <div className="work-search-bar">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="category-filters-row">
              <span className="filter-hint">
                <Filter size={13} /> Filter:
              </span>
              <div className="filter-pills-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project List & Dynamic Preview Grid */}
          <div className="work-index-grid">
            <div className="index-list">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((x, i) => (
                  <Reveal key={`${x.title}-${i}`} delay={i * 0.03}>
                    <motion.div
                      className={`index-row ${active === i ? 'is-active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      whileHover={{ x: 6 }}
                    >
                      <button
                        type="button"
                        className="index-row-trigger"
                        onClick={() => setSelected(x)}
                        aria-label={`View story for ${x.title}`}
                      >
                        <span className="row-num">{number(i)}</span>
                        <h2>{x.title}</h2>
                        <span className="index-category">{x.category}</span>
                      </button>

                      <div className="row-actions">
                        {safeUrl(x.url) && (
                          <a
                            href={safeUrl(x.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="direct-link"
                            title="Open live project"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="open-dialog-btn"
                          onClick={() => setSelected(x)}
                          title="Open details"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  </Reveal>
                ))
              ) : (
                <div className="empty-search-state">
                  <p>No projects match &ldquo;{searchQuery}&rdquo;.</p>
                  <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {filteredProjects.length > 0 && (
              <div className="index-preview">
                <motion.div
                  key={active}
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.45 }}
                >
                  <Art
                    project={filteredProjects[active] || filteredProjects[0]}
                    index={active}
                  />
                </motion.div>
                <div className="preview-caption">
                  <span>Hover to preview. Select row to read full technical breakdown.</span>
                  {safeUrl(filteredProjects[active]?.url) && (
                    <a
                      href={safeUrl(filteredProjects[active]?.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="preview-live-btn"
                    >
                      Visit Project <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="index-about">
          <Reveal effect="slide">
            <h2>
              A little<br />
              <em>about me.</em>
            </h2>
            <Photo p={p} />
          </Reveal>

          <div>
            <Reveal>
              {p.headline && (
                <div className="about-headline-quote">
                  <p className="headline-text">{p.headline}</p>
                </div>
              )}
              <p className="bio">{p.bio}</p>

              {/* Metrics & Highlights Bar */}
              <div className="stats-bar about-stats-bar">
                <div className="stat-card">
                  <div className="stat-icon-wrap">
                    <FolderGit2 size={20} color={p.accent} />
                  </div>
                  <div className="stat-info">
                    <strong>{p.projects.length}</strong>
                    <span>Featured Projects</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap">
                    <Code2 size={20} color={p.accent} />
                  </div>
                  <div className="stat-info">
                    <strong>{p.skills.length}</strong>
                    <span>Mastered Skills</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap">
                    <Briefcase size={20} color={p.accent} />
                  </div>
                  <div className="stat-info">
                    <strong>{p.experiences.length || 1}+</strong>
                    <span>Industry Roles</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrap">
                    <Sparkles size={20} color={p.accent} />
                  </div>
                  <div className="stat-info">
                    <strong>2026</strong>
                    <span>Portfolio Edition</span>
                  </div>
                </div>
              </div>

              {/* Skills section */}
              <div id="skills-section" className="skills-block">
                <div className="skills-header">
                  <h3>Technical Stack &amp; Tools</h3>
                  <span className="skills-count">{p.skills.length} competencies</span>
                </div>
                <Skills p={p} />
              </div>

              <Resume p={p} />
            </Reveal>

            {hasJourney(p) && <Journey p={p} />}
          </div>
        </section>

        {/* Enhanced Interactive Contact Section */}
        <footer id="contact" className="index-contact">
          <div className="contact-headline-wrap">
            <span className="contact-eyebrow">Have a project or opportunity in mind?</span>
            <div className="contact-main-row">
              <a
                href={p.email ? `mailto:${p.email}` : '#contact'}
                className="big-contact"
              >
                Let&rsquo;s talk <ArrowUpRight />
              </a>

              {p.email && (
                <button
                  type="button"
                  className="quick-copy-email-btn"
                  onClick={handleCopyEmail}
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={16} /> Email Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy Email
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Direct Message Form */}
          <div className="contact-interactive-grid">
            <div className="contact-left-col">
              <Contact p={p} />
              <div className="contact-meta-info">
                <p>📍 Based in <strong>{p.location}</strong></p>
                <p>⚡ Status: <strong>{p.availability}</strong></p>
                <p>💼 Open to remote, hybrid, &amp; onsite engineering roles.</p>
              </div>
            </div>

            <div className="contact-form-container">
              <h3>Send a Direct Note</h3>
              {formSent ? (
                <div className="form-success-banner">
                  <Check size={24} color="#10b981" />
                  <h4>Message Dispatched!</h4>
                  <p>Thank you for reaching out. I will respond to your note promptly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="interactive-contact-form">
                  <div className="form-inputs-pair">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Tell me about your project, team, or inquiry..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  />
                  <button type="submit" className="send-message-btn">
                    <Send size={15} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="footer-bottom-bar">
            <small>
              &copy; {new Date().getFullYear()} {p.name} &bull; {p.location}
            </small>
            <div className="footer-links">
              <button type="button" onClick={scrollToTop} className="footer-scroll-top">
                Back to top ↑
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="floating-scroll-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Project Detail Modal */}
      <ProjectDialog project={selected} onClose={close} />
    </Frame>
  );
}
