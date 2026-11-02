'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties
} from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion
} from 'motion/react';
import {
  ArrowUpRight,
  ArrowDown,
  X,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Menu,
  Sparkles,
  Terminal,
  Code2,
  Database,
  Layers,
  Layout,
  Briefcase,
  GraduationCap,
  Award,
  Server,
  Lock,
  Search,
  Filter
} from 'lucide-react';
import { safeUrl, type Profile } from '../lib/portfolio';

// SVG Brand Icons
export function Github({
  size = 18,
  className = ''
}: {
  size?: number;
  className?: string;
}) {
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
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Linkedin({
  size = 18,
  className = ''
}: {
  size?: number;
  className?: string;
}) {
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
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export {
  motion,
  AnimatePresence,
  useReducedMotion,
  ArrowUpRight,
  ArrowDown,
  X,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Menu,
  Sparkles,
  Terminal,
  Code2,
  Database,
  Layers,
  Layout,
  Briefcase,
  GraduationCap,
  Award,
  Server,
  Lock,
  Search,
  Filter
};

export type Project = Profile['projects'][number];
export type Props = { profile: Profile; preview?: boolean };

export const number = (i: number) => String(i + 1).padStart(2, '0');

export function Frame({
  profile,
  preview,
  theme,
  children
}: {
  profile: Profile;
  preview?: boolean;
  theme: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`folio ${theme} ${preview ? 'embedded' : ''} variation-${profile.layout}`}
      style={
        {
          '--accent': profile.accent || '#CC482A',
          '--bg': '#F7F6F2',
          '--fg': '#191919'
        } as CSSProperties
      }
    >
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  className = '',
  effect = 'rise',
  delay = 0
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
    ? { filter: 'blur(8px)', opacity: 0, y: 16 }
    : effect === 'slide'
    ? { x: -28, opacity: 0 }
    : effect === 'scale'
    ? { scale: 0.95, opacity: 0 }
    : effect === 'clip'
    ? { clipPath: 'inset(0 0 100% 0)' }
    : { y: 24, opacity: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(0 0 0% 0)'
      }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Title({
  text,
  mode = 'words'
}: {
  text: string;
  mode?: 'words' | 'blur' | 'clip' | 'letters';
}) {
  const reduced = useReducedMotion();
  const lines = text.split('\n');

  return (
    <h1 className={`display title-${mode}`} aria-label={text}>
      {lines.map((line, i) => (
        <span className="title-line" key={i} aria-hidden="true">
          {(mode === 'letters' ? Array.from(line) : line.split(' ')).map(
            (token, j) => (
              <motion.span
                key={j}
                initial={
                  reduced
                    ? false
                    : mode === 'blur'
                    ? { filter: 'blur(10px)', y: 12, opacity: 0 }
                    : mode === 'clip'
                    ? { y: '110%' }
                    : mode === 'letters'
                    ? { rotateX: 60, y: 14, opacity: 0 }
                    : { y: 28, opacity: 0 }
                }
                animate={{
                  y: 0,
                  rotateX: 0,
                  opacity: 1,
                  filter: 'blur(0px)'
                }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(
                    j * (mode === 'letters' ? 0.015 : 0.05) + i * 0.12,
                    0.8
                  ),
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                {token}
                {mode !== 'letters' ? ' ' : ''}
              </motion.span>
            )
          )}
        </span>
      ))}
    </h1>
  );
}

export function Photo({
  p,
  className = ''
}: {
  p: Profile;
  className?: string;
}) {
  const url = safeUrl(p.photo);
  const initials = p.name
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('');

  return (
    <div className={`profile-image ${className}`}>
      {url ? (
        <img src={url} alt={p.name} />
      ) : (
        <div className="profile-monogram">
          <span className="monogram-text" aria-label={p.name}>
            {initials || 'SM'}
          </span>
          <div className="monogram-corner monogram-tl" aria-hidden="true" />
          <div className="monogram-corner monogram-br" aria-hidden="true" />
          <div className="monogram-label">ENGINEER // 03</div>
        </div>
      )}
    </div>
  );
}

export function Art({
  project,
  index = 0
}: {
  project: Project;
  index?: number;
}) {
  const src = safeUrl(project.image);
  const idx = index % 3;

  return (
    <div className={`work-art art-${idx}`}>
      {src ? (
        <img src={src} loading="lazy" alt={project.title} />
      ) : (
        <div className="art-composition">
          <div className="art-grid-lines" aria-hidden="true" />
          <div className="art-header">
            <span className="art-badge">{project.category}</span>
            <span className="art-year">{project.year}</span>
          </div>
          <div className="art-body">
            <strong className="art-title">{project.title}</strong>
            <div className="art-spec-line">
              <span className="code-dot" />
              <span>SYS_ID // 0{index + 1}</span>
            </div>
          </div>
          <div className="art-footer">
            <span className="art-meta-code">
              {project.category.toUpperCase()} · READY
            </span>
            <span className="art-index" aria-hidden="true">
              {number(index)}
            </span>
          </div>
        </div>
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
    <a
      className="resume-link"
      href={u}
      target="_blank"
      rel="noreferrer"
    >
      Download résumé <ArrowUpRight size={17} />
    </a>
  ) : null;
}

export function Links({ p }: { p: Profile }) {
  return (
    <div className="links">
      {(['github', 'linkedin', 'instagram'] as const).map(
        (k) =>
          safeUrl(p[k]) && (
            <a
              key={k}
              href={safeUrl(p[k])}
              target="_blank"
              rel="noreferrer"
            >
              {{ github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }[k]}{' '}
              <ArrowUpRight size={15} />
            </a>
          )
      )}
    </div>
  );
}

export function Contact({ p }: { p: Profile }) {
  return (
    <div className="contact-details">
      {p.email ? (
        <a className="email" href={`mailto:${p.email}`}>
          {p.email}
          <ArrowUpRight size={24} />
        </a>
      ) : (
        <p className="contact-empty">Contact details coming soon.</p>
      )}
      <Links p={p} />
      <Resume p={p} />
    </div>
  );
}

export function Journey({ p }: { p: Profile }) {
  return (
    <div className="journey-content">
      {p.showEducation && p.education.length > 0 && (
        <div className="journey-group">
          <h3>Education</h3>
          {p.education.map((x, i) => (
            <Reveal key={i}>
              <article className="journey-entry">
                <span className="meta">{x.period}</span>
                <h4>{x.degree}</h4>
                <p className="place">{x.school}</p>
                <p>{x.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}
      {p.showExperience && p.experiences.length > 0 && (
        <div className="journey-group">
          <h3>Experience</h3>
          {p.experiences.map((x, i) => (
            <Reveal key={i}>
              <article className="journey-entry">
                <span className="meta">{x.period}</span>
                <h4>{x.role}</h4>
                <p className="place">{x.company}</p>
                <p>{x.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}
      {p.showAchievements && p.achievements.filter(Boolean).length > 0 && (
        <div className="journey-group">
          <h3>Highlights</h3>
          {p.achievements.filter(Boolean).map((x, i) => (
            <Reveal key={i}>
              <p className="achievement">
                <span>{number(i)}</span>
                {x}
              </p>
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
  onClose
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'specs'>('overview');
  const [copiedClone, setCopiedClone] = useState(false);

  useEffect(() => {
    if (!project) return;
    const old = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();

    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = panel.current?.querySelectorAll<HTMLElement>(
          'a[href],button'
        );
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === panel.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === panel.current)
        ) {
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

  const copyCloneCmd = async () => {
    if (!project?.url) return;
    try {
      await navigator.clipboard.writeText(`git clone ${project.url}.git`);
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2200);
    } catch {
      setCopiedClone(false);
    }
  };

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
            initial={{ y: 28, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dialog-close"
              aria-label="Close project modal"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <Art project={project} />
            <div className="dialog-copy">
              <div className="dialog-meta-bar">
                <span className="meta-tag">{project.category}</span>
                <span className="meta-dot">·</span>
                <span className="meta-year">{project.year}</span>
              </div>
              <h2>{project.title}</h2>

              {/* Modal Tabs */}
              <div className="dialog-tabs-bar">
                <button
                  type="button"
                  className={`dialog-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setModalTab('overview')}
                >
                  Overview & Features
                </button>
                <button
                  type="button"
                  className={`dialog-tab-btn ${modalTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setModalTab('specs')}
                >
                  Architecture & Git
                </button>
              </div>

              {modalTab === 'overview' ? (
                <p>
                  {project.description ||
                    'Project implementation details and architecture overview.'}
                </p>
              ) : (
                <div className="dialog-specs-box">
                  <div className="spec-row">
                    <span>Architecture Pattern:</span>
                    <strong>Component-Driven & Serverless Edge</strong>
                  </div>
                  <div className="spec-row">
                    <span>Type System:</span>
                    <strong>Strict TypeScript (100% Type-Safe)</strong>
                  </div>
                  <div className="spec-row">
                    <span>Runtime Environment:</span>
                    <strong>Node.js / Cloudflare Workers</strong>
                  </div>

                  {project.url && (
                    <div className="git-clone-card">
                      <code>git clone {project.url}.git</code>
                      <button
                        type="button"
                        className="copy-clone-btn"
                        onClick={copyCloneCmd}
                      >
                        {copiedClone ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedClone ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="dialog-actions">
                {safeUrl(project.url) ? (
                  <a
                    className="pill-link primary"
                    href={safeUrl(project.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View Repository / Demo</span>
                    <ArrowUpRight size={18} />
                  </a>
                ) : (
                  <span className="repo-private-note">
                    Source repository available upon request
                  </span>
                )}
                <button
                  type="button"
                  className="pill-link secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
