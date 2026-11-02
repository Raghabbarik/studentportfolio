import type { Profile } from './portfolio';

export const slot = 7;

export const sample: Profile = {
  name: "Aarav Sharma",
  role: "Product Designer & Frontend Engineer",
  headline: "Asking better questions.\nCrafting thoughtful digital solutions.",
  bio: "I am a design-driven software engineer and student exploring the intersection of human-centered interaction design and high-performance web systems. Passionate about transforming complex problems into intuitive, accessible, and delightful digital experiences. Currently focusing on React, TypeScript, design systems, and creative computing.",
  location: "Bengaluru, India",
  email: "aarav.sharma@example.com",
  phone: "+91 98765 43210",
  availability: "Available for Summer 2026 Internships & Design Engineering Roles",
  photo: "",
  resume: "https://example.com/aarav-resume.pdf",
  github: "https://github.com/aaravsharma",
  linkedin: "https://linkedin.com/in/aaravsharma-design",
  instagram: "https://instagram.com/aarav.designs",
  accent: "#765126",
  layout: "editorial",
  skills: [
    "React / Next.js",
    "TypeScript",
    "UI/UX Design",
    "Tailwind CSS",
    "Figma",
    "Motion & Micro-interactions",
    "Node.js & Express",
    "Design Systems",
    "REST & GraphQL APIs",
    "Web Performance & Accessibility"
  ],
  projects: [
    {
      title: "Campus Connect",
      category: "Web development",
      description: "An all-in-one unified campus hub connecting students, student clubs, and university departments. Featuring real-time peer event discovery, club announcements, study-circle collaboration, and interactive map navigation.",
      url: "https://github.com/aaravsharma/campus-connect",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      year: "2026"
    },
    {
      title: "Everyday Studio",
      category: "Product design",
      description: "A mindful productivity and creative studio environment built to eliminate notification fatigue. Designed with focus states, ambient soundscapes, minimal markdown notes, and deep work timers.",
      url: "https://github.com/aaravsharma/everyday-studio",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      year: "2026"
    },
    {
      title: "Personal Playground",
      category: "Creative coding",
      description: "An interactive digital sandbox of creative coding experiments, WebGL canvas shaders, SVG generative geometry, and sound-reactive visualizations built to explore new frontend techniques.",
      url: "https://github.com/aaravsharma/personal-playground",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      year: "2026"
    },
    {
      title: "Pulse UI Kit",
      category: "Design systems",
      description: "An accessible, token-based design system component library built with Radix primitives, Tailwind CSS, and strict WCAG AAA color contrast compliance for rapid prototyping.",
      url: "https://github.com/aaravsharma/pulse-ui",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      year: "2025"
    }
  ],
  education: [
    {
      school: "National Institute of Technology",
      degree: "Bachelor of Technology in Computer Science & Engineering",
      period: "2024 — 2028",
      detail: "Core coursework: Data Structures, Algorithms, Human-Computer Interaction, Web Architectures, Database Systems. Active core lead at Developer Student Clubs."
    },
    {
      school: "Delhi Public School",
      degree: "Higher Secondary Certificate (PCM + Computer Science)",
      period: "2022 — 2024",
      detail: "Graduated with 96.4% distinction. Lead organizer for Inter-school Tech & Robotics Symposium."
    }
  ],
  experiences: [
    {
      company: "Kreativ Design Labs",
      role: "Frontend & UI Engineering Intern",
      period: "Summer 2025",
      detail: "Engineered responsive web applications and interactive component libraries for 4 enterprise client portfolios. Reduced bundle size by 28% and improved Core Web Vitals to 98/100."
    },
    {
      company: "Open Source Community",
      role: "Contributor & Design Maintainer",
      period: "2024 — Present",
      detail: "Authored documentation, built UI accessibility enhancements, andド merged PRs across modern web design toolkits and developer CLI utilities."
    }
  ],
  achievements: [
    "Winner (1st Place) — National Smart Campus Hackathon 2025 (out of 450+ competing teams)",
    "Published 'Designing Fluid Gestures for the Modern Web' with 12,000+ reads on Dev.to",
    "Recipient of Dean's Merit Scholarship for Academic Excellence (2024 & 2025)",
    "Mentored 60+ junior students in React, TypeScript, and Git version control fundamentals"
  ],
  showEducation: true,
  showExperience: true,
  showAchievements: true
};
