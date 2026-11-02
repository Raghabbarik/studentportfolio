'use client';

import { useCallback, useState, useMemo, type PointerEvent, type CSSProperties } from 'react';
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
  ProjectDialog,
  motion,
  ArrowUpRight,
  Search,
  Sparkles,
  Lock,
  Layers,
  type Props,
  type Project
} from './portfolio-kit';

function Spotlight({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  function move(e: PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100
    });
  }
  return (
    <motion.article
      className={`bento-tile ${className}`}
      onPointerMove={move}
      style={{ '--sx': `${spot.x}%`, '--sy': `${spot.y}%` } as CSSProperties}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.article>
  );
}

export default function Portfolio({ profile: p, preview }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const close = useCallback(() => setSelected(null), []);

  // Dynamically extract categories from current projects
  const categories = useMemo(() => {
    const set = new Set<string>();
    p.projects.forEach(x => {
      if (x.category) set.add(x.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [p.projects]);

  // Filter projects by search query and category
  const filteredProjects = useMemo(() => {
    return p.projects.filter(x => {
      const matchesCat = selectedCategory === 'All' || x.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        x.title.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [p.projects, selectedCategory, searchQuery]);

  return (
    <Frame profile={p} preview={preview} theme="bento-folio">
      {/* Top Header Navigation */}
      <header className="bento-nav">
        <div className="bento-brand-wrap">
          <a href="#top" className="bento-brand">
            Portfolio
          </a>
        </div>
        <nav className="bento-links">
          <a href="#work">Projects</a>
          <a href="#about">Story</a>
          <a href="#journey">Journey</a>
          <a href="#contact">Connect ↗</a>
        </nav>
        <div className="bento-nav-spacer" aria-hidden="true" />
      </header>

      {/* Main Bento Grid */}
      <main className="bento-grid" id="top">
        {/* Welcome Hero Tile */}
        <Reveal className="bento-welcome" effect="blur">
          <Spotlight className="welcome-tile">
            <div className="welcome-header">
              <span className="meta">{p.role} · {p.location}</span>
              <span className="status-badge">
                <span className="status-pulse" />
                {p.availability || 'Available for projects'}
              </span>
            </div>
            <Title text={p.headline} mode="blur" />
            <p className="welcome-bio">{p.bio.split('\n')[0]}</p>
            <div className="welcome-actions">
              <a href="#work" className="pill-link">
                Explore projects ({p.projects.length}) <ArrowUpRight />
              </a>
              <a href="#contact" className="pill-link secondary">
                Let’s talk ↗
              </a>
            </div>
          </Spotlight>
        </Reveal>

        {/* Identity & Portrait Tile */}
        <Reveal className="bento-identity" effect="scale" delay={0.12}>
          <Spotlight className="portrait-tile">
            <Photo p={p} />
            <div className="portrait-info">
              <h2>{p.name}</h2>
              <p className="role-sub">{p.role}</p>
              <div className="portrait-stats">
                <div className="p-stat">
                  <strong>{p.projects.length}</strong>
                  <span>Projects</span>
                </div>
                <div className="p-stat">
                  <strong>{p.skills.length}</strong>
                  <span>Skills</span>
                </div>
              </div>
            </div>
          </Spotlight>
        </Reveal>

        {/* Dynamic Interactive Stats Bar Tile */}
        <Reveal className="bento-stats" effect="scale" delay={0.16}>
          <Spotlight className="stats-tile">
            <div className="stat-card">
              <span className="stat-num">{p.projects.length}+</span>
              <span className="stat-lbl">Featured Works</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-num">{p.skills.length}</span>
              <span className="stat-lbl">Core Technologies</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-num">2024–28</span>
              <span className="stat-lbl">Academic Period</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-num live-indicator">● Active</span>
              <span className="stat-lbl">Design & Dev</span>
            </div>
          </Spotlight>
        </Reveal>

        {/* Selected Projects Header with Category Filter & Search Bar */}
        <div id="work" className="bento-work-label">
          <div>
            <h2>Selected Works</h2>
            <span>Explore interactive project case studies / {p.projects.length} items</span>
          </div>

          <div className="work-controls">
            {/* Search Input */}
            <div className="search-bar-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects by keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="project-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="category-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.map((x, i) => (
          <Reveal key={x.title + i} className={`bento-project tile-${i % 3}`} effect="scale" delay={i * 0.05}>
            <Spotlight>
              <button
                className="bento-project-button"
                onClick={() => setSelected(x)}
                aria-label={`Open details for ${x.title}`}
              >
                <Art project={x} index={i} />
                <div className="bento-caption">
                  <div>
                    <span className="meta">{x.category} · {x.year}</span>
                    <h3>{x.title}</h3>
                  </div>
                  <span className="round-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </button>
            </Spotlight>
          </Reveal>
        ))}

        {!filteredProjects.length && (
          <div className="bento-empty-work-wrap">
            <EmptyWork />
          </div>
        )}

        {/* Skills & Toolkit Tile */}
        <Reveal className="bento-toolkit" effect="scale">
          <Spotlight>
            <div className="toolkit-header">
              <span className="meta"><Sparkles size={14} /> Design & Tech Stack</span>
              <span className="toolkit-hint">Click a skill to filter projects</span>
            </div>
            <h2>Always learning.<br />Crafting with care.</h2>
            <Skills
              p={p}
              onSelectSkill={skillName => {
                setSearchQuery(skillName);
                const el = document.getElementById('work');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </Spotlight>
        </Reveal>

        {/* Behind The Work / Bio Story Tile */}
        <Reveal className="bento-story" effect="blur">
          <Spotlight>
            <section id="about">
              <span className="meta">Philosophy & Focus</span>
              <h2>Behind the work</h2>
              <div className="bio-formatted">
                {p.bio.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="bio">{paragraph}</p>
                ))}
              </div>
            </section>
          </Spotlight>
        </Reveal>

        {/* Journey Section (Education, Experience, Highlights) */}
        {hasJourney(p) && (
          <div className="bento-journey" id="journey">
            <Spotlight>
              <Journey p={p} />
            </Spotlight>
          </div>
        )}

        {/* Next Chapter & Connect Tile (with Form, Email Copy & Links) */}
        <Reveal className="bento-contact" effect="scale">
          <Spotlight>
            <footer id="contact">
              <span className="meta">Let’s Collaborate</span>
              <div className="contact-heading-group">
                <h2>Let’s make<br />something good.</h2>
                <p className="contact-sub">
                  Whether you have an upcoming design internship, freelance opportunity, or just want to discuss creative tech, feel free to reach out.
                </p>
              </div>
              <Contact p={p} />
            </footer>
          </Spotlight>
        </Reveal>
      </main>

      {/* Project Detail Modal */}
      <ProjectDialog project={selected} onClose={close} />
    </Frame>
  );
}
