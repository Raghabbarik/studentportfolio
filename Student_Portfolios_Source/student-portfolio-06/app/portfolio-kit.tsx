'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll } from 'motion/react';
import { ArrowUpRight, X, Copy, Check, Send, Sparkles } from 'lucide-react';
import { safeUrl, type Profile } from '../lib/portfolio';

export { motion, AnimatePresence, useReducedMotion, ArrowUpRight, Copy, Check, Send, Sparkles };
export type Project = Profile['projects'][number];
export type Props = { profile: Profile; preview?: boolean };
export const number = (i: number) => String(i + 1).padStart(2, '0');

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
  const { scrollYProgress } = useScroll();

  return (
    <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
      <div
        className={`folio ${theme} ${preview ? 'embedded' : ''} variation-${profile.layout}`}
        style={{ '--accent': profile.accent } as CSSProperties}
        data-paused={paused}
      >
        {/* Top Reading Scroll Progress Bar */}
        <motion.div
          className="scroll-progress-bar"
          style={{
            scaleX: scrollYProgress,
            transformOrigin: '0% 50%',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--accent), #10b981)',
            zIndex: 100,
          }}
        />

        <a className="skip-link" href="#work">
          Skip to work
        </a>

        {children}

        {/* Public Utility bar without the Edit button */}
        <div className="utility">
          <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? 'Resume motion' : 'Pause motion'}
          </button>
        </div>
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
        <motion.li
          key={i}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.18 }}
        >
          {s}
        </motion.li>
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
              {{ github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }[k]} <ArrowUpRight size={15} />
            </a>
          )
      )}
    </div>
  );
}

export function Contact({ p }: { p: Profile }) {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const copyEmail = () => {
    if (!p.email) return;
    navigator.clipboard.writeText(p.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setSenderName('');
      setSenderEmail('');
      setMessage('');
      setTimeout(() => setSent(false), 6000);
    }, 700);
  };

  return (
    <div className="contact-details">
      {p.email ? (
        <div className="email-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a className="email" href={`mailto:${p.email}`}>
            {p.email}
            <ArrowUpRight size={24} />
          </a>
          <button
            onClick={copyEmail}
            className="copy-email-btn"
            title="Copy email to clipboard"
            type="button"
          >
            {copied ? (
              <>
                <Check size={16} color="#10b981" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="contact-empty">Contact details coming soon.</p>
      )}

      <Links p={p} />
      <Resume p={p} />

      {/* Interactive Quick Direct Message Form */}
      <div className="quick-contact-box">
        <h3 className="quick-contact-title">
          <Sparkles size={18} style={{ marginRight: '8px' }} />
          Send a Direct Note
        </h3>

        {sent ? (
          <div className="quick-contact-success">
            <Check size={20} color="#10b981" />
            <div>
              <strong>Message received!</strong>
              <p>Thank you for reaching out. I’ll get back to you soon.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="quick-contact-form">
            <div className="quick-form-row">
              <input
                type="text"
                placeholder="Your Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                className="quick-input"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
                className="quick-input"
              />
            </div>
            <textarea
              placeholder="Tell me about your project, collaboration, or opportunity..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="quick-textarea"
            />
            <button type="submit" disabled={sending} className="quick-submit-btn">
              {sending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send size={15} style={{ marginLeft: '6px' }} />
                </>
              )}
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

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
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
        const first = nodes[0],
          last = nodes[nodes.length - 1];
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
              <X size={22} />
            </button>
            <Art project={project} />
            <div className="dialog-copy">
              <span className="meta">
                {project.category} · {project.year}
              </span>
              <h2>{project.title}</h2>
              <p>{project.description || 'Project details coming soon.'}</p>
              {safeUrl(project.url) && (
                <a className="pill-link" href={safeUrl(project.url)} target="_blank" rel="noreferrer">
                  Visit live project <ArrowUpRight size={18} />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
