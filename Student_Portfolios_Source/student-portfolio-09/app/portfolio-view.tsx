'use client';
import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {useDragControls} from 'motion/react';
import RubberSegment from '../components/ui/rubber-segment';
import {
  Frame,Title,Photo,Art,Skills,Contact,Journey,hasJourney,
  EmptyWork,ProjectDialog,motion,ArrowUpRight,number,type Props,type Project
} from './portfolio-kit';

function PlayCard({x,i,bounds,open}:{x:Project;i:number;bounds:RefObject<HTMLDivElement|null>;open:()=>void}){
  const drag=useDragControls();
  return (
    <motion.article
      className={'play-card play-card-'+i%3}
      style={{rotate:i%2?2:-2}}
      initial={{opacity:0,y:35,scale:0.95}}
      whileInView={{opacity:1,y:0,scale:1}}
      viewport={{once:true,amount:0.15}}
      transition={{duration:0.5,delay:i*0.08,ease:[.22,1,.36,1]}}
      drag
      dragConstraints={bounds}
      dragControls={drag}
      dragListener={false}
      dragElastic={.08}
      whileHover={{rotate:0, y:-4}}
      whileDrag={{scale:1.03,zIndex:5}}
    >
      <div className="play-card-handle">
        <span>{number(i)} / {x.year}</span>
        <button type="button" aria-label={'Drag '+x.title} title="Drag to move this card" onPointerDown={e=>drag.start(e)}>⠿</button>
      </div>
      <button className="play-card-content" onClick={open}>
        <Art project={x} index={i}/>
        <div>
          <span className="meta">{x.category}</span>
          <h3>{x.title}</h3>
          <span className="play-view">Explore <ArrowUpRight size={18}/></span>
        </div>
      </button>
    </motion.article>
  );
}

export default function Portfolio({profile:p,preview}:Props){
  const bounds=useRef<HTMLDivElement>(null);
  const [reset,setReset]=useState(0);
  const [selected,setSelected]=useState<Project|null>(null);
  const close=useCallback(()=>setSelected(null),[]);

  const [activeNav, setActiveNav] = useState<string>('#about');
  const [headerVisible, setHeaderVisible] = useState(true);
  const isNavClickingRef = useRef(false);
  const navClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const sectionIds = ['about', 'skills', 'projects', 'contact'];
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track active section for RubberSegment
      const scrollCheckY = currentScrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollCheckY) {
          setActiveNav(`#${sectionIds[i]}`);
          break;
        }
      }

      // If user clicked a navigation button (like Skills button), header STAYS HERE!
      if (isNavClickingRef.current) {
        setHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // At the top of the page, header stays here
      if (currentScrollY <= 60) {
        setHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollYRef.current;

      // When user starts scrolling down: header moves back (hides)
      if (diff > 6) {
        setHeaderVisible(false);
      }
      // When scrolling up: header stays here (reveals)
      else if (diff < -6) {
        setHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(navClickTimeoutRef.current);
    };
  }, []);

  const handleNavChange = useCallback((val: string) => {
    setActiveNav(val);

    // Keep header firmly visible when clicking navigation buttons (e.g. Skills button)
    isNavClickingRef.current = true;
    setHeaderVisible(true);
    clearTimeout(navClickTimeoutRef.current);
    navClickTimeoutRef.current = setTimeout(() => {
      isNavClickingRef.current = false;
    }, 1400);

    const target = document.querySelector(val);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', val);
      }
    }
  }, []);

  const handleTopClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isNavClickingRef.current = true;
    setHeaderVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    clearTimeout(navClickTimeoutRef.current);
    navClickTimeoutRef.current = setTimeout(() => {
      isNavClickingRef.current = false;
    }, 1000);
  }, []);

  return (
    <Frame profile={p} preview={preview} theme="play-folio">
      {/* ── Navigation (Scroll Hide/Reveal & Stay on Nav Click) ── */}
      <header className={`play-nav ${headerVisible ? 'nav-visible' : 'nav-hidden'}`}>
        <div className="play-nav-left">
          <a href="#top" className="play-brand-link" onClick={handleTopClick}>
            {p.name}<span>✳</span>
          </a>
        </div>

        <nav className="play-nav-center">
          <RubberSegment
            items={[
              { value: '#about', label: 'About' },
              { value: '#skills', label: 'Skills' },
              { value: '#projects', label: 'Projects' },
            ]}
            value={activeNav === '#contact' ? '#projects' : activeNav}
            onChange={handleNavChange}
            size="md"
            trackColor="#ECDCC3"
            thumbColor="#18181B"
            textColor="#4A3E2D"
            activeTextColor="#FFFFFF"
            radius={999}
            inset={4}
            equalSlots={false}
            draggable={true}
            speed={1}
            stretch={105}
            squash={3}
            aria-label="Portfolio navigation"
          />
        </nav>

        <div className="play-nav-right">
          <a
            href="#contact"
            className="play-contact-link play-rubber-btn"
            onClick={(e) => {
              e.preventDefault();
              handleNavChange('#contact');
            }}
          >
            Say hey ↗
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── 1. Hero (Reload Entrance Stagger) ── */}
        <section className="play-intro">
          <div className="play-intro-left">
            {(p.role || p.location) && (
              <motion.div
                className="play-hero-meta"
                initial={{opacity:0,y:14}}
                animate={{opacity:1,y:0}}
                transition={{duration:0.55,delay:0.1,ease:[.22,1,.36,1]}}
              >
                {p.role && <span>{p.role}</span>}
                {p.role && p.location && <span className="play-dot">·</span>}
                {p.location && <span>{p.location}</span>}
              </motion.div>
            )}
            <Title text={p.headline} mode="words"/>
            <motion.p
              className="play-intro-bio"
              initial={{opacity:0,y:16}}
              animate={{opacity:1,y:0}}
              transition={{duration:0.55,delay:0.25,ease:[.22,1,.36,1]}}
            >
              {p.bio.split('\n')[0]}
            </motion.p>
            <motion.div
              className="play-hero-actions"
              initial={{opacity:0,y:16}}
              animate={{opacity:1,y:0}}
              transition={{duration:0.55,delay:0.35,ease:[.22,1,.36,1]}}
            >
              <a href="#projects" className="play-btn-primary play-rubber-btn">Explore Projects ↓</a>
              <a href="#about" className="play-btn-secondary play-rubber-btn">About Me</a>
            </motion.div>
          </div>
          <div className="play-intro-right">
            <motion.div
              className="play-photo"
              initial={{scale:0.88,rotate:-2,opacity:0}}
              animate={{scale:1,rotate:3,opacity:1}}
              transition={{duration:0.75,delay:0.15,ease:[.22,1,.36,1]}}
            >
              <Photo p={p}/>
              <motion.span
                className="play-sticker"
                initial={{scale:0,rotate:-30}}
                animate={{scale:1,rotate:0}}
                transition={{type:'spring',stiffness:260,damping:14,delay:0.45}}
                whileHover={{rotate:20,scale:1.15}}
                aria-hidden="true"
              >
                ✳
              </motion.span>
              <p className="status">{p.availability}</p>
            </motion.div>
          </div>
        </section>

        {/* ── 2. About (Scroll Reveal) ── */}
        <motion.section
          id="about"
          className="play-about"
          initial={{opacity:0,y:35}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true,amount:0.15}}
          transition={{duration:0.65,ease:[.22,1,.36,1]}}
        >
          <div className="play-about-container">
            <div className="play-about-head">
              <span className="play-section-tag">About Me</span>
              <h2>Hi, I’m {p.name}.</h2>
            </div>
            <p className="bio">{p.bio}</p>
            {hasJourney(p) && (
              <div className="play-journey">
                <Journey p={p}/>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── 3. Skills (Scroll Reveal) ── */}
        <motion.section
          id="skills"
          className="play-skills-section"
          initial={{opacity:0,y:35}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true,amount:0.15}}
          transition={{duration:0.65,ease:[.22,1,.36,1]}}
        >
          <div className="play-skills-container">
            <div className="play-skills-head">
              <span className="play-section-tag">Skills & Toolkit</span>
              <h2>Technologies & Strengths</h2>
              <p className="play-skills-subtitle">Tools and technologies I use to design, build, and deploy applications.</p>
            </div>
            <div className="play-toolkit">
              <Skills p={p}/>
            </div>
          </div>
        </motion.section>

        {/* ── 4. Projects (Scroll Reveal & Drag Board with Rubber Segment Filter) ── */}
        <motion.section
          id="projects"
          className="play-work"
          initial={{opacity:0,y:35}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true,amount:0.12}}
          transition={{duration:0.65,ease:[.22,1,.36,1]}}
        >
          <div className="play-work-container">
            <div className="play-board-header">
              <div>
                <span className="play-section-tag">Featured Projects</span>
                <h2>Things I’ve made.</h2>
              </div>
              <div className="play-board-controls">
                <span>Move the cards around ↔</span>
                <button className="play-rubber-btn" onClick={()=>setReset(reset+1)}>Reset positions</button>
              </div>
            </div>

            <div className="play-board" ref={bounds} key={reset}>
              {p.projects.length
                ? p.projects.map((x,i)=>(
                    <PlayCard key={i} x={x} i={i} bounds={bounds} open={()=>setSelected(x)}/>
                  ))
                : <EmptyWork/>}
            </div>
          </div>
        </motion.section>

        {/* ── 5. Social Links / Contact (Scroll Reveal) ── */}
        <motion.footer
          id="contact"
          className="play-contact"
          initial={{opacity:0,y:40}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true,amount:0.15}}
          transition={{duration:0.7,ease:[.22,1,.36,1]}}
        >
          <div className="play-contact-container">
            <div className="play-contact-grid">
              <div className="play-contact-head">
                <span className="play-section-tag">Get in Touch</span>
                <h2>Let’s make<br/>it happen.</h2>
                <p className="play-contact-lead">Have an opportunity, collaboration, or just want to say hi?</p>
              </div>
              <div className="play-contact-body">
                <Contact p={p}/>
              </div>
            </div>
            <div className="play-footer-bottom">
              <span>© {new Date().getFullYear()} {p.name}</span>
              <span>{p.location}</span>
              <a href="/admin" className="play-footer-admin-link">Admin ↗</a>
            </div>
          </div>
        </motion.footer>
      </main>

      <ProjectDialog project={selected} onClose={close}/>
    </Frame>
  );
}
