import type { Profile } from './portfolio';
export const slot = 4;
export const sample: Profile = {
  name: 'Student 04',
  role: 'Data & AI Enthusiast',
  headline: 'Curious about data.\nDriven by discovery.',
  bio: 'I’m a computer science and data student exploring the intersection of modern web technology, artificial intelligence, and thoughtful digital design. I love turning complex datasets into intuitive, accessible experiences, mastering new tools, and engineering software that makes everyday life more insightful.\n\nExplore my work below, check out my journey, or get in touch for collaborations and opportunities!',
  location: 'Bengaluru, India',
  email: 'student04@campus.edu',
  availability: 'Open to internships & collaborations',
  photo: '',
  resume: '',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  accent: '#f4e56b',
  layout: 'editorial',
  skills: ['Python', 'React', 'TypeScript', 'Data Visualization', 'Machine Learning', 'Figma', 'FastAPI', 'SQL'],
  projects: [
    {
      title: 'Wayline',
      category: 'Mobility & Transit',
      description: "Making a whole city's transit app feel less like decoding a puzzle with live line-status, intuitive multimodal routing, and delightful map animations.",
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
      year: '2026'
    },
    {
      title: 'Tandem',
      category: 'Fintech & Mobile',
      description: "From 'who owes who' to money that finally feels shared. Collaborative shared vaults, real-time split billing, and transparent spending for groups.",
      url: 'https://github.com',
      image: 'https://cdn.dribbble.com/userupload/13712927/file/original-963ef9be53325cefd88bec052cdf2aa6.png?resize=2048x1536&vertical=center',
      year: '2026'
    },
    {
      title: 'Forge',
      category: 'Developer Tools',
      description: 'Getting a new engineer from day one to shipping code without the panic. Automated workspace staging, guided micro-tasks, and cloud sandbox isolation.',
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop',
      year: '2026'
    },
    {
      title: 'Volt',
      category: 'Climate & Data',
      description: 'Helping homeowners and renters actually understand the energy they consume through tactile charts, live telemetry, and automated carbon offsets.',
      url: 'https://github.com',
      image: 'https://cdn.dribbble.com/userupload/45634536/file/78267e4a088043e8a75ea78d6ecafce9.png?resize=2048x1536&vertical=center',
      year: '2026'
    }
  ],
  education: [
    {
      school: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      period: '2024 — 2028',
      detail: 'Focus on Data Structures, Algorithms, Artificial Intelligence, and Human-Computer Interaction. Active member of Developer Student Clubs.'
    }
  ],
  experiences: [
    {
      company: 'DataCraft Labs',
      role: 'Frontend & Analytics Intern',
      period: 'Summer 2025',
      detail: 'Engineered high-performance telemetry dashboards using React and D3.js, decreasing dashboard load latency by 35% and improving data clarity.'
    }
  ],
  achievements: [
    'Winner (1st Place) — Regional Campus AI Hackathon 2025',
    'Authored open-source interactive data visualization library with 500+ GitHub stars',
    'Dean’s List for Academic Excellence (Top 5% of class)'
  ],
  showEducation: true,
  showExperience: true,
  showAchievements: true
};
