'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { safeUrl, type Profile, type Project } from '../lib/portfolio';
import {
  playMacClick,
  playMacChime,
  playWindowOpen,
  playWindowClose,
  playRetroBeep,
  isSoundEnabled,
  setSoundEnabled,
} from '../lib/retro-audio';
import {
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  Send,
  X,
  Search,
  Clock,
  HardDrive,
  Volume2,
  VolumeX,
  Tv,
  Calculator,
  Info,
  Lock,
  Layers
} from 'lucide-react';

interface BlogPost {
  id: string;
  filename: string;
  title: string;
  date: string;
  desc: string;
  image: string;
  tag: string;
  content: string;
}

export default function RetroMacPortfolio({ profile: initialProfile }: { profile: Profile; preview?: boolean }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [activeCascade, setActiveCascade] = useState<number>(0);

  // Audio & CRT FX state
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [crtOn, setCrtOn] = useState<boolean>(false);

  // Apple dropdown menu & accessory modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutMacOpen, setAboutMacOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Hero Mac CRT interactive face: 0: Happy, 1: Wink, 2: Cool, 3: Surprised
  const [macFaceIndex, setMacFaceIndex] = useState<number>(0);
  const [faceSpeech, setFaceSpeech] = useState<string>('Hello! Click my face.');

  // Calculator State
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcResetOnNext, setCalcResetOnNext] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Live system clock
  const [currentTime, setCurrentTime] = useState<string>('11:00 AM');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Update profile if initialProfile changes & load from projects.json API
  useEffect(() => {
    setProfile(initialProfile);

    async function loadLatestFromDisk() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const diskData = (await res.json()) as Profile;
          if (diskData && diskData.name) {
            setProfile(diskData);
          }
        }
      } catch {}
    }
    loadLatestFromDisk();
  }, [initialProfile]);

  const p = profile;

  // Sound toggle helper
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playMacClick();
  };

  // CRT toggle helper
  const toggleCRT = () => {
    playMacClick();
    setCrtOn((prev) => !prev);
  };

  // Cycle Mac Face
  const handleMacFaceClick = () => {
    const nextIdx = (macFaceIndex + 1) % 4;
    setMacFaceIndex(nextIdx);
    const speechPhrases = [
      'Classic 1984 Happy Mac ☺',
      'System 7.5 Winking at ya! 😉',
      'Stay Cool, Stay Retro! 😎',
      'Woah! 16MB of RAM! 😮',
    ];
    setFaceSpeech(speechPhrases[nextIdx]);
    playMacChime();
  };

  // Calculator logic
  const handleCalcBtn = (val: string) => {
    playMacClick();

    if (val === 'C') {
      setCalcInput('0');
      setCalcPrev(null);
      setCalcOp(null);
      setCalcResetOnNext(false);
      return;
    }

    if (val === '+' || val === '-' || val === '×' || val === '÷') {
      const current = parseFloat(calcInput);
      if (calcPrev !== null && calcOp && !calcResetOnNext) {
        let result = calcPrev;
        if (calcOp === '+') result = calcPrev + current;
        if (calcOp === '-') result = calcPrev - current;
        if (calcOp === '×') result = calcPrev * current;
        if (calcOp === '÷') result = current !== 0 ? calcPrev / current : 0;
        setCalcInput(String(Math.round(result * 1000000) / 1000000));
        setCalcPrev(result);
      } else {
        setCalcPrev(current);
      }
      setCalcOp(val);
      setCalcResetOnNext(true);
      return;
    }

    if (val === '=') {
      if (calcPrev === null || !calcOp) return;
      const current = parseFloat(calcInput);
      let result = calcPrev;
      if (calcOp === '+') result = calcPrev + current;
      if (calcOp === '-') result = calcPrev - current;
      if (calcOp === '×') result = calcPrev * current;
      if (calcOp === '÷') result = current !== 0 ? calcPrev / current : 0;
      setCalcInput(String(Math.round(result * 1000000) / 1000000));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcResetOnNext(true);
      return;
    }

    if (val === '.') {
      if (calcResetOnNext) {
        setCalcInput('0.');
        setCalcResetOnNext(false);
      } else if (!calcInput.includes('.')) {
        setCalcInput(calcInput + '.');
      }
      return;
    }

    // Numbers 0-9
    if (calcResetOnNext || calcInput === '0') {
      setCalcInput(val);
      setCalcResetOnNext(false);
    } else {
      if (calcInput.length < 12) {
        setCalcInput(calcInput + val);
      }
    }
  };

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    p.projects.forEach((proj) => {
      if (proj.category) set.add(proj.category);
    });
    return ['All', ...Array.from(set)];
  }, [p.projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return p.projects.filter((project) => {
      const matchesCat =
        selectedCategory === 'All' ||
        project.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [p.projects, selectedCategory, searchQuery]);

  // Copy email
  const handleCopyEmail = () => {
    if (!p.email) return;
    navigator.clipboard.writeText(p.email);
    playMacClick();
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Contact note submit -> sends directly via WhatsApp!
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    playMacClick();

    // Target recipient WhatsApp / Mobile number
    const targetPhone = (p.phone || '+919876543210').replace(/[^0-9]/g, '');

    // Structured message template for WhatsApp
    const messageBody = `*Hello ${firstName}! New Portfolio Inquiry*\n\n` +
      `👤 *Name:* ${contactName.trim() || 'Visitor'}\n` +
      `📧 *Email:* ${contactEmail.trim() || 'Not specified'}\n` +
      `📱 *Mobile / WhatsApp:* ${contactPhone.trim() || 'Not specified'}\n\n` +
      `💬 *Message:*\n${contactMessage.trim()}`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageBody)}`;

    // Open WhatsApp directly in a new window/tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setMessageSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setMessageSent(false);
    }, 6000);
  };

  // 4 Cascading Blog Posts (matching user reference image precisely)
  const blogPosts: BlogPost[] = useMemo(() => {
    return [
      {
        id: 'post-1',
        filename: '2020-04-07-blog.pdf',
        title: 'Minimalist Tools & Cognitive Clarity',
        date: 'April 07, 2026',
        desc: 'Reflections on why retro software, focused single-purpose tools, and distraction-free design foster deeper creative work.',
        image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
        tag: 'Design Philosophy',
        content: `When the first Macintosh launched in 1984, it didn't overwhelm the user with infinite notifications, algorithmic feeds, or cognitive clutter. It offered a clean desktop, a menu bar, and a mouse.

In modern frontend architecture, we often over-engineer simple problems. By constraining our toolset and honoring whitespace, typography, and clear visual hierarchy, we allow users to focus purely on the task at hand. This portfolio pays homage to that enduring design philosophy.`,
      },
      {
        id: 'post-2',
        filename: '2020-04-06-blog.pdf',
        title: 'High-Altitude Design Systems in React',
        date: 'April 06, 2026',
        desc: 'Exploring structural composability, atomic primitives, and maintaining 60fps tactile feedback across complex web applications.',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        tag: 'Architecture',
        content: `A design system is only as resilient as its lowest primitive. When building tokenized component libraries, separating layout constraints from interactive states ensures consistent responsiveness.

In this project, every window, card, button, and dialog shares the exact same 2px retro borders, pixel-sharp drop shadows, and high-contrast typography, resulting in a cohesive tactile experience.`,
      },
      {
        id: 'post-3',
        filename: '2020-04-06-blog.pdf',
        title: 'Tactile Computing & Web Audio Physics',
        date: 'April 06, 2026',
        desc: 'Synthesizing native 8-bit sound waves using Web Audio API oscillators to provide micro-tactile haptic feedback in the browser.',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        tag: 'Creative Lab',
        content: `Sound is one of the most underutilized dimensions in web design. When a physical mechanical button is pressed, the audible click provides immediate confirmation to the brain before visual processing finishes.

By harnessing native Web Audio API oscillators (F# major chord synthesis, square-wave mechanical clicks, and sine frequency sweeps), we can create instantaneous tactile satisfaction without downloading heavy external audio files.`,
      },
      {
        id: 'post-4',
        filename: '2020-04-06-blog.pdf',
        title: 'Local Hard Drive JSON Sync with Node.js',
        date: 'April 06, 2026',
        desc: 'Real-time hard drive persistence: how saving in the JWT admin portal instantly rewrites local projects.json without rebuild delay.',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        tag: 'Full-Stack',
        content: `Static site generators often require slow CI/CD builds just to update a project title or image. By pairing a local Node.js file system listener with HS256 JWT authorization, any edit made inside /admin writes directly to the physical projects.json on the hard drive.

Both the client and Vite SSR server hydrate directly from the disk file, achieving true zero-latency content management.`,
      },
    ];
  }, []);

  const firstName = p.name ? p.name.split(' ')[0] : 'Mac';

  return (
    <div className={`mac-desktop-outer ${crtOn ? 'crt-active' : ''}`}>
      <div className="mac-desktop-shell">
        {/* 1. TOP MENU BAR (FULL SCREEN WIDTH) */}
        <header className="mac-top-menubar">
          {/* Apple / Macintosh System Icon Dropdown */}
          <div ref={menuRef} style={{ position: 'relative', height: '100%' }}>
            <div
              className={`mac-menu-icon ${menuOpen ? 'active' : ''}`}
              title="Apple System Menu"
              onClick={() => {
                playMacClick();
                setMenuOpen(!menuOpen);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M9 12a3 3 0 0 0 6 0" />
              </svg>
            </div>

            {/* Retro Apple System Dropdown */}
            {menuOpen && (
              <div className="mac-apple-dropdown">
                <button
                  className="mac-dropdown-item"
                  onClick={() => {
                    playWindowOpen();
                    setAboutMacOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  <Info size={15} /> About This Mac...
                </button>
                <button
                  className="mac-dropdown-item"
                  onClick={() => {
                    playWindowOpen();
                    setCalcOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  <Calculator size={15} /> Calculator
                </button>
                <div className="mac-dropdown-divider" />
                <button
                  className="mac-dropdown-item"
                  onClick={() => {
                    toggleSound();
                    setMenuOpen(false);
                  }}
                >
                  {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  Sound FX: {soundOn ? 'Enabled' : 'Muted'}
                </button>
                <button
                  className="mac-dropdown-item"
                  onClick={() => {
                    toggleCRT();
                    setMenuOpen(false);
                  }}
                >
                  <Tv size={15} /> CRT Scanlines: {crtOn ? 'ON' : 'OFF'}
                </button>
                <div className="mac-dropdown-divider" />
                <a
                  href="/admin"
                  className="mac-dropdown-item"
                  onClick={() => {
                    playMacClick();
                    setMenuOpen(false);
                  }}
                >
                  <Lock size={15} /> Admin Portal (JWT)
                </a>
              </div>
            )}
          </div>

          {/* Menubar Navigation Links */}
          <nav className="mac-menu-items">
            <a
              href="#projects"
              className="mac-menu-link"
              onClick={() => playMacClick()}
            >
              Projects
            </a>
            <a
              href="#blog"
              className="mac-menu-link"
              onClick={() => playMacClick()}
            >
              Blog
            </a>
            <a
              href="#about"
              className="mac-menu-link"
              onClick={() => playMacClick()}
            >
              Learn
            </a>
            <a
              href="#about"
              className="mac-menu-link"
              onClick={() => playMacClick()}
            >
              Clone me
            </a>
            <a
              href="#contact"
              className="mac-menu-link"
              onClick={() => playMacClick()}
            >
              Find me
            </a>
          </nav>

          {/* Menubar Right Actions: Sound, CRT, System Clock */}
          <div className="mac-menubar-right">
            <button
              onClick={toggleSound}
              className={`mac-quick-toggle-btn ${soundOn ? 'active' : ''}`}
              title="Toggle Retro 8-bit Audio Effects"
            >
              {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundOn ? 'SOUND' : 'MUTE'}</span>
            </button>

            <button
              onClick={toggleCRT}
              className={`mac-quick-toggle-btn ${crtOn ? 'active' : ''}`}
              title="Toggle CRT Monitor Scanlines"
            >
              <Tv size={13} />
              <span>CRT</span>
            </button>

            <div className="mac-system-clock">
              <Clock size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
              {currentTime}
            </div>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        <section id="top" className="mac-hero-section">
          <div className="mac-content-wrap">
            <div className="mac-hero-grid">
              <div className="mac-hero-content">
                <h1 className="mac-hero-headline">
                  <span>Hello.</span>
                  <span>I'm {firstName || 'Mac'}.</span>
                </h1>

                <p className="mac-hero-bio">
                  {p.headline || "I'm a free retro Webflow template made by Mackenzie Child."}{' '}
                  {p.location && (
                    <>Based in <strong>{p.location}</strong>.</>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <a
                    href="#projects"
                    className="mac-button mac-button-black"
                    onClick={() => playMacClick()}
                  >
                    Explore Projects ↓
                  </a>
                  {safeUrl(p.resume) ? (
                    <a
                      href={safeUrl(p.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="mac-button"
                      onClick={() => playMacClick()}
                    >
                      Download Résumé ↗
                    </a>
                  ) : (
                    <a
                      href="#contact"
                      className="mac-button"
                      onClick={() => playMacClick()}
                    >
                      Clone me on Webflow
                    </a>
                  )}
                </div>
              </div>

              {/* Retro Classic Macintosh Vector Illustration with Pen Tool & Hand */}
              <div
                className="mac-hero-illustration"
                title="Click Macintosh screen to change expression!"
              >
                <div className="mac-face-speech-bubble">
                  {faceSpeech}
                </div>

                <svg
                  className="mac-computer-svg"
                  viewBox="0 0 420 360"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={handleMacFaceClick}
                >
                  {/* Coiled mouse cable on right */}
                  <path
                    d="M335 210 C380 200, 380 240, 350 250 C385 260, 375 300, 325 295"
                    stroke="#000000"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Hand clutching Technical Drafting Pen Nib Tool */}
                  <g transform="translate(14, 45)">
                    {/* Upper Pen Nib Blade */}
                    <path
                      d="M52 14 L78 74 L68 135 L36 135 L26 74 Z"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                    />
                    {/* Nib breather hole & slit */}
                    <circle cx="52" cy="65" r="5.5" fill="#000000" />
                    <line x1="52" y1="14" x2="52" y2="60" stroke="#000000" strokeWidth="3" />
                    
                    {/* Metal Ferrule Collar */}
                    <rect x="36" y="135" width="32" height="20" fill="#000000" stroke="#000000" strokeWidth="3" />
                    
                    {/* Pen Handle Stem */}
                    <rect x="42" y="155" width="20" height="90" fill="#ffffff" stroke="#000000" strokeWidth="4.5" />

                    {/* Human Fist Fingers Gripping Handle */}
                    {/* Finger 1 */}
                    <path
                      d="M26 135 C15 135, 14 152, 28 152 L42 152"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                    />
                    {/* Finger 2 */}
                    <path
                      d="M26 154 C14 154, 14 172, 28 172 L42 172"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                    />
                    {/* Finger 3 */}
                    <path
                      d="M28 174 C16 174, 16 192, 30 192 L42 192"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                    />
                    {/* Thumb wrapped around opposite side */}
                    <path
                      d="M62 148 C76 148, 78 168, 62 172"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="4.5"
                    />
                    {/* Wrist contour */}
                    <path
                      d="M22 195 L22 235 L42 235"
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>

                  {/* Mac 128k Outer Casing */}
                  <rect
                    x="142"
                    y="45"
                    width="196"
                    height="235"
                    rx="22"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="5"
                  />

                  {/* Top Carrying Handle Recess */}
                  <rect
                    x="195"
                    y="52"
                    width="90"
                    height="10"
                    rx="5"
                    fill="#e0e0e0"
                    stroke="#000000"
                    strokeWidth="2.5"
                  />

                  {/* CRT Monitor Recess Screen */}
                  <rect
                    x="164"
                    y="72"
                    width="152"
                    height="126"
                    rx="14"
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth="4"
                  />

                  {/* Interactive Screen Expressions */}
                  <g transform="translate(180, 82)">
                    {/* Screen inner glow frame */}
                    <rect x="10" y="8" width="96" height="88" rx="16" fill="#000000" stroke="#ffffff" strokeWidth="4" />

                    {/* Expression 0: Classic Happy Mac */}
                    {macFaceIndex === 0 && (
                      <g>
                        <circle cx="42" cy="38" r="6" fill="#ffffff" />
                        <circle cx="74" cy="38" r="6" fill="#ffffff" />
                        <path d="M58 45 L58 54 L53 58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <path
                          d="M38 65 Q58 84 78 65"
                          stroke="#ffffff"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Expression 1: Winking Mac */}
                    {macFaceIndex === 1 && (
                      <g>
                        {/* Winking eye */}
                        <path d="M34 40 L42 32 L50 40" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                        {/* Open eye */}
                        <circle cx="74" cy="38" r="6.5" fill="#ffffff" />
                        <path d="M58 45 L58 54 L53 58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        {/* Smirk smile */}
                        <path
                          d="M40 68 Q58 86 80 62"
                          stroke="#ffffff"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Expression 2: Cool Sunglasses Mac */}
                    {macFaceIndex === 2 && (
                      <g>
                        {/* Sunglasses frames */}
                        <rect x="28" y="32" width="26" height="16" rx="3" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
                        <rect x="62" y="32" width="26" height="16" rx="3" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
                        <line x1="54" y1="38" x2="62" y2="38" stroke="#ffffff" strokeWidth="3.5" />
                        {/* Smirk */}
                        <path
                          d="M44 68 Q58 76 76 64"
                          stroke="#ffffff"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Expression 3: Surprised Mac */}
                    {macFaceIndex === 3 && (
                      <g>
                        <circle cx="40" cy="36" r="8" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                        <circle cx="40" cy="36" r="3" fill="#ffffff" />
                        <circle cx="76" cy="36" r="8" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                        <circle cx="76" cy="36" r="3" fill="#ffffff" />
                        {/* Round O mouth */}
                        <ellipse cx="58" cy="68" rx="8" ry="10" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                      </g>
                    )}
                  </g>

                  {/* Floppy Disk Drive Slot */}
                  <rect
                    x="250"
                    y="228"
                    width="70"
                    height="9"
                    rx="2"
                    fill="#000000"
                  />

                  {/* Finder / Apple Logo Inset */}
                  <rect
                    x="168"
                    y="225"
                    width="15"
                    height="15"
                    rx="2"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="3"
                  />

                  {/* Bottom Bevel Base / Feet */}
                  <path
                    d="M132 280 L348 280 L362 306 L118 306 Z"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />

                  {/* Keyboard Front Lip */}
                  <rect
                    x="172"
                    y="296"
                    width="136"
                    height="15"
                    rx="3"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 3. QUICK LINKS SECTION */}
        <section className="mac-quicklinks-section">
          <div className="mac-content-wrap">
            <h2 className="mac-section-label">Quick links</h2>

            {/* 4 Conjoined Links Touching in Single Unit */}
            <div className="mac-quicklinks-bar">
              <a
                href="#blog"
                className="mac-quicklink-item"
                onClick={() => playMacClick()}
              >
                <span>Blog</span>
                <span>↗</span>
              </a>
              <a
                href="#projects"
                className="mac-quicklink-item"
                onClick={() => playMacClick()}
              >
                <span>Projects</span>
                <span>↗</span>
              </a>
              <a
                href="#about"
                className="mac-quicklink-item"
                onClick={() => playMacClick()}
              >
                <span>About</span>
                <span>↗</span>
              </a>
              <a
                href="#contact"
                className="mac-quicklink-item"
                onClick={() => playMacClick()}
              >
                <span>Contact</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4. PROJECTS SECTION (FULL WIDTH WITH STIPPLED PATTERN BACKGROUND) */}
        <section id="projects" className="mac-projects-section">
          <div className="mac-content-wrap">
            <div className="mac-section-header">
              <h2 className="mac-section-title">Projects</h2>
              <span
                className="mac-section-sublink"
                onClick={() => {
                  playMacClick();
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Show all ({p.projects.length})
              </span>
            </div>

            {/* Search & Categories Filter */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="mac-input-field"
                  style={{ width: '100%', paddingLeft: '34px', boxShadow: '2px 2px 0px #000' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '11px', top: '12px', color: '#555' }} />
                {searchQuery && (
                  <button
                    onClick={() => {
                      playMacClick();
                      setSearchQuery('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="mac-filter-bar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playMacClick();
                      setSelectedCategory(cat);
                    }}
                    className={`mac-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Retro Window Grid */}
            <div className="mac-projects-grid">
              {filteredProjects.map((proj, idx) => {
                const fileTitle = `${proj.year || '2020-04-08'}-${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
                const imgSrc = safeUrl(proj.image);

                return (
                  <article key={idx} className="mac-window-card">
                    {/* Window Chrome Header */}
                    <div className="mac-window-header">
                      <div className="mac-window-controls">
                        <span className="mac-window-pip" />
                        <span className="mac-window-pip" />
                      </div>
                      <span className="mac-window-title">{fileTitle}</span>
                    </div>

                    {/* Window Image Preview */}
                    <div className="mac-window-preview-area">
                      {imgSrc ? (
                        <img src={imgSrc} alt={proj.title} className="mac-window-preview-img" />
                      ) : (
                        <div className="mac-window-preview-fallback">
                          <HardDrive size={28} />
                          <span>[ {proj.title} ]</span>
                        </div>
                      )}
                    </div>

                    {/* Window Content Body */}
                    <div className="mac-window-body">
                      <h3 className="mac-card-title">{proj.title}</h3>
                      <p className="mac-card-desc">{proj.description}</p>

                      <div className="mac-window-footer">
                        <button
                          onClick={() => {
                            playWindowOpen();
                            setSelectedProject(proj);
                          }}
                          className="mac-button"
                        >
                          View project
                        </button>

                        {safeUrl(proj.url) && (
                          <a
                            href={safeUrl(proj.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="mac-button mac-button-black"
                            title="Open live URL"
                            onClick={() => playMacClick()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. "FROM THE BLOG" / CASCADING OVERLAPPING WINDOWS SECTION */}
        <section id="blog" className="mac-blog-section">
          <div className="mac-content-wrap">
            <div className="mac-section-header">
              <div>
                <h2 className="mac-section-title">From the blog</h2>
                <span
                  className="mac-section-sublink"
                  onClick={() => {
                    playWindowOpen();
                    setSelectedBlogPost(blogPosts[0]);
                  }}
                >
                  View all blog posts
                </span>
              </div>
            </div>

            {/* Cascading Overlapping Mac Windows (4 Staggered Windows matching user's image) */}
            <div className="mac-cascading-container">
              {blogPosts.map((post, idx) => {
                const isActive = activeCascade === idx;
                // Alternating staggered offsets
                const offsets = [
                  { top: '0px', left: '0%', z: 10 },
                  { top: '85px', left: '42%', z: 20 },
                  { top: '235px', left: '4%', z: 30 },
                  { top: '350px', left: '40%', z: 40 },
                ];
                const pos = offsets[idx % offsets.length];

                return (
                  <motion.div
                    key={post.id}
                    onClick={() => {
                      playMacClick();
                      setActiveCascade(idx);
                    }}
                    className={`mac-cascade-window ${isActive ? 'active-top' : ''}`}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      zIndex: isActive ? 80 : pos.z,
                    }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="mac-window-header">
                      <div className="mac-window-controls">
                        <span className="mac-window-pip" />
                        <span className="mac-window-pip" />
                      </div>
                      <span className="mac-window-title">{post.filename}</span>
                    </div>

                    <div className="mac-cascade-preview">
                      <img src={post.image} alt={post.title} />
                    </div>

                    <div className="mac-cascade-body">
                      <h4>{post.title}</h4>
                      <p>{post.desc}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playWindowOpen();
                          setSelectedBlogPost(post);
                        }}
                        className="mac-cascade-read-btn"
                      >
                        Read Post <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. ABOUT & SKILLS SECTION */}
        <section id="about" className="mac-about-section">
          <div className="mac-content-wrap">
            <div className="mac-section-header">
              <h2 className="mac-section-title">About Me</h2>
            </div>

            <div className="mac-system-dialog-box">
              <div className="mac-window-header">
                <div className="mac-window-controls">
                  <span className="mac-window-pip" />
                  <span className="mac-window-pip" />
                </div>
                <span className="mac-window-title">System-Profile-Info.txt</span>
              </div>

              <div className="mac-dialog-inner">
                <p style={{ fontSize: '16.5px', lineHeight: 1.85, margin: '0 0 24px', whiteSpace: 'pre-line' }}>
                  {p.bio}
                </p>

                <div id="skills" style={{ borderTop: '2px solid #000', paddingTop: '22px', marginTop: '22px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px' }}>
                    Tools & Technical Stack
                  </h3>
                  <div className="mac-skills-tag-grid">
                    {p.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="mac-skill-pill">
                        <span>▪</span> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {p.showEducation && p.education.length > 0 && (
                  <div style={{ borderTop: '2px solid #000', paddingTop: '22px', marginTop: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px' }}>Education</h3>
                    {p.education.map((edu, eIdx) => (
                      <div key={eIdx} style={{ marginBottom: '14px' }}>
                        <strong style={{ fontSize: '15px' }}>{edu.degree}</strong> — <span>{edu.school}</span> ({edu.period})
                        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#444' }}>{edu.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 7. CONTACT / FIND ME SECTION */}
        <footer id="contact" className="mac-contact-section">
          <div className="mac-content-wrap">
            <h2 className="mac-section-title">Find me</h2>

            <div className="mac-contact-grid">
              {/* Left: Direct Contact Information */}
              <div className="mac-contact-card">
                <h3>Let's collaborate.</h3>
                <p>
                  Interested in working together or hiring me for an internship or project? Drop an email directly or find me across my social profiles.
                </p>

                {p.email && (
                  <div className="mac-email-action-row">
                    <span className="mac-email-display">{p.email}</span>
                    <button onClick={handleCopyEmail} className="mac-button">
                      {copiedEmail ? (
                        <>
                          <Check size={14} color="#16a34a" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}

                {p.phone && (
                  <div className="mac-email-action-row" style={{ marginTop: '-10px', marginBottom: '24px' }}>
                    <span className="mac-email-display">📱 {p.phone}</span>
                    <a
                      href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mac-button"
                      onClick={() => playMacClick()}
                    >
                      Chat on WhatsApp ↗
                    </a>
                  </div>
                )}

                <div className="mac-social-links-bar">
                  {(['github', 'linkedin', 'instagram'] as const).map(
                    (k) =>
                      safeUrl(p[k]) && (
                        <a
                          key={k}
                          href={safeUrl(p[k])}
                          target="_blank"
                          rel="noreferrer"
                          className="mac-social-btn"
                          onClick={() => playMacClick()}
                        >
                          {{ github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }[k]}
                          <ArrowUpRight size={14} />
                        </a>
                      )
                  )}
                </div>
              </div>

              {/* Right: Quick Note Form */}
              <div className="mac-contact-card">
                <h3>Send a message</h3>

                {messageSent ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#eefcf1', border: '2px solid #000' }}>
                    <Check size={28} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                    <strong style={{ display: 'block', fontSize: '16px' }}>WhatsApp Chat Initialized!</strong>
                    <span style={{ fontSize: '13.5px', color: '#555' }}>Opening WhatsApp in a new tab with your message details.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="mac-note-form">
                    <div className="mac-input-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Jane Doe"
                        className="mac-input-field"
                      />
                    </div>

                    <div className="mac-input-group">
                      <label>Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="mac-input-field"
                      />
                    </div>

                    <div className="mac-input-group">
                      <label>Your Mobile / WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mac-input-field"
                      />
                    </div>

                    <div className="mac-input-group">
                      <label>Message</label>
                      <textarea
                        rows={3}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Hi Aarav, I would like to talk about..."
                        className="mac-input-field"
                      />
                    </div>

                    <button type="submit" className="mac-button mac-button-black" style={{ marginTop: '4px' }}>
                      <Send size={14} style={{ marginRight: '6px' }} /> Send Message via WhatsApp
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </footer>

        {/* 8. FOOTER BAR (FULL WIDTH) */}
        <div className="mac-desktop-footer">
          <div className="mac-content-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
            <span>Macintosh System 7.5 · Student Portfolio 07</span>
            <span>Local Hard Drive: projects.json synced</span>
          </div>
        </div>
      </div>

      {/* 9. RETRO MAC MODAL POPUP FOR "VIEW PROJECT" */}
      <AnimatePresence>
        {selectedProject && (
          <div
            className="mac-modal-backdrop"
            onClick={() => {
              playWindowClose();
              setSelectedProject(null);
            }}
          >
            <div className="mac-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="mac-modal-header">
                <button
                  className="mac-close-square"
                  onClick={() => {
                    playWindowClose();
                    setSelectedProject(null);
                  }}
                  aria-label="Close window"
                >
                  ×
                </button>
                <span className="mac-modal-title">
                  {selectedProject.year || '2026'}-{selectedProject.title}.html
                </span>
              </div>

              <div className="mac-modal-content">
                {safeUrl(selectedProject.image) && (
                  <img
                    src={safeUrl(selectedProject.image)}
                    alt={selectedProject.title}
                    className="mac-modal-img"
                  />
                )}

                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>
                  {selectedProject.title}
                </h2>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    border: '1.5px solid #000',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    background: '#f2f2f2',
                  }}
                >
                  {selectedProject.category} · {selectedProject.year}
                </span>

                <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#222' }}>
                  {selectedProject.description}
                </p>

                <div className="mac-modal-actions">
                  {safeUrl(selectedProject.url) && (
                    <a
                      href={safeUrl(selectedProject.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="mac-button mac-button-black"
                      onClick={() => playMacClick()}
                    >
                      Visit Live Project <ArrowUpRight size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      playWindowClose();
                      setSelectedProject(null);
                    }}
                    className="mac-button"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. BLOG ARTICLE READER MODAL */}
      <AnimatePresence>
        {selectedBlogPost && (
          <div
            className="mac-modal-backdrop"
            onClick={() => {
              playWindowClose();
              setSelectedBlogPost(null);
            }}
          >
            <div className="mac-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="mac-modal-header">
                <button
                  className="mac-close-square"
                  onClick={() => {
                    playWindowClose();
                    setSelectedBlogPost(null);
                  }}
                  aria-label="Close article"
                >
                  ×
                </button>
                <span className="mac-modal-title">{selectedBlogPost.filename}</span>
              </div>

              <div className="mac-modal-content">
                <img
                  src={selectedBlogPost.image}
                  alt={selectedBlogPost.title}
                  className="mac-modal-img"
                  style={{ maxHeight: '280px' }}
                />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: '#000',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                    }}
                  >
                    {selectedBlogPost.tag}
                  </span>
                  <span style={{ fontSize: '13px', color: '#666', fontFamily: 'Space Mono, monospace' }}>
                    {selectedBlogPost.date}
                  </span>
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 16px' }}>
                  {selectedBlogPost.title}
                </h2>

                <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#1a1a1a', whiteSpace: 'pre-line' }}>
                  {selectedBlogPost.content}
                </div>

                <div className="mac-modal-actions">
                  <button
                    onClick={() => {
                      playWindowClose();
                      setSelectedBlogPost(null);
                    }}
                    className="mac-button mac-button-black"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. "ABOUT THIS MAC" SYSTEM DIALOG */}
      <AnimatePresence>
        {aboutMacOpen && (
          <div
            className="mac-modal-backdrop"
            onClick={() => {
              playWindowClose();
              setAboutMacOpen(false);
            }}
          >
            <div
              className="mac-modal-window"
              style={{ maxWidth: '520px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mac-modal-header">
                <button
                  className="mac-close-square"
                  onClick={() => {
                    playWindowClose();
                    setAboutMacOpen(false);
                  }}
                >
                  ×
                </button>
                <span className="mac-modal-title">About This Computer</span>
              </div>

              <div className="mac-modal-content" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M9 12a3 3 0 0 0 6 0" />
                  </svg>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900 }}>
                      Macintosh System 7.5.5
                    </h3>
                    <span style={{ fontSize: '13px', color: '#555' }}>
                      Built for {p.name} · Student Portfolio 07
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f4f4f4',
                    border: '1.5px solid #000',
                    padding: '14px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '12px',
                    lineHeight: 1.8,
                  }}
                >
                  <div><strong>Built-in Memory:</strong> 32,768K</div>
                  <div><strong>Total Memory:</strong> 32,768K</div>
                  <div><strong>Hard Drive Sync:</strong> projects.json (Active)</div>
                  <div><strong>Server Port:</strong> 5465</div>
                  <div><strong>Auth Mode:</strong> JWT HS256 Tokenization</div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      playWindowClose();
                      setAboutMacOpen(false);
                    }}
                    className="mac-button mac-button-black"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. VINTAGE MACINTOSH CALCULATOR */}
      <AnimatePresence>
        {calcOpen && (
          <div
            className="mac-modal-backdrop"
            onClick={() => {
              playWindowClose();
              setCalcOpen(false);
            }}
          >
            <div className="mac-calc-window" onClick={(e) => e.stopPropagation()}>
              <div className="mac-modal-header">
                <button
                  className="mac-close-square"
                  onClick={() => {
                    playWindowClose();
                    setCalcOpen(false);
                  }}
                >
                  ×
                </button>
                <span className="mac-modal-title">Calculator</span>
              </div>

              {/* LCD Display */}
              <div className="mac-calc-display">
                {calcInput}
              </div>

              {/* Keypad Grid */}
              <div className="mac-calc-grid">
                <button onClick={() => handleCalcBtn('C')} className="mac-calc-btn mac-calc-btn-op">C</button>
                <button onClick={() => handleCalcBtn('±')} className="mac-calc-btn mac-calc-btn-op">±</button>
                <button onClick={() => handleCalcBtn('÷')} className="mac-calc-btn mac-calc-btn-op">÷</button>
                <button onClick={() => handleCalcBtn('×')} className="mac-calc-btn mac-calc-btn-op">×</button>

                <button onClick={() => handleCalcBtn('7')} className="mac-calc-btn">7</button>
                <button onClick={() => handleCalcBtn('8')} className="mac-calc-btn">8</button>
                <button onClick={() => handleCalcBtn('9')} className="mac-calc-btn">9</button>
                <button onClick={() => handleCalcBtn('-')} className="mac-calc-btn mac-calc-btn-op">-</button>

                <button onClick={() => handleCalcBtn('4')} className="mac-calc-btn">4</button>
                <button onClick={() => handleCalcBtn('5')} className="mac-calc-btn">5</button>
                <button onClick={() => handleCalcBtn('6')} className="mac-calc-btn">6</button>
                <button onClick={() => handleCalcBtn('+')} className="mac-calc-btn mac-calc-btn-op">+</button>

                <button onClick={() => handleCalcBtn('1')} className="mac-calc-btn">1</button>
                <button onClick={() => handleCalcBtn('2')} className="mac-calc-btn">2</button>
                <button onClick={() => handleCalcBtn('3')} className="mac-calc-btn">3</button>
                <button onClick={() => handleCalcBtn('=')} className="mac-calc-btn mac-calc-btn-op" style={{ background: '#000', color: '#fff' }}>=</button>

                <button onClick={() => handleCalcBtn('0')} className="mac-calc-btn" style={{ gridColumn: 'span 2' }}>0</button>
                <button onClick={() => handleCalcBtn('.')} className="mac-calc-btn">.</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
