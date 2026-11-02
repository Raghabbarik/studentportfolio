import type {Profile} from './portfolio';

export const slot = 9;

export const sample: Profile = {
  name: 'Aarav Sharma',
  role: 'Full Stack Developer & AI Engineer',
  headline: 'Building Intelligent Systems\n& Digital Experiences.',
  bio: `Computer Science student passionate about full-stack engineering, distributed systems, and applied machine learning.

I focus on crafting responsive, high-performance web applications with modern architectures like Next.js, React, TypeScript, and SQLite. Active open-source contributor and hackathon finalist driven by building tools that solve real human challenges.`,
  location: 'Bengaluru, India',
  email: 'aarav.sharma.dev@gmail.com',
  availability: 'Available for Internships & Projects',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  resume: '',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  accent: '#7C3AED',
  layout: 'split',
  skills: [
    'React.js',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Python',
    'TailwindCSS',
    'SQLite & PostgreSQL',
    'Docker',
    'REST & GraphQL APIs',
    'Git & GitHub CI/CD',
    'Figma UI/UX',
    'Data Structures & Algorithms'
  ],
  projects: [
    {
      title: 'CampusFlow — Campus Collaboration',
      category: 'Full Stack · Web App',
      description: 'A comprehensive campus community platform for event registration, academic resources sharing, and peer mentoring. Built with real-time updates and interactive dashboards.',
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      year: '2026'
    },
    {
      title: 'NeuroQuery — AI Document Intelligence',
      category: 'AI / ML · RAG',
      description: 'High-speed retrieval-augmented generation engine that answers queries over large technical documentation with citations, sub-second latency, and SQLite vector indexing.',
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      year: '2026'
    },
    {
      title: 'PulseMetrics — Cloud Performance Tracker',
      category: 'Cloud · Monitoring',
      description: 'Lightweight distributed telemetry dashboard monitoring microservices health, latency histograms, and automated incident alerts with zero-dependency SQLite storage.',
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      year: '2025'
    }
  ],
  education: [
    {
      school: 'National Institute of Technology (NIT)',
      degree: 'B.Tech in Computer Science & Engineering',
      period: '2023 — 2027',
      detail: 'Current CGPA: 9.3/10. Relevant Coursework: Data Structures, Operating Systems, Computer Networks, Database Management, Cloud Computing.'
    },
    {
      school: 'Delhi Public School',
      degree: 'Senior Secondary Education (Class XII CBSE)',
      period: '2021 — 2023',
      detail: 'Scored 96.4% in Science & Mathematics stream. School President of the Computer Club.'
    }
  ],
  experiences: [
    {
      company: 'Apex Labs Innovations',
      role: 'Full Stack Engineering Intern',
      period: 'May 2025 — Aug 2025',
      detail: 'Architected full-stack features with TypeScript, optimized SQLite database queries reducing P99 latency by 38%, and implemented responsive client components.'
    },
    {
      company: 'Open Source Community',
      role: 'Core Contributor & Mentor',
      period: '2024 — Present',
      detail: 'Contributed to popular developer tools and libraries, authored documentation, and mentored junior students in web development.'
    }
  ],
  achievements: [
    'Winner, National Smart India Hackathon (1st Place among 400+ teams nationwide)',
    'Solved 600+ problems on LeetCode with Knight Badge (Top 4% worldwide)',
    'Google Cloud Certified Associate Cloud Engineer (ACE)',
    'Finalist at ACM ICPC Regional Contest 2025'
  ],
  showEducation: true,
  showExperience: true,
  showAchievements: true
};
