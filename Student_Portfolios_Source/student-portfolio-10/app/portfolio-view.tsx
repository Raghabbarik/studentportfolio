'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
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
  StatsBar,
  motion,
  AnimatePresence,
  ArrowUpRight,
  number,
  type Props,
  type Project,
} from './portfolio-kit';
import { Sparkles, Filter, ChevronRight, Download } from 'lucide-react';
import { safeUrl } from '../lib/portfolio';

export default function Portfolio({ profile: p, preview }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const close = useCallback(() => setSelected(null), []);

  // Compute categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    p.projects.forEach((proj) => {
      if (proj.category) set.add(proj.category);
    });
    return ['All', ...Array.from(set)];
  }, [p.projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return p.projects;
    return p.projects.filter((proj) => proj.category === selectedCategory);
  }, [p.projects, selectedCategory]);

  const count = filteredProjects.length;
  const currentProject = filteredProjects[index] || filteredProjects[0];

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  // Reset index when changing category
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setIndex(0);
    setDirection(1);
  };

  function slide(delta: number) {
    if (count < 2) return;
    setDirection(delta);
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <Frame profile={p} preview={preview} theme="gallery-folio">
      {/* Header navigation with glassmorphism */}
      <header className="gallery-nav">
        <a href="#top" className="gallery-brand">
          <span className="brand-name">{p.name}</span>
          <span className="brand-role">{p.role}</span>
        </a>

        <nav>
          <a href="#work">Projects</a>
          {(p.showStats ?? true) && (p.stats || []).length > 0 && <a href="#stats">Impact</a>}
          <a href="#about">About</a>
          {hasJourney(p) && <a href="#journey">Journey</a>}
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        {/* Intro Hero Section */}
        <section className="gallery-intro">
          <div>
            <div className="meta-badge-row">
              <span className="meta">Portfolio</span>
              {p.availability && (
                <span className="status-badge">
                  <span className="beacon" /> {p.availability}
                </span>
              )}
            </div>
            <Title text={p.headline} mode="clip" />

            <div className="hero-action-buttons">
              <a href="#work" className="hero-btn-primary">
                Explore Selected Work <ChevronRight size={16} />
              </a>
              {safeUrl(p.resume) && (
                <a href={safeUrl(p.resume)} target="_blank" rel="noreferrer" className="hero-btn-secondary">
                  <Download size={15} /> View Résumé
                </a>
              )}
            </div>
          </div>

          <div className="intro-meta-box">
            <span className="location-tag">{p.location}</span>
            <p className="status">{p.availability}</p>
          </div>
        </section>

        {/* Optional Stats Highlight Section */}
        {(p.showStats ?? true) && (p.stats || []).length > 0 && (
          <div id="stats">
            <StatsBar stats={p.stats} />
          </div>
        )}

        {/* Project Exhibition Carousel & Filter */}
        <section
          id="work"
          className="gallery-exhibition"
          role="region"
          aria-roledescription="carousel"
          aria-label="Selected projects exhibition"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              slide(1);
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              slide(-1);
            }
          }}
        >
          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="gallery-filter-bar">
              <span className="filter-label">Filter:</span>
              <div className="filter-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentProject ? (
            <>
              {/* Carousel Slide Stage */}
              <div className="gallery-stage">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.button
                    className="gallery-slide"
                    key={`${selectedCategory}-${index}`}
                    initial={{ x: direction * 90, opacity: 0, scale: 0.98 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: direction * -90, opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelected(currentProject)}
                    aria-label={'Read ' + currentProject.title}
                  >
                    <Art project={currentProject} index={index} />
                    <span className="gallery-read">
                      Explore details & stack <ArrowUpRight size={18} />
                    </span>
                  </motion.button>
                </AnimatePresence>
              </div>

              {/* Caption & Controls */}
              <div className="gallery-caption">
                <div aria-live="polite" aria-atomic="true">
                  <span className="meta">
                    {currentProject.category} / {currentProject.year}
                  </span>
                  <h2>{currentProject.title}</h2>
                  {currentProject.technologies && currentProject.technologies.length > 0 && (
                    <div className="caption-tech-tags">
                      {currentProject.technologies.slice(0, 4).map((tech, tIdx) => (
                        <span key={tIdx} className="caption-tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="gallery-controls">
                  <button
                    disabled={count < 2}
                    onClick={() => slide(-1)}
                    aria-label="Previous project"
                    title="Previous project"
                  >
                    ←
                  </button>
                  <span>
                    {number(index)} / {String(count).padStart(2, '0')}
                  </span>
                  <button
                    disabled={count < 2}
                    onClick={() => slide(1)}
                    aria-label="Next project"
                    title="Next project"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Thumbnails Navigation */}
              <div className="gallery-thumbs" aria-label="Choose a project">
                {filteredProjects.map((project, i) => (
                  <button
                    key={i}
                    aria-pressed={i === index}
                    className={i === index ? 'active' : ''}
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                    }}
                  >
                    <span>{number(i)}</span>
                    <div className="thumb-info">
                      <strong className="thumb-title">{project.title}</strong>
                      <span className="thumb-sub">{project.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <EmptyWork />
          )}
        </section>

        {/* Information / Bio & Skills Section */}
        <section id="about" className="gallery-info">
          <Reveal className="gallery-info-heading">
            <span className="meta">About the Engineer</span>
            <Photo p={p} />
            <h2>{p.name}</h2>
            <p className="role-sub">{p.role}</p>
            <p className="location-sub">{p.location}</p>
          </Reveal>

          <Reveal effect="blur">
            <p className="bio">{p.bio}</p>
            <h3>Core Technical Stack & Strengths</h3>
            <Skills p={p} />
          </Reveal>
        </section>

        {/* Journey Section (Experience, Education, Highlights) */}
        {hasJourney(p) && (
          <section id="journey" className="gallery-journey-section">
            <div className="journey-header">
              <span className="meta">Academic & Professional Timeline</span>
              <h2>
                {p.showAchievements && p.achievements.filter(Boolean).length > 0
                  ? 'Experience, Education & Honors'
                  : 'Experience & Education'}
              </h2>
            </div>
            <div className="gallery-journey">
              <Journey p={p} />
            </div>
          </section>
        )}

        {/* Contact Footer */}
        <footer id="contact" className="gallery-contact">
          <div>
            <span className="meta">For opportunities & collaborations</span>
            <h2>Let’s build together.</h2>
            <p className="contact-blurb">
              Whether you have an upcoming project, internship opening, or just want to discuss distributed systems
              and AI architectures, my inbox is always open.
            </p>
          </div>

          <Contact p={p} />

          <div className="footer-copyright-row">
            <span>
              {p.name} · {p.location}
            </span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </footer>
      </main>

      {/* Project Details Modal */}
      <ProjectDialog project={selected} onClose={close} />
    </Frame>
  );
}
