'use client';

import { useCallback, useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Frame,
  Photo,
  Art,
  Skills,
  Contact,
  Journey,
  EmptyWork,
  ProjectDialog,
  motion,
  AnimatePresence,
  ArrowUpRight,
  number,
  type Props,
  type Project,
} from './portfolio-kit';
import {
  Search,
  Check,
  Volume2,
  VolumeX,
  Binary,
  Send,
} from 'lucide-react';
import { safeUrl } from '../lib/portfolio';

type Command = 'projects' | 'about' | 'skills' | 'journey' | 'contact';
const commands: Command[] = ['projects', 'about', 'skills', 'journey', 'contact'];

// Web Audio synthesizer for retro terminal click & beep sounds
function playTerminalSound(type: 'click' | 'success' | 'tab' | 'enter') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'tab') {
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'enter') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Audio context may fail if user hasn't interacted or unsupported
  }
}

export default function Portfolio({ profile: p, preview }: Props) {
  const [active, setActive] = useState<Command>('projects');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  
  // Advanced features state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [clock, setClock] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customAccent, setCustomAccent] = useState<string>(p.accent || '#32633b');

  // Synchronize theme accent when profile prop updates
  useEffect(() => {
    if (p.accent) {
      setCustomAccent(p.accent);
    }
  }, [p.accent]);

  // Command history state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Quick message form state
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  // Matrix canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live terminal clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Matrix Digital Rain Effect
  useEffect(() => {
    if (!matrixEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01{}[]<>*+=~#$%^&_PYTHON_DEVELOPER_REACT_NEXTJS_SQL';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(13, 20, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9adb9e';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [matrixEnabled]);

  const close = useCallback(() => setSelected(null), []);

  // Audio helper
  const triggerAudio = (type: 'click' | 'success' | 'tab' | 'enter') => {
    if (audioEnabled) playTerminalSound(type);
  };

  // Switch tab with audio
  const handleTabSwitch = (c: Command) => {
    triggerAudio('tab');
    setActive(c);
    setMessage('');
  };

  // Unique project categories
  const categories = ['All', ...Array.from(new Set(p.projects.map(proj => proj.category).filter(Boolean)))];

  // Filtered projects
  const filteredProjects = p.projects.filter(proj => {
    const matchesCategory = activeCategory === 'All' || proj.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !projectSearch.trim() ||
      proj.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      proj.category.toLowerCase().includes(projectSearch.toLowerCase()) ||
      proj.description.toLowerCase().includes(projectSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Interactive Terminal Runner
  function run(e: FormEvent) {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    triggerAudio('enter');
    setHistory(prev => [...prev, raw]);
    setHistoryIndex(-1);

    const c = raw.toLowerCase();
    const parts = c.split(' ');
    const cmd = parts[0];
    const arg = parts.slice(1).join(' ');

    if (commands.includes(cmd as Command)) {
      setActive(cmd as Command);
      setMessage(`Switched to [${cmd}] section.`);
    } else if (cmd === 'help') {
      setMessage(
        'Available commands: projects, about, skills, journey, contact, theme <color>, whoami, cat resume, matrix, audio, date, clear, help.'
      );
    } else if (cmd === 'theme') {
      if (arg) {
        setCustomAccent(arg.startsWith('#') ? arg : '#' + arg);
        setMessage(`Theme accent updated to: ${arg}`);
      } else {
        setMessage('Usage: theme <#hexcode> (e.g. theme #3157eb or theme #32633b)');
      }
    } else if (cmd === 'whoami') {
      setMessage(`User: visitor@web · Target: ${p.name} (${p.role}) located in ${p.location}`);
    } else if (cmd === 'cat' && (arg === 'resume' || arg === 'resume.md')) {
      setMessage(`Profile: ${p.name} | ${p.role} | Education: ${p.education.length} records | Skills: ${p.skills.join(', ')}`);
    } else if (cmd === 'matrix') {
      setMatrixEnabled(prev => !prev);
      setMessage(`Matrix digital rain backdrop: ${!matrixEnabled ? 'ENABLED' : 'DISABLED'}`);
    } else if (cmd === 'audio') {
      setAudioEnabled(prev => !prev);
      setMessage(`Terminal sound synthesizer: ${!audioEnabled ? 'ENABLED' : 'DISABLED'}`);
    } else if (cmd === 'date') {
      setMessage(`Current system time: ${new Date().toUTCString()}`);
    } else if (cmd === 'clear') {
      setMessage('');
    } else if (cmd === 'echo') {
      setMessage(arg || '(empty string)');
    } else if (cmd === 'admin' || cmd === 'edit') {
      setMessage('Admin management console is restricted. Access directly via /admin URL in your browser.');
    } else {
      setMessage(`Unknown command: "${raw}". Type "help" to see all terminal commands.`);
    }

    setInput('');
  }

  // Handle command history up/down
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    }
  }

  // Send quick message handler
  function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!msgName.trim() || !msgText.trim()) return;
    triggerAudio('success');
    setMsgSent(true);
    setTimeout(() => {
      setMsgName('');
      setMsgEmail('');
      setMsgText('');
      setMsgSent(false);
    }, 4000);
  }

  const effectiveProfile = { ...p, accent: customAccent };

  return (
    <Frame profile={effectiveProfile} preview={preview} theme="terminal-folio">
      {matrixEnabled && <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />}

      {/* Top Terminal Navigation */}
      <header className="terminal-nav">
        <a href="#top">
          <span className="terminal-mark">~/</span>
          {p.name}
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {safeUrl(p.resume) && (
            <a
              href={safeUrl(p.resume)}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#9adb9e', textDecoration: 'none', fontSize: '13px' }}
            >
              Résumé ↗
            </a>
          )}
          <a href="#contact" onClick={() => handleTabSwitch('contact')}>
            Contact ↗
          </a>
        </div>
      </header>

      <main id="top">
        {/* Intro Hero Section */}
        <section className="terminal-intro">
          <div>
            <span className="meta">// {p.role}</span>
            <h1>
              {p.headline}
              <span className="terminal-cursor" aria-hidden="true">
                _
              </span>
            </h1>
            <p>{p.bio.split('\n')[0]}</p>
          </div>

          {/* Hero Profile Photo */}
          <div className="hero-photo-container">
            <div className="hero-photo-frame">
              {safeUrl(p.photo) ? (
                <img
                  src={safeUrl(p.photo)}
                  alt={p.name}
                  className="hero-profile-img"
                  loading="eager"
                />
              ) : (
                <div className="hero-photo-placeholder">
                  <span>
                    {p.name
                      .split(' ')
                      .filter(Boolean)
                      .map(s => s[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Developer Stats Grid */}
        <div className="terminal-stats-grid" aria-label="Key Developer Metrics">
          <div className="terminal-stat-card">
            <span className="stat-value">{p.projects.length}+</span>
            <span className="stat-label">Projects Built</span>
          </div>
          <div className="terminal-stat-card">
            <span className="stat-value">{p.skills.filter(Boolean).length}</span>
            <span className="stat-label">Core Technologies</span>
          </div>
          <div className="terminal-stat-card">
            <span className="stat-value">100%</span>
            <span className="stat-label">Clean Code Focus</span>
          </div>
          <div className="terminal-stat-card">
            <span className="stat-value">Active</span>
            <span className="stat-label">Open to Roles</span>
          </div>
        </div>

        {/* Main Terminal Window */}
        <section id="work" className="terminal-window" aria-label="Portfolio explorer">
          <div className="terminal-titlebar">
            <span>Portfolio</span>
            <div className="terminal-titlebar-right">
              {clock && <span className="terminal-clock">{clock}</span>}
              <button
                type="button"
                className={`terminal-tool-btn ${matrixEnabled ? 'active' : ''}`}
                onClick={() => {
                  setMatrixEnabled(!matrixEnabled);
                  triggerAudio('click');
                }}
                title="Toggle Matrix Rain Effect"
              >
                <Binary size={13} />
                Matrix
              </button>
              <button
                type="button"
                className={`terminal-tool-btn ${audioEnabled ? 'active' : ''}`}
                onClick={() => {
                  setAudioEnabled(!audioEnabled);
                  triggerAudio('click');
                }}
                title="Toggle Audio Feedback"
              >
                {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                Audio
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="terminal-tabs" role="tablist" aria-label="Explore portfolio">
            {commands.map(c => (
              <button
                key={c}
                id={'tab-' + c}
                aria-controls={'panel-' + c}
                role="tab"
                aria-selected={active === c}
                tabIndex={active === c ? 0 : -1}
                onKeyDown={e => {
                  const i = commands.indexOf(c);
                  const next =
                    e.key === 'ArrowRight'
                      ? commands[(i + 1) % commands.length]
                      : e.key === 'ArrowLeft'
                      ? commands[(i - 1 + commands.length) % commands.length]
                      : e.key === 'Home'
                      ? commands[0]
                      : e.key === 'End'
                      ? commands[commands.length - 1]
                      : null;
                  if (next) {
                    e.preventDefault();
                    handleTabSwitch(next);
                    document.getElementById('tab-' + next)?.focus();
                  }
                }}
                onClick={() => handleTabSwitch(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Tab Panel Content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="terminal-output"
              key={active}
              id={'panel-' + active}
              role="tabpanel"
              aria-labelledby={'tab-' + active}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {active === 'projects' && (
                <>
                  <div className="terminal-path">$ ls projects/ --interactive</div>

                  {/* Search and Category Filter Bar */}
                  <div className="terminal-projects-controls">
                    <div className="project-search-wrapper">
                      <Search size={16} className="project-search-icon" />
                      <input
                        type="text"
                        className="project-search-input"
                        placeholder="Search projects by keyword, tech, or title..."
                        value={projectSearch}
                        onChange={e => setProjectSearch(e.target.value)}
                        aria-label="Filter projects"
                      />
                    </div>

                    <div className="project-categories">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                          onClick={() => {
                            triggerAudio('click');
                            setActiveCategory(cat);
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Projects Grid */}
                  <div className="terminal-projects">
                    {filteredProjects.length ? (
                      filteredProjects.map((x, i) => (
                        <button
                          className="terminal-project"
                          onClick={() => {
                            triggerAudio('click');
                            setSelected(x);
                          }}
                          key={i}
                        >
                          <div>
                            <span>
                              {number(i)} / {x.year}
                            </span>
                            <ArrowUpRight size={18} />
                          </div>
                          <Art project={x} index={i} />
                          <h2>{x.title}</h2>
                          <p>{x.category}</p>
                        </button>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', padding: '30px 0', textAlign: 'center' }}>
                        <p style={{ color: 'var(--sub)' }}>No matching projects found. Try resetting filters.</p>
                        <button
                          type="button"
                          className="category-pill"
                          style={{ marginTop: '10px' }}
                          onClick={() => {
                            setProjectSearch('');
                            setActiveCategory('All');
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {active === 'about' && (
                <>
                  <div className="terminal-path">$ cat about.md</div>
                  <h2>About {p.name}</h2>
                  <p className="bio" style={{ lineHeight: '1.9', fontSize: '17px' }}>
                    {p.bio}
                  </p>
                </>
              )}

              {active === 'skills' && (
                <>
                  <div className="terminal-path">$ cat skills.txt</div>
                  <h2>The Developer Toolkit</h2>
                  <Skills p={p} />
                </>
              )}

              {active === 'journey' && (
                <>
                  <div className="terminal-path">$ cat journey.md</div>
                  <h2>Education & Experience</h2>
                  <Journey p={p} />
                  {!(
                    (p.showEducation && p.education.length) ||
                    (p.showExperience && p.experiences.length) ||
                    (p.showAchievements && p.achievements.some(Boolean))
                  ) && <p>Journey details coming soon.</p>}
                </>
              )}

              {active === 'contact' && (
                <div id="contact">
                  <div className="terminal-path">$ open contact_channel</div>
                  <h2>Let’s build something great.</h2>

                  <div className="terminal-contact-container">
                    <div>
                      <Contact p={p} />
                    </div>

                    {/* Interactive Quick Message Form */}
                    <div className="terminal-quick-message">
                      <h3>
                        <Send size={18} color="#9adb9e" /> Send a Direct Message
                      </h3>
                      <p>Send a message directly to my terminal inbox.</p>

                      {msgSent ? (
                        <div className="quick-msg-success">
                          <Check size={18} /> Message received! Thank you for reaching out.
                        </div>
                      ) : (
                        <form onSubmit={handleSendMessage} className="quick-msg-form">
                          <div className="msg-field">
                            <label htmlFor="msg-name">Name</label>
                            <input
                              id="msg-name"
                              type="text"
                              required
                              placeholder="Your Name"
                              value={msgName}
                              onChange={e => setMsgName(e.target.value)}
                            />
                          </div>

                          <div className="msg-field">
                            <label htmlFor="msg-email">Email</label>
                            <input
                              id="msg-email"
                              type="email"
                              required
                              placeholder="your.email@example.com"
                              value={msgEmail}
                              onChange={e => setMsgEmail(e.target.value)}
                            />
                          </div>

                          <div className="msg-field">
                            <label htmlFor="msg-text">Message</label>
                            <textarea
                              id="msg-text"
                              rows={3}
                              required
                              placeholder="Hi, I’d like to collaborate on..."
                              value={msgText}
                              onChange={e => setMsgText(e.target.value)}
                            />
                          </div>

                          <button type="submit" className="quick-msg-btn">
                            Transmit Message ↵
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Interactive Command Prompt */}
          <form className="terminal-prompt" onSubmit={run}>
            <label htmlFor="command">$</label>
            <input
              id="command"
              aria-label="Portfolio command"
              autoComplete="off"
              spellCheck={false}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type projects, about, skills, journey, contact, theme <color>, whoami or help (↑/↓ history)"
            />
            <button type="submit">Run ↵</button>
          </form>

          {message && (
            <p className="terminal-message" role="status">
              {message}
            </p>
          )}
        </section>

        {/* Public Footer (Admin link removed from public view) */}
        <footer className="terminal-footer">
          <span>
            {p.name} / {p.location}
          </span>
          <span>Curiosity → code → possibilities</span>
        </footer>
      </main>

      {/* Project Details Modal */}
      <ProjectDialog project={selected} onClose={close} />
    </Frame>
  );
}
