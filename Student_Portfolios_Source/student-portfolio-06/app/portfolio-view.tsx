'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '../lib/portfolio';
import { safeUrl } from '../lib/portfolio';
import {
  ExternalLink,
  Copy,
  Check,
  Send,
  ArrowUpRight,
  GraduationCap,
  Cpu,
  Award,
  ArrowUp,
  X,
  MessageSquare,
} from 'lucide-react';

/* Inline Custom SVG Icons for GitHub & LinkedIn */
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

/* Doodle Underline SVG */
function DoodleUnderline() {
  return (
    <svg
      width="110"
      height="14"
      viewBox="0 0 100 12"
      fill="none"
      stroke="var(--ca-ink)"
      strokeWidth={2.8}
      strokeLinecap="round"
      className="ca-underline-svg"
      aria-hidden="true"
    >
      <path d="M2 8 C 25 3, 50 11, 75 4 C 85 2, 95 9, 98 6" />
    </svg>
  );
}

/* Hand Drawn Arrow SVG */
function HandDrawnArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 40 40"
      fill="none"
      stroke="var(--ca-ink)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ca-arrow-svg"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <path d="M34 33 C 25 24, 15 21, 9 9" />
      <path d="M8 21 L 7 7 L 21 11" />
    </svg>
  );
}

/* Four Point Star SVG */
function FourPointStar({ color = 'var(--ca-yellow)' }: { color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
      className="ca-star-svg"
      aria-hidden="true"
    >
      <path d="M12 2c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9Z" />
    </svg>
  );
}

/* Big Cartoon Smiley Face Badge with Blinking Eyes */
function SmileyFaceBadge() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="ca-smiley-svg"
      aria-hidden="true"
    >
      {/* Outer Head */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--ca-yellow)"
        stroke="var(--ca-ink)"
        strokeWidth="3.5"
      />
      {/* Pink Blush Cheeks */}
      <circle cx="54" cy="122" r="14" fill="var(--ca-magenta)" opacity="0.45" />
      <circle cx="146" cy="122" r="14" fill="var(--ca-magenta)" opacity="0.45" />
      {/* Blinking Eyes */}
      <g className="ca-blink">
        <rect x="64" y="66" width="16" height="42" rx="8" fill="var(--ca-ink)" />
        <rect x="120" y="66" width="16" height="42" rx="8" fill="var(--ca-ink)" />
      </g>
      {/* Curved Smile */}
      <path
        d="M60 132 Q100 174 140 132"
        fill="none"
        stroke="var(--ca-ink)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Polaroid Photo Component with Tape */
function PolaroidPhoto({
  src,
  caption,
  tilt = 'rotate(0deg)',
}: {
  src: string;
  caption: string;
  tilt?: string;
}) {
  return (
    <div className="ca-polaroid" style={{ transform: tilt }}>
      {/* Corner Washi Tape */}
      <span
        aria-hidden="true"
        className="ca-tape-strip"
        style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-3deg)',
          zIndex: 10,
          height: '20px',
          width: '80px',
          backgroundColor: 'rgba(254, 240, 138, 0.85)',
          display: 'block',
        }}
      />
      <div className="ca-polaroid-img-wrap">
        <img src={src} alt={caption} className="ca-polaroid-img" loading="lazy" />
      </div>
      <p className="ca-polaroid-caption">{caption}</p>
    </div>
  );
}

/* Interactive Figma Comment Card */
function ScrapbookComment({
  author = 'Student 06',
  note = 'Open to 2026 software engineering internships, research roles, and interesting conversations about systems and code.',
}: {
  author?: string;
  note?: string;
}) {
  const [reactions, setReactions] = useState(1);
  const [bounced, setBounced] = useState(false);

  const addReaction = () => {
    setReactions((prev) => prev + 1);
    setBounced(true);
    setTimeout(() => setBounced(false), 300);
  };

  return (
    <div className="ca-comment-card">
      {/* Corner washi tape strips */}
      <span
        aria-hidden="true"
        className="ca-tape-strip"
        style={{
          position: 'absolute',
          left: '-16px',
          top: '-8px',
          zIndex: 10,
          height: '20px',
          width: '64px',
          transform: 'rotate(-38deg)',
          backgroundColor: 'rgba(254, 240, 138, 0.85)',
          display: 'block',
        }}
      />
      <span
        aria-hidden="true"
        className="ca-tape-strip"
        style={{
          position: 'absolute',
          right: '-16px',
          top: '-8px',
          zIndex: 10,
          height: '20px',
          width: '64px',
          transform: 'rotate(38deg)',
          backgroundColor: 'rgba(255, 198, 218, 0.85)',
          display: 'block',
        }}
      />

      <div className="ca-comment-header">
        <div className="ca-comment-avatar">S6</div>
        <div>
          <p className="ca-comment-author">{author}</p>
          <span className="ca-comment-role">B.Tech CSE · Online</span>
        </div>
      </div>

      <p className="ca-comment-note">{note}</p>

      <div className="ca-comment-footer">
        <span className="ca-comment-role">Figma scrapbook note</span>
        <button
          onClick={addReaction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: bounced ? 'var(--ca-yellow)' : '#ffffff',
            border: '2px solid var(--ca-ink)',
            borderRadius: '9999px',
            padding: '4px 10px',
            fontFamily: 'var(--font-artsy-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--ca-ink)',
            transform: bounced ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.15s ease',
          }}
          title="Click to react"
        >
          <span>⚡</span>
          <span>{reactions}</span>
        </button>
      </div>
    </div>
  );
}

/* Main Component */
export default function PortfolioView({
  profile,
  preview,
}: {
  profile: Profile;
  preview?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  useEffect(() => {
    document.title = 'Portfolio';
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 40 && currentScrollY > lastScrollY) {
            // Scrolling down -> hide header ("move to back")
            setIsHeaderHidden(true);
          } else if (currentScrollY < lastScrollY || currentScrollY <= 40) {
            // Scrolling up or at top -> show header
            setIsHeaderHidden(false);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const p = profile as any;
  const projectsList = p.projects || [];
  const skillsList = p.skills || [];
  const educationList = p.education || [];
  const experienceList = p.experiences || [];
  const achievementsList = p.achievements || [];
  const principlesList = p.principles || [
    {
      title: 'Start with the why',
      body: 'Before writing a line of code or picking a database, I drill into what problem we are actually solving. Clean engineering begins with better questions, not premature abstractions.',
      note: 'questions before code.',
    },
    {
      title: 'Design for a bad day',
      body: 'Nobody uses software on pristine fiber optic with zero distractions. I engineer for spotty 4G, throttled CPUs, and confusing empty states. That is where engineering earns its keep.',
      note: 'latency matters.',
    },
    {
      title: 'Build with the team',
      body: 'The best systems come from teammates poking holes early in whiteboard designs. Clear documentation, strict type contracts, and humble collaboration always beat isolated code.',
      note: 'us, not me.',
    },
  ];

  const galleryList = p.gallery || [
    {
      caption: 'my workspace · 2026',
      src: 'https://images.unsplash.com/photo-1663298172343-9238ba22cd30?q=80&w=927&auto=format&fit=crop',
      tilt: 'rotate(-4deg)',
    },
    {
      caption: 'hackathon build',
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=927&auto=format&fit=crop',
      tilt: 'rotate(4deg)',
    },
  ];

  const copyEmail = () => {
    if (p.email) {
      navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setIsContactOpen(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 2500);
  };

  const skillColors = [
    'var(--ca-yellow)',
    'var(--ca-mint)',
    'var(--ca-pink-soft)',
    'var(--ca-cyan)',
    'var(--ca-orange)',
    'var(--ca-purple)',
    'var(--ca-green)',
  ];

  return (
    <div className="ca-grid">
      {/* Subtle organic paper grain noise */}
      <div className="ca-grain" aria-hidden="true" />

      {/* TOP NAVIGATION BAR */}
      <header className={`ca-nav ${isHeaderHidden ? 'ca-nav-hidden' : ''}`}>
        <div className="ca-nav-inner">
          {/* Brand Mark */}
          <a href="#" className="ca-nav-brand">
            <div className="ca-nav-badge">06</div>
            <span className="ca-display" style={{ fontSize: '1.25rem' }}>
              {p.name || 'STUDENT 06'}
            </span>
          </a>

          {/* Nav Links */}
          <nav className="ca-nav-links">
            <a href="#about" className="ca-nav-link">
              About
            </a>
            <a href="#work" className="ca-nav-link">
              Selected Work
            </a>
            <a href="#academics" className="ca-nav-link">
              Academics
            </a>
            <a href="#contact" className="ca-nav-link">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="ca-nav-actions">
            {p.github && (
              <a
                href={safeUrl(p.github)}
                target="_blank"
                rel="noreferrer"
                className="ca-social-btn"
                aria-label="GitHub"
              >
                <GithubIcon size={18} />
              </a>
            )}

            {p.linkedin && (
              <a
                href={safeUrl(p.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="ca-social-btn"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={18} />
              </a>
            )}

            <button
              onClick={() => setIsContactOpen(true)}
              className="ca-btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            >
              Say Hi
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="ca-hero">
        {/* "my name is" label */}
        <div className="ca-hero-label-wrap">
          <p className="ca-hero-label">my name is</p>
          <DoodleUnderline />
        </div>

        {/* Central Figma Selection Frame with Name Display */}
        <div className="ca-hero-name-wrap">
          {/* Pinned Note 1: Top-Left */}
          <div className="ca-pin-top-left">
            <span
              className="ca-sticker-pill"
              style={{ backgroundColor: 'var(--ca-mint)' }}
            >
              CS & SYSTEMS
            </span>
          </div>

          {/* Pinned Note 2: Top-Right */}
          <div className="ca-pin-top-right">
            <span
              className="ca-sticker-pill"
              style={{ backgroundColor: 'var(--ca-yellow-soft)' }}
            >
              B.TECH CSE &apos;26
            </span>
          </div>

          {/* The Frame Box */}
          <div className="ca-selection-box">
            {/* 4 Corner Handles */}
            <span className="ca-handle ca-handle-tl" />
            <span className="ca-handle ca-handle-tr" />
            <span className="ca-handle ca-handle-bl" />
            <span className="ca-handle ca-handle-br" />

            <h1 className="ca-hero-display-name">
              {p.name ? p.name.toUpperCase() : 'STUDENT 06'}
            </h1>
          </div>

          {/* Pinned Note 3: Bottom-Left (Sticky note + arrow) */}
          <div className="ca-pin-bottom-left">
            <span
              className="ca-sticky-note"
              style={{ backgroundColor: 'var(--ca-yellow)' }}
            >
              Full-Stack & Algorithms
            </span>
            <HandDrawnArrow flip={true} />
          </div>

          {/* Pinned Note 4: Bottom-Right (Arrow + Sticky note) */}
          <div className="ca-pin-bottom-right">
            <HandDrawnArrow />
            <span
              className="ca-sticky-note"
              style={{ backgroundColor: 'var(--ca-pink-soft)' }}
            >
              {p.location || 'India · Institute of Tech'}
            </span>
          </div>
        </div>

        {/* Hero Headline & Subhead */}
        <h2 className="ca-hero-headline">
          I build software that gets out of your way.
        </h2>
        <p className="ca-hero-subhead">
          Clean interfaces · Robust algorithms · Scalable distributed systems.
        </p>

        {/* Action CTAs */}
        <div className="ca-hero-actions">
          <a href="#work" className="ca-btn-primary">
            Explore Selected Work
            <ArrowUpRight size={16} />
          </a>

          <button
            onClick={() => setIsContactOpen(true)}
            className="ca-btn-secondary"
          >
            Get in Touch
          </button>

          {p.resume && (
            <a
              href={safeUrl(p.resume)}
              target="_blank"
              rel="noreferrer"
              className="ca-btn-link"
            >
              Resume
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section id="about" className="ca-section">
        <div className="ca-section-inner">
          {/* Section Header */}
          <div className="ca-section-header">
            <p className="ca-section-tag">about me!</p>
            <div className="ca-section-badge-box ca-doodle-box">
              <h3 className="ca-section-badge-text">WHAT&apos;S UP</h3>
            </div>
          </div>

          {/* 3-Column Bio Layout */}
          <div className="ca-bio-grid">
            {/* Left Polaroid Photo */}
            <div>
              <PolaroidPhoto
                src={galleryList[0]?.src}
                caption={galleryList[0]?.caption || 'my workspace · 2026'}
                tilt="rotate(-4deg)"
              />
            </div>

            {/* Center Narrative */}
            <div className="ca-bio-center">
              <p className="ca-bio-quote">
                &ldquo;I&apos;m a 3rd-year computer science engineering student
                who gets a little too excited about making complex systems fast,
                scalable, and delightful to use. I care about latency, edge
                cases, and shipping software that genuinely makes someone&apos;s
                day easier.&rdquo;
              </p>
              <p className="ca-bio-body">
                {p.bio ||
                  'With a strong foundation in Data Structures, Algorithms (350+ LeetCode problems solved), and Modern Full-Stack Web Architecture, I sit with the parts most people skip: error boundaries, offline states, and high-concurrency throughput.'}
              </p>
            </div>

            {/* Right Polaroid Photo */}
            <div>
              <PolaroidPhoto
                src={galleryList[1]?.src}
                caption={galleryList[1]?.caption || 'hackathon build'}
                tilt="rotate(4deg)"
              />
            </div>
          </div>

          {/* Engineering Principles (3 cards) */}
          <div className="ca-principles-grid">
            {principlesList.map((item: any, i: number) => {
              const bgColors = [
                'var(--ca-yellow-soft)',
                'var(--ca-mint)',
                'var(--ca-pink-soft)',
              ];
              const tilts = ['rotate(-1deg)', 'rotate(1deg)', 'rotate(-2deg)'];
              return (
                <div
                  key={i}
                  className="ca-principle-card"
                  style={{ transform: tilts[i % tilts.length] }}
                >
                  <span
                    className="ca-tape ca-tape-strip"
                    style={{
                      backgroundColor: bgColors[i % bgColors.length],
                      display: 'inline-block',
                      padding: '4px 12px',
                      fontFamily: 'var(--font-artsy-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.note || 'principle'}
                  </span>
                  <h4 className="ca-principle-title">{item.title}</h4>
                  <p className="ca-principle-body">{item.body}</p>
                </div>
              );
            })}
          </div>

          {/* Skills Cloud */}
          <div className="ca-skills-wrap">
            <p className="ca-skills-title">tools & technologies i swear by</p>
            <div className="ca-skills-cloud">
              {skillsList.map((skill: string, index: number) => (
                <span
                  key={skill}
                  className="ca-sticker-pill"
                  style={{
                    backgroundColor: skillColors[index % skillColors.length],
                    transform: index % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORKS SECTION */}
      <section id="work" className="ca-section">
        <div className="ca-section-inner">
          {/* Header */}
          <div className="ca-section-header">
            <p className="ca-section-tag">explore my work!</p>
            <DoodleUnderline />
            <h2 className="ca-section-title-large">FEATURED WORKS</h2>
            <span
              className="ca-tape ca-tape-strip"
              style={{
                backgroundColor: 'var(--ca-yellow-soft)',
                display: 'inline-block',
                padding: '6px 18px',
                marginTop: '1rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                transform: 'rotate(-1deg)',
              }}
            >
              A few systems and products I built to be fast, reliable, and delightful.
            </span>
          </div>

          {/* Case Studies Artboards with Sticky Stacking on Scroll */}
          <div className="ca-artboards-list">
            {projectsList.map((project: any, index: number) => {
              const projectColor =
                project.color ||
                (index === 0
                  ? 'var(--ca-blue)'
                  : index === 1
                  ? 'var(--ca-ink)'
                  : 'var(--ca-orange)');
              const isDarkColor =
                projectColor.includes('blue') ||
                projectColor.includes('ink') ||
                projectColor.includes('#191510') ||
                projectColor.includes('#2b57d6');

              const stackOffset = index * 22; // 0px, 22px, 44px
              const stackZ = 10 + index; // 10, 11, 12
              const tabOffset = index * 130; // 0px, 130px, 260px

              return (
                <article
                  key={project.title}
                  id={`project-${index + 1}`}
                  className="ca-artboard"
                  style={{
                    ['--stack-offset' as any]: `${stackOffset}px`,
                    ['--stack-z' as any]: stackZ,
                  }}
                >
                  {/* Top Header Tab */}
                  <div
                    className="ca-artboard-tab"
                    style={{
                      backgroundColor: projectColor,
                      marginLeft: `min(calc(${tabOffset}px), calc(100% - 150px))`,
                    }}
                  >
                    <span
                      style={{
                        color: isDarkColor ? '#ffffff' : 'var(--ca-ink)',
                      }}
                    >
                      Portfolio
                    </span>
                  </div>

                  {/* Artboard Content */}
                  <div className="ca-artboard-body">
                    {/* Left Column: Story & Metrics */}
                    <div className="ca-artboard-left">
                      <div className="ca-artboard-meta">
                        <span>{project.year || '2026'}</span>
                        <span>·</span>
                        <span style={{ color: 'var(--ca-ink)' }}>
                          {project.category || 'Software Engineering'}
                        </span>
                      </div>

                      <h3 className="ca-artboard-title">{project.title}</h3>
                      <p className="ca-artboard-desc">{project.description}</p>

                      {/* Challenge & Approach */}
                      <div className="ca-artboard-callouts">
                        <div className="ca-callout-box ca-callout-challenge">
                          <span
                            className="ca-callout-label"
                            style={{ backgroundColor: 'var(--ca-yellow)' }}
                          >
                            the challenge
                          </span>
                          <p className="ca-callout-text">
                            {project.challenge ||
                              'Complex architectural requirements demanding sub-100ms response times, strict fault tolerance, and an intuitive user interface under high data load.'}
                          </p>
                        </div>

                        <div className="ca-callout-box ca-callout-approach">
                          <span
                            className="ca-callout-label"
                            style={{ backgroundColor: 'var(--ca-mint)' }}
                          >
                            my approach
                          </span>
                          <p className="ca-callout-text">
                            {project.approach ||
                              'Engineered modular components, designed optimized database indexing structures, and implemented client-side state caching with zero-layout-shift micro-interactions.'}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      {project.metrics && (
                        <div className="ca-metrics-row">
                          {project.metrics.map((m: any, mi: number) => (
                            <div key={mi} className="ca-metric-box">
                              <span className="ca-metric-val">{m.value}</span>
                              <span className="ca-metric-lbl">{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="ca-artboard-actions">
                        {project.url && (
                          <a
                            href={safeUrl(project.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="ca-btn-primary"
                          >
                            Live Demo
                            <ArrowUpRight size={16} />
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={safeUrl(project.githubUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="ca-btn-secondary"
                          >
                            <GithubIcon size={16} />
                            Code
                          </a>
                        )}

                        <button
                          onClick={() => setActiveProject(project)}
                          className="ca-btn-link"
                          style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                          View Case Study
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Visual Frame with Washi Tape */}
                    <div className="ca-artboard-right">
                      <div className="ca-image-frame">
                        {/* Washi Tape at Top Corners */}
                        <span
                          aria-hidden="true"
                          className="ca-tape-strip"
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '20px',
                            zIndex: 10,
                            height: '24px',
                            width: '85px',
                            transform: 'rotate(-6deg)',
                            backgroundColor: 'rgba(254, 240, 138, 0.85)',
                            display: 'block',
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="ca-tape-strip"
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '20px',
                            zIndex: 10,
                            height: '24px',
                            width: '85px',
                            transform: 'rotate(6deg)',
                            backgroundColor: 'rgba(255, 198, 218, 0.85)',
                            display: 'block',
                          }}
                        />

                        {/* Image Preview */}
                        <div className="ca-image-preview-wrap">
                          <img
                            src={
                              project.image ||
                              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop'
                            }
                            alt={project.title}
                            className="ca-image-preview"
                            loading="lazy"
                          />
                        </div>

                        {/* Tags Bar */}
                        <div className="ca-tags-bar">
                          {(
                            project.tags || [
                              'Full-Stack',
                              'TypeScript',
                              'High Performance',
                            ]
                          ).map((tag: string) => (
                            <span key={tag} className="ca-tag-pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ACADEMICS & LEADERSHIP SECTION */}
      <section id="academics" className="ca-section">
        <div className="ca-section-inner">
          <div className="ca-section-header">
            <p className="ca-section-tag">background & credentials</p>
            <DoodleUnderline />
            <h2 className="ca-section-title-large">ACADEMIC JOURNEY</h2>
          </div>

          <div className="ca-academics-grid">
            {/* Education Card */}
            <div className="ca-academics-card">
              <span
                aria-hidden="true"
                className="ca-tape-strip"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '24px',
                  zIndex: 10,
                  height: '20px',
                  width: '90px',
                  transform: 'rotate(-3deg)',
                  backgroundColor: 'rgba(169, 223, 198, 0.85)',
                  display: 'block',
                }}
              />
              <div className="ca-academics-card-head">
                <div
                  className="ca-academics-icon-box"
                  style={{ backgroundColor: 'var(--ca-yellow)' }}
                >
                  <GraduationCap size={24} color="var(--ca-ink)" />
                </div>
                <div>
                  <h3 className="ca-academics-card-title">Formal Education</h3>
                  <span className="ca-academics-card-sub">Institute of Technology</span>
                </div>
              </div>

              {educationList.map((edu: any, index: number) => (
                <div key={index} className="ca-academics-item">
                  <div className="ca-academics-item-top">
                    <h4 className="ca-academics-degree">{edu.degree}</h4>
                    <span className="ca-academics-period">{edu.period}</span>
                  </div>
                  <p className="ca-academics-place">{edu.school}</p>
                  <p className="ca-academics-detail">{edu.detail}</p>
                </div>
              ))}
            </div>

            {/* Experience & Leadership Card */}
            <div className="ca-academics-card">
              <span
                aria-hidden="true"
                className="ca-tape-strip"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  zIndex: 10,
                  height: '20px',
                  width: '90px',
                  transform: 'rotate(3deg)',
                  backgroundColor: 'rgba(255, 198, 218, 0.85)',
                  display: 'block',
                }}
              />
              <div className="ca-academics-card-head">
                <div
                  className="ca-academics-icon-box"
                  style={{ backgroundColor: 'var(--ca-mint)' }}
                >
                  <Cpu size={24} color="var(--ca-ink)" />
                </div>
                <div>
                  <h3 className="ca-academics-card-title">Experience & Leadership</h3>
                  <span className="ca-academics-card-sub">Internships & Open Source</span>
                </div>
              </div>

              {experienceList.map((exp: any, index: number) => (
                <div key={index} className="ca-academics-item">
                  <div className="ca-academics-item-top">
                    <h4 className="ca-academics-degree">{exp.role}</h4>
                    <span className="ca-academics-period">{exp.period}</span>
                  </div>
                  <p className="ca-academics-place" style={{ color: 'var(--ca-ink)' }}>
                    {exp.company}
                  </p>
                  <p className="ca-academics-detail">{exp.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          {achievementsList.length > 0 && (
            <div className="ca-achievements-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} color="var(--ca-ink)" />
                <h3 className="ca-academics-card-title">
                  Key Achievements & Competitions
                </h3>
              </div>
              <div className="ca-achievements-grid">
                {achievementsList.map((ach: string, i: number) => (
                  <div key={i} className="ca-achievement-item">
                    <FourPointStar color="var(--ca-orange)" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT SECTION ("LET'S TALK") */}
      <section id="contact" className="ca-section" style={{ paddingBottom: '7rem' }}>
        <div className="ca-section-inner">
          {/* Animated Cartoon Smiley Face & Header */}
          <div className="ca-contact-hero">
            <SmileyFaceBadge />
            <h2 className="ca-section-title-large" style={{ fontSize: 'clamp(3.5rem, 9vw, 8.5rem)' }}>
              LET&apos;S TALK
            </h2>
            <p className="ca-contact-sub">
              Got a project, a hard problem, or want to discuss internships and
              systems? Send it over. I read every message.
            </p>
          </div>

          {/* Comment & Big Yellow CONTACT Banner */}
          <div className="ca-contact-canvas">
            {/* The Floating Comment Bubble */}
            <ScrapbookComment
              author={p.name || 'Student 06'}
              note="Open to 2026 software engineering internships, research roles, and interesting conversations about systems and code."
            />

            {/* The Big Yellow Banner */}
            <div className="ca-contact-banner">
              {/* Corner washi tapes */}
              <span
                aria-hidden="true"
                className="ca-tape-strip"
                style={{
                  position: 'absolute',
                  left: '-20px',
                  top: '-12px',
                  zIndex: 10,
                  height: '24px',
                  width: '110px',
                  transform: 'rotate(-8deg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  display: 'block',
                }}
              />
              <span
                aria-hidden="true"
                className="ca-tape-strip"
                style={{
                  position: 'absolute',
                  right: '-20px',
                  top: '-12px',
                  zIndex: 10,
                  height: '24px',
                  width: '110px',
                  transform: 'rotate(8deg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  display: 'block',
                }}
              />

              <div
                onClick={() => setIsContactOpen(true)}
                className="ca-banner-box ca-doodle-box"
              >
                <p className="ca-banner-tagline">let&apos;s make something together</p>
                <h3 className="ca-banner-word">CONTACT</h3>
                <span className="ca-banner-cta">
                  drop a line
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          </div>

          {/* Direct Email Bar */}
          {p.email && (
            <div className="ca-email-bar">
              <span
                style={{
                  fontFamily: 'var(--font-artsy-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--ca-gray)',
                }}
              >
                Direct Email:
              </span>
              <button
                onClick={copyEmail}
                className="ca-btn-secondary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} color="#16b06a" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} color="var(--ca-ink)" />
                    <span>{p.email}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ca-footer">
        <div className="ca-footer-inner">
          <div>
            <p className="ca-display" style={{ fontSize: '1.15rem', margin: 0 }}>
              {p.name || 'STUDENT 06'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-artsy-mono)',
                fontSize: '0.8rem',
                color: 'var(--ca-gray)',
                margin: '2px 0 0 0',
              }}
            >
              B.Tech Computer Science & Engineering · Class of 2026
            </p>
          </div>

          <p className="ca-hand" style={{ fontSize: '1.25rem', color: 'rgba(25, 21, 16, 0.75)', margin: 0 }}>
            Playful Figma-canvas scrapbook · Shows how you think.
          </p>

          <a href="#" className="ca-btn-link" style={{ fontSize: '0.8rem' }}>
            Back to top
            <ArrowUp size={14} />
          </a>
        </div>
      </footer>

      {/* PROJECT CASE STUDY DETAIL MODAL */}
      {activeProject && (
        <div className="ca-modal-overlay" onClick={() => setActiveProject(null)}>
          <div className="ca-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ca-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FourPointStar color="var(--ca-ink)" />
                <span
                  style={{
                    fontFamily: 'var(--font-artsy-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Case Study · {activeProject.category}
                </span>
              </div>
              <button
                onClick={() => setActiveProject(null)}
                className="ca-modal-close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ca-modal-body">
              <div>
                <h3
                  className="ca-display"
                  style={{ fontSize: '2.25rem', margin: '0 0 0.5rem 0' }}
                >
                  {activeProject.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.65, margin: 0 }}>
                  {activeProject.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ca-callout-box ca-callout-challenge">
                  <span
                    className="ca-callout-label"
                    style={{ backgroundColor: 'var(--ca-yellow)' }}
                  >
                    The Challenge
                  </span>
                  <p className="ca-callout-text">
                    {activeProject.challenge ||
                      'Balancing low-latency compute with rich client interactivity and reliable persistence under erratic network conditions.'}
                  </p>
                </div>

                <div className="ca-callout-box ca-callout-approach">
                  <span
                    className="ca-callout-label"
                    style={{ backgroundColor: 'var(--ca-mint)' }}
                  >
                    My Technical Approach
                  </span>
                  <p className="ca-callout-text">
                    {activeProject.approach ||
                      'Implemented an offline-first data model, clean separation of presentation and business logic, and custom mathematical easing animations.'}
                  </p>
                </div>
              </div>

              {activeProject.metrics && (
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-artsy-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--ca-gray)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Key Outcomes & Impact
                  </span>
                  <div className="ca-metrics-row">
                    {activeProject.metrics.map((m: any, mi: number) => (
                      <div key={mi} className="ca-metric-box">
                        <span className="ca-metric-val">{m.value}</span>
                        <span className="ca-metric-lbl">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(25, 21, 16, 0.15)',
                }}
              >
                {activeProject.url && (
                  <a
                    href={safeUrl(activeProject.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="ca-btn-primary"
                  >
                    Open Live Project
                    <ArrowUpRight size={16} />
                  </a>
                )}
                {activeProject.githubUrl && (
                  <a
                    href={safeUrl(activeProject.githubUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="ca-btn-secondary"
                  >
                    <GithubIcon size={16} />
                    View Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT MESSAGE MODAL */}
      {isContactOpen && (
        <div className="ca-modal-overlay" onClick={() => setIsContactOpen(false)}>
          <div
            className="ca-modal-dialog"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ca-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--ca-ink)" />
                <span
                  style={{
                    fontFamily: 'var(--font-artsy-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Send a Message to Student 06
                </span>
              </div>
              <button
                onClick={() => setIsContactOpen(false)}
                className="ca-modal-close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              {contactSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ca-green)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                    }}
                  >
                    <Check size={32} />
                  </div>
                  <h4 className="ca-display" style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>
                    Message Sent!
                  </h4>
                  <p className="ca-hand" style={{ fontSize: '1.35rem', margin: 0, color: 'rgba(25, 21, 16, 0.8)' }}>
                    Thanks for reaching out! I&apos;ll get back to you soon.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-artsy-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      className="ca-input"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-artsy-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      className="ca-input"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-artsy-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Hi! I'd love to chat about software engineering roles, your projects, or systems design..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      className="ca-input"
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '1rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsContactOpen(false)}
                      style={{
                        fontFamily: 'var(--font-artsy-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: 'none',
                        border: 'none',
                        color: 'var(--ca-gray)',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="ca-btn-primary">
                      Send Message
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
