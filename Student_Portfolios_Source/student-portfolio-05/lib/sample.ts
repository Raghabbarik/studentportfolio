import type { Profile } from './portfolio';

export const slot = 5;

export const sample: Profile = {
  name: 'Aarav Sharma',
  role: 'B.Tech in Design · UI/UX & Interaction Technologist',
  headline: 'Designing human-centered digital futures through craft & code.',
  bio: 'I am a final-year B.Tech in Design student exploring the intersection of human-computer interaction, visual craft, and modern web engineering. I believe good software should feel as thoughtful and intentional as well-made physical objects.\n\nMy studies bridge user research, interface prototyping, design systems, and frontend engineering. From wireframes in Figma to performant components in React and TypeScript, I take pride in creating digital experiences that are intuitive, accessible, and delightful.',
  location: 'New Delhi, India',
  email: 'aarav.design@portfolio.local',
  availability: 'Available for Summer Internships & Design Roles',
  photo: '',
  resume: 'https://example.com/aarav-sharma-btech-design-resume.pdf',
  github: 'https://github.com/aarav-design',
  linkedin: 'https://linkedin.com/in/aarav-sharma-design',
  instagram: 'https://instagram.com/aarav.ux',
  behance: 'https://behance.net/aaravdesign',
  dribbble: 'https://dribbble.com/aaravsharma',
  accent: '#b43b59',
  layout: 'centered',
  skills: [
    'UI/UX Design',
    'Interaction Design',
    'Design Systems',
    'Figma & FigJam',
    'User Research',
    'Wireframing & Prototyping',
    'React & Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Creative Coding & Canvas',
    'Information Architecture',
    'Usability Testing',
  ],
  projects: [
    {
      title: 'Kavach — Campus Transit & Night Safety App',
      category: 'UI/UX & Interaction Design',
      description:
        'A comprehensive mobile safety and transit ecosystem designed for university students. Features low-light night mode, real-time campus shuttle tracking, SOS safety circles, and high-contrast accessibility validated through field user research with 80+ campus residents.',
      url: 'https://github.com/aarav-design/kavach-campus-safety',
      image: '',
      year: '2026',
    },
    {
      title: 'Prism — Multi-Brand Design Token Architecture',
      category: 'Design Systems & Code',
      description:
        'An end-to-end design token pipeline bridging Figma tokens with React and Tailwind CSS. Built with automated semantic color modes, WCAG AAA contrast guarantees, fluid typography scales, and synchronized documentation for designers and engineers.',
      url: 'https://github.com/aarav-design/prism-design-system',
      image: '',
      year: '2025',
    },
    {
      title: 'Aura — Circadian Health & Wearable Interface',
      category: 'HCI & Wearable UX',
      description:
        'A biometric smart watch interface and tactile micro-interaction study that adapts its glanceable typography, ambient glow, and information density based on the user’s natural circadian rhythms and daylight exposure.',
      url: 'https://github.com/aarav-design/aura-circadian-wearable',
      image: '',
      year: '2025',
    },
    {
      title: 'Algocraft — Spatial Algorithm & Graph Playground',
      category: 'Creative Coding & Web',
      description:
        'An interactive web visualizer turning abstract graph algorithms, tree balancing, and sorting techniques into spatial, tactile simulations for design and engineering students. Built with React, Canvas API, and Web Audio.',
      url: 'https://github.com/aarav-design/algocraft-interactive',
      image: '',
      year: '2024',
    },
  ],
  education: [
    {
      school: 'National Institute of Technology (NIT) · Department of Design',
      degree: 'B.Tech in Design (Bachelor of Technology in Design)',
      period: '2022 — 2026',
      detail:
        'Specializing in Human-Computer Interaction, Design Thinking, Visual Communication, Ergonomics, and Frontend Engineering. CGPA: 8.9 / 10. Relevant Coursework: Usability Engineering, Interactive Media, Tangible User Interfaces, Cognitive Ergonomics.',
    },
  ],
  experiences: [
    {
      company: 'NeoDesign Studio',
      role: 'UI/UX & Design Technologist Intern',
      period: 'Summer 2025',
      detail:
        'Redesigned the cross-platform onboarding journey and micro-interactions, resulting in a 24% boost in task completion. Created reusable Figma design tokens and component specs.',
    },
    {
      company: 'Campus Innovation & Design Cell',
      role: 'Student Design Lead',
      period: '2024 — Present',
      detail:
        'Spearheaded user research, wireframing, and design system development for campus transit and student portal applications used daily by 12,000+ university students.',
    },
  ],
  achievements: [
    'Winner — National Student Design Hackathon 2025 (Best Human-Centered Interface Award)',
    'Author — "Ergonomics of Fluid Touch Interfaces", Student HCI Research Colloquium 2025',
    'Figma Community Creator — Over 15,000+ downloads for "Design Token & Layout Starter Kit"',
  ],
  showEducation: true,
  showExperience: true,
  showAchievements: true,
};
