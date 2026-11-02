'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  X,
  Copy,
  Check,
  Send,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Code2
} from 'lucide-react';
import { safeUrl, type Profile, type Project, type Stat } from '../lib/portfolio';

export { motion, AnimatePresence, useReducedMotion, ArrowUpRight };
export type { Project, Stat };
export type Props = { profile: Profile; preview?: boolean };
export const number = (i: number) => String(i + 1).padStart(2, '0');

export function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

export function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Frame({
  profile,
  preview,
  theme,
  children,
}: {
  profile: Profile;
  preview?: boolean;
  theme: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <div
        className={`folio ${theme} ${preview ? 'embedded' : ''} variation-${profile.layout || 'editorial'}`}
        style={{ '--accent': profile.accent || '#0f766e' } as CSSProperties}
        data-paused={paused}
      >
        <a className="skip-link" href="#work">
          Skip to work
        </a>
        {children}
      </div>
    </MotionConfig>
  );
}

export function Reveal({
  children,
  className = '',
  effect = 'rise',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  effect?: 'rise' | 'blur' | 'slide' | 'scale' | 'clip';
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const initial = reduced
    ? false
    : effect === 'blur'
      ? { filter: 'blur(9px)', y: 12 }
      : effect === 'slide'
        ? { x: -32 }
        : effect === 'scale'
          ? { scale: 0.94 }
          : effect === 'clip'
            ? { clipPath: 'inset(0 0 100% 0)' }
            : { y: 28 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ x: 0, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Title({ text, mode = 'words' }: { text: string; mode?: 'words' | 'blur' | 'clip' | 'letters' }) {
  const reduced = useReducedMotion();
  const lines = (text || '').split('\n');

  return (
    <h1 className={`display title-${mode}`} aria-label={text}>
      {lines.map((line, i) => (
        <span className="title-line" key={i} aria-hidden="true">
          {(mode === 'letters' ? Array.from(line) : line.split(' ')).map((word, j) => (
            <motion.span
              key={j}
              initial={
                reduced
                  ? false
                  : mode === 'blur'
                    ? { filter: 'blur(10px)', y: 10 }
                    : mode === 'clip'
                      ? { y: '105%' }
                      : mode === 'letters'
                        ? { rotateX: 80, y: 15 }
                        : { y: 24 }
              }
              animate={{ y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.7,
                delay: Math.min(j * (mode === 'letters' ? 0.018 : 0.06) + i * 0.12, 0.8),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {mode !== 'letters' ? ' ' : ''}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export function Photo({ p, className = '' }: { p: Profile; className?: string }) {
  const url = safeUrl(p.photo);
  return (
    <div className={`profile-image ${className}`}>
      {url ? (
        <img src={url} alt={p.name} loading="lazy" />
      ) : (
        <span aria-label={p.name}>
          {(p.name || 'S')
            .split(' ')
            .filter(Boolean)
            .map((s) => s[0])
            .slice(0, 2)
            .join('')}
        </span>
      )}
    </div>
  );
}

export function Art({ project, index = 0 }: { project: Project; index?: number }) {
  const src = safeUrl(project.image);
  return (
    <div className={`work-art art-${index % 3}`}>
      {src ? (
        <img src={src} loading="lazy" alt={project.title} />
      ) : (
        <>
          <span className="art-meta">
            {project.category} / {project.year}
          </span>
          <strong>{project.title}</strong>
          <span className="art-index" aria-hidden="true">
            {number(index)}
          </span>
        </>
      )}
    </div>
  );
}

export function Skills({ p }: { p: Profile }) {
  return (
    <ul className="skills">
      {p.skills.filter(Boolean).map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}

export function Resume({ p }: { p: Profile }) {
  const u = safeUrl(p.resume);
  return u ? (
    <a className="resume-link" href={u} target="_blank" rel="noreferrer">
      Download résumé <ArrowUpRight size={17} />
    </a>
  ) : null;
}

export function Links({ p }: { p: Profile }) {
  const links = [
    { key: 'github', label: 'GitHub', icon: GithubIcon, url: safeUrl(p.github) },
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, url: safeUrl(p.linkedin) },
    { key: 'twitter', label: 'X / Twitter', icon: TwitterIcon, url: safeUrl(p.twitter) },
    { key: 'instagram', label: 'Instagram', icon: InstagramIcon, url: safeUrl(p.instagram) },
  ].filter((item) => item.url);

  return (
    <div className="links">
      {links.map(({ key, label, icon: Icon, url }) => (
        <a key={key} href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={15} />
          {label} <ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );
}

export function StatsBar({ stats }: { stats?: Stat[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="gallery-stats-bar" aria-label="Key highlights">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="stat-card">
              <span className="stat-value">{s.value}</span>
              <strong className="stat-label">{s.label}</strong>
              {s.subtext && <p className="stat-subtext">{s.subtext}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Contact({ p }: { p: Profile }) {
  const [copied, setCopied] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');

  const handleCopyEmail = () => {
    if (!p.email) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setMsgText('');
      setVisitorEmail('');
    }, 4500);
  };

  return (
    <div className="contact-details">
      {p.email ? (
        <div className="email-copy-wrap">
          <a className="email" href={`mailto:${p.email}`}>
            {p.email} <ArrowUpRight size={22} />
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="btn-copy-email"
            title="Copy email to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="contact-empty">Contact details coming soon.</p>
      )}

      {p.phone && (
        <div style={{ marginTop: '8px', fontSize: '15px', color: 'var(--sub)' }}>
          Direct: <a href={`tel:${p.phone}`} style={{ color: 'var(--fg)', textDecoration: 'underline' }}>{p.phone}</a>
        </div>
      )}

      <Links p={p} />
      <Resume p={p} />

      {/* Interactive Quick Note Messenger */}
      <div className="contact-quick-msg">
        <span className="meta" style={{ display: 'block', marginBottom: '8px' }}>
          Leave a direct message
        </span>
        {msgSent ? (
          <div className="msg-sent-feedback">
            <Check size={16} /> Thank you! Your note has been dispatched to {p.name}.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="quick-msg-form">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="quick-msg-input"
            />
            <textarea
              required
              rows={2}
              placeholder="Hi Satyam, I’d love to connect regarding..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              className="quick-msg-textarea"
            />
            <button type="submit" className="quick-msg-btn">
              Send Message <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Journey({ p }: { p: Profile }) {
  return (
    <div className="journey-content">
      {p.showExperience && p.experiences.length > 0 && (
        <div className="journey-group">
          <div className="journey-group-title">
            <Briefcase size={20} />
            <h3>Experience</h3>
          </div>
          {p.experiences.map((x, i) => (
            <Reveal key={i}>
              <article className="journey-entry">
                <span className="meta journey-pill">{x.period}</span>
                <h4>{x.role}</h4>
                <p className="place">{x.company}</p>
                <p>{x.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {p.showEducation && p.education.length > 0 && (
        <div className="journey-group">
          <div className="journey-group-title">
            <GraduationCap size={20} />
            <h3>Education</h3>
          </div>
          {p.education.map((x, i) => (
            <Reveal key={i}>
              <article className="journey-entry">
                <span className="meta journey-pill">{x.period}</span>
                <h4>{x.degree}</h4>
                <p className="place">{x.school}</p>
                <p>{x.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {p.showAchievements && p.achievements.filter(Boolean).length > 0 && (
        <div className="journey-group">
          <div className="journey-group-title">
            <Award size={20} />
            <h3>Highlights & Honors</h3>
          </div>
          {p.achievements.filter(Boolean).map((x, i) => (
            <Reveal key={i}>
              <div className="achievement">
                <span className="achievement-badge">{number(i)}</span>
                <span className="achievement-text">{x}</span>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export const hasJourney = (p: Profile) =>
  (p.showEducation && p.education.length > 0) ||
  (p.showExperience && p.experiences.length > 0) ||
  (p.showAchievements && p.achievements.some(Boolean));

export function EmptyWork() {
  return <p className="empty-work">Projects coming soon.</p>;
}

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const old = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();

    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = panel.current?.querySelectorAll<HTMLElement>('a[href],button');
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      old?.focus();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="project-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="project-dialog"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            tabIndex={-1}
            initial={{ y: 32, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dialog-close" aria-label="Close project" onClick={onClose}>
              <X size={20} />
            </button>
            <Art project={project} />
            <div className="dialog-copy">
              <span className="meta">
                {project.category} · {project.year}
              </span>
              <h2>{project.title}</h2>
              <p>{project.description || 'Project details coming soon.'}</p>

              {project.technologies && project.technologies.length > 0 && (
                <div className="dialog-tech-stack">
                  <span className="meta" style={{ display: 'block', marginBottom: '8px' }}>
                    Technologies & Stack
                  </span>
                  <div className="dialog-tech-tags">
                    {project.technologies.map((t, idx) => (
                      <span key={idx} className="dialog-tech-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="dialog-actions">
                {safeUrl(project.url) && (
                  <a className="pill-link" href={safeUrl(project.url)} target="_blank" rel="noreferrer">
                    Visit Live Demo <ArrowUpRight size={18} />
                  </a>
                )}
                {safeUrl(project.github) && (
                  <a
                    className="pill-link pill-link-secondary"
                    href={safeUrl(project.github)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubIcon size={16} /> View Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
