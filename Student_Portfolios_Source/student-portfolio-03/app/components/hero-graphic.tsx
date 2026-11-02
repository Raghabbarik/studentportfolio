'use client';

import { useRef, useState, useCallback, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

export function HeroGraphic({
  projectsCount = 3,
  skillsCount = 12
}: {
  projectsCount?: number;
  skillsCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [reducedMotion, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="hero-graphic-wrap"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      <motion.div
        className="hero-graphic-card"
        style={
          reducedMotion
            ? {}
            : {
                rotateX,
                rotateY,
                transformPerspective: 900
              }
        }
        animate={
          reducedMotion
            ? {}
            : {
                scale: isHovered ? 1.02 : 1
              }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 320 320"
          className="hero-graphic-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient
              id="centerGlow"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background subtle glow */}
          <circle cx="160" cy="160" r="130" fill="url(#centerGlow)" />

          {/* Outer clean perimeter ring */}
          <motion.circle
            cx="160"
            cy="160"
            r="128"
            stroke="var(--fg)"
            strokeOpacity="0.22"
            strokeWidth="1.5"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Rotating dashed orbital ring */}
          <motion.circle
            cx="160"
            cy="160"
            r="94"
            stroke="var(--accent)"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            initial={reducedMotion ? false : { rotate: 0 }}
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 160px' }}
          />

          {/* Inner solid ring */}
          <circle
            cx="160"
            cy="160"
            r="60"
            stroke="var(--fg)"
            strokeOpacity="0.18"
            strokeWidth="1"
          />

          {/* Center rotating terracotta diamond */}
          <motion.g
            initial={reducedMotion ? false : { rotate: 45 }}
            animate={
              reducedMotion
                ? { rotate: 45 }
                : {
                    rotate: isHovered ? 225 : 45
                  }
            }
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: '160px 160px' }}
          >
            <rect
              x="134"
              y="134"
              width="52"
              height="52"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          </motion.g>

          {/* Center core glowing node */}
          <motion.circle
            cx="160"
            cy="160"
            r="7"
            fill="var(--accent)"
            animate={
              reducedMotion
                ? {}
                : {
                    scale: [1, 1.25, 1],
                    opacity: [0.9, 1, 0.9]
                  }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Four orbital satellite nodes */}
          <circle cx="160" cy="66" r="3.5" fill="var(--accent)" />
          <circle cx="254" cy="160" r="3" fill="var(--fg)" fillOpacity="0.4" />
          <circle cx="160" cy="254" r="3" fill="var(--accent)" fillOpacity="0.7" />
          <circle cx="66" cy="160" r="3" fill="var(--fg)" fillOpacity="0.4" />
        </svg>

        {/* Clean bottom meta readout */}
        <div className="hero-graphic-caption">
          <div className="graphic-caption-stat">
            <span className="caption-num">{projectsCount}</span>
            <span className="caption-label">Production Projects</span>
          </div>
          <div className="graphic-caption-stat">
            <span className="caption-num">{skillsCount}+</span>
            <span className="caption-label">Core Capabilities</span>
          </div>
          <div className="graphic-caption-status">
            <span className="caption-dot" />
            <span className="caption-status-text">Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
