'use client';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  X,
  ExternalLink,
  Calendar,
  Tag,
} from 'lucide-react';
import { safeUrl, type Profile } from '../lib/portfolio';

export { motion, AnimatePresence, useReducedMotion, ArrowUpRight };
export type Project = Profile['projects'][number];
export type Props = { profile: Profile; preview?: boolean };
export const number = (i: number) => String(i + 1).padStart(2, '0');

export type ThemeMode = 'light' | 'dark';

export interface FolioContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  paused: boolean;
  togglePaused: () => void;
}

const FolioContext = createContext<FolioContextType>({
  themeMode: 'light',
  toggleTheme: () => {},
  paused: false,
  togglePaused: () => {},
});

export const useFolio = () => useContext(FolioContext);

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
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Initialize theme from localStorage or system preference if in browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem('folio_journal_theme') as ThemeMode;
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
      } else if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setThemeMode('dark');
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  // Update HTML and Body attributes whenever theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
      document.body.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  // Update scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = window.scrollY;
        setScrollProgress(Math.min(100, Math.max(0, (current / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    try {
      localStorage.setItem('folio_journal_theme', next);
    } catch {
      // Ignore
    }
  };

  const togglePaused = () => setPaused((p) => !p);

  return (
    <FolioContext.Provider value={{ themeMode, toggleTheme, paused, togglePaused }}>
      <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
        <div
          className={`folio ${theme} ${preview ? 'embedded' : ''} variation-${profile.layout}`}
          data-theme={themeMode}
          style={{ '--accent': profile.accent } as CSSProperties}
          data-paused={paused}
        >
          {/* Top Reading Progress Bar */}
          <div
            className="reading-progress-bar"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />

          <a className="skip-link" href="#work">
            Skip to work
          </a>

          {children}
        </div>
      </MotionConfig>
    </FolioContext.Provider>
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
    ? { x: -28 }
    : effect === 'scale'
    ? { scale: 0.96 }
    : effect === 'clip'
    ? { opacity: 0.3, y: 14 }
    : { y: 20 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ x: 0, y: 0, scale: 1, filter: 'blur(0px)', opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Title({
  text,
  mode = 'words',
}: {
  text: string;
  mode?: 'words' | 'blur' | 'clip' | 'letters';
}) {
  const reduced = useReducedMotion();
  return (
    <h1 className={`display title-${mode}`} aria-label={text}>
      {text.split('\n').map((line, i) => (
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
        <img src={url} alt={p.name} />
      ) : (
        <span aria-label={p.name}>
          {p.name
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
  return (
    <div className="links">
      {(['github', 'linkedin', 'instagram'] as const).map(
        (k) =>
          safeUrl(p[k]) && (
            <a key={k} href={safeUrl(p[k])} target="_blank" rel="noreferrer">
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
            initial={{ y: 36, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dialog-close" aria-label="Close project" onClick={onClose}>
              <X size={20} />
            </button>
            <Art project={project} />
            <div className="dialog-copy">
              <div className="dialog-badges">
                <span className="dialog-badge meta">
                  <Tag size={12} />
                  {project.category}
                </span>
                <span className="dialog-badge meta">
                  <Calendar size={12} />
                  {project.year}
                </span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.description || 'Project details coming soon.'}</p>
              {safeUrl(project.url) && (
                <a
                  className="pill-link"
                  href={safeUrl(project.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit live project <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
