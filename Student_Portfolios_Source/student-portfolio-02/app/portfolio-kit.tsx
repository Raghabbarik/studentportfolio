'use client';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type FormEvent } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  X,
  Copy,
  Check,
  Search,
  ArrowUp,
  Send,
  Sparkles,
  Lock,
  Layers,
  GraduationCap,
  Briefcase,
  Award,
  ExternalLink
} from 'lucide-react';
import { safeUrl, type Profile } from '../lib/portfolio';

export {
  motion,
  AnimatePresence,
  useReducedMotion,
  ArrowUpRight,
  Copy,
  Check,
  Search,
  ArrowUp,
  Send,
  Sparkles,
  Lock,
  Layers,
  GraduationCap,
  Briefcase,
  Award,
  ExternalLink
};

export type Project = Profile['projects'][number];
export type Props = { profile: Profile; preview?: boolean };
export const number = (i: number) => String(i + 1).padStart(2, '0');

export function ScrollProgressBar({ accent }: { accent?: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="scroll-progress-container" aria-hidden="true">
      <div className="scroll-progress-bar" style={{ width: `${progress}%`, backgroundColor: accent || 'var(--accent)' }} />
    </div>
  );
}

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      className="scroll-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

export function Frame({ profile, preview, theme, children }: { profile: Profile; preview?: boolean; theme: string; children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`folio ${theme} ${preview ? 'embedded' : ''} variation-${profile.layout}`} style={{ '--accent': profile.accent } as CSSProperties}>
        <a className="skip-link" href="#work">Skip to work</a>
        {children}
      </div>
    </MotionConfig>
  );
}

export function Reveal({ children, className = '', effect = 'rise', delay = 0 }: { children: ReactNode; className?: string; effect?: 'rise' | 'blur' | 'slide' | 'scale' | 'clip'; delay?: number }) {
  const reduced = useReducedMotion();
  const initial = reduced ? false : effect === 'blur' ? { filter: 'blur(9px)', y: 12 } : effect === 'slide' ? { x: -32 } : effect === 'scale' ? { scale: .94 } : effect === 'clip' ? { clipPath: 'inset(0 0 100% 0)' } : { y: 28 };
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ x: 0, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: .12 }}
      transition={{ duration: .65, delay, ease: [.22, 1, .36, 1] }}
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
              initial={reduced ? false : mode === 'blur' ? { filter: 'blur(10px)', y: 10 } : mode === 'clip' ? { y: '105%' } : mode === 'letters' ? { rotateX: 80, y: 15 } : { y: 24 }}
              animate={{ y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: .7, delay: Math.min(j * (mode === 'letters' ? .018 : .06) + i * .12, .8), ease: [.22, 1, .36, 1] }}
            >
              {word}{mode !== 'letters' ? ' ' : ''}
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
        <span aria-label={p.name}>{p.name.split(' ').filter(Boolean).map(s => s[0]).slice(0, 2).join('')}</span>
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
          <span className="art-meta">{project.category} / {project.year}</span>
          <strong>{project.title}</strong>
          <span className="art-index" aria-hidden="true">{number(index)}</span>
        </>
      )}
    </div>
  );
}

export function Skills({ p, onSelectSkill }: { p: Profile; onSelectSkill?: (s: string) => void }) {
  return (
    <ul className="skills">
      {p.skills.filter(Boolean).map((s, i) => (
        <li
          key={i}
          className="interactive-skill-badge"
          onClick={() => onSelectSkill && onSelectSkill(s)}
          title={`Filter projects matching ${s}`}
        >
          {s}
        </li>
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
      {(['github', 'linkedin', 'instagram'] as const).map(k => safeUrl(p[k]) && (
        <a key={k} href={safeUrl(p[k])} target="_blank" rel="noreferrer">
          {{ github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }[k]} <ArrowUpRight size={15} />
        </a>
      ))}
    </div>
  );
}

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  if (!email) return null;
  return (
    <button className="copy-email-btn" onClick={copy} aria-label="Copy email address" type="button">
      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
      <span>{copied ? 'Copied to clipboard!' : 'Copy email'}</span>
    </button>
  );
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || 'Failed to send message.');
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please retry.');
    }
  };

  return (
    <form className="interactive-contact-form" onSubmit={submit}>
      <h4>Send a Direct Message</h4>
      {status === 'success' ? (
        <div className="contact-status success">
          <Check size={18} />
          <span>Thank you! Your message was received and saved in the inbox.</span>
        </div>
      ) : (
        <>
          {status === 'error' && (
            <div className="contact-status error">
              <span>{errorMsg}</span>
            </div>
          )}
          <div className="contact-form-grid">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={status === 'sending'}
            />
            <input
              type="email"
              required
              placeholder="Your Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />
          </div>
          <input
            type="text"
            placeholder="Subject (e.g. Internship, Project Inquiry)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={status === 'sending'}
          />
          <textarea
            required
            rows={2}
            placeholder="Your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={status === 'sending'}
          />
          <button type="submit" className="contact-send-btn" disabled={status === 'sending'}>
            <Send size={15} />
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </>
      )}
    </form>
  );
}

export function Contact({ p }: { p: Profile }) {
  return (
    <div className="contact-details">
      {p.email ? (
        <div className="email-row">
          <a className="email" href={`mailto:${p.email}`}>{p.email}<ArrowUpRight size={24} /></a>
          <CopyEmailButton email={p.email} />
        </div>
      ) : (
        <p className="contact-empty">Contact details coming soon.</p>
      )}
      <Links p={p} />
      <Resume p={p} />
      <ContactForm />
    </div>
  );
}

export function Journey({ p }: { p: Profile }) {
  return (
    <div className="journey-content">
      {p.showEducation && p.education.length > 0 && (
        <div className="journey-group">
          <h3><GraduationCap size={20} /> Education</h3>
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
          <h3><Briefcase size={20} /> Experience</h3>
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
          <h3><Award size={20} /> Highlights & Awards</h3>
          {p.achievements.filter(Boolean).map((x, i) => (
            <Reveal key={i}>
              <p className="achievement"><span>{number(i)}</span>{x}</p>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export const hasJourney = (p: Profile) => (p.showEducation && p.education.length > 0) || (p.showExperience && p.experiences.length > 0) || (p.showAchievements && p.achievements.some(Boolean));

export function EmptyWork() {
  return <p className="empty-work">No projects matching your search filter.</p>;
}

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!project) return;
    const old = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = panel.current?.querySelectorAll<HTMLElement>('a[href],button');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
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
        <motion.div className="project-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="project-dialog"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            tabIndex={-1}
            initial={{ y: 32, scale: .96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="dialog-close" aria-label="Close project" onClick={onClose}><X size={22} /></button>
            <Art project={project} />
            <div className="dialog-copy">
              <span className="meta">{project.category} · {project.year}</span>
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
