export default function Loading() {
  return (
    <div className="folio play-folio skeleton-root" aria-busy="true" aria-label="Loading portfolio">
      {/* Header without loading animation */}
      <header className="play-nav">
        <div className="play-nav-left">
          <span className="play-brand-link">Portfolio<span>✳</span></span>
        </div>
        <nav className="play-nav-center">
          <div className="rs-track" style={{padding: '4px', borderRadius: '999px', background: '#ECDCC3', border: '1px solid rgba(220, 204, 182, 0.85)'}}>
            <span className="rs-button" style={{minWidth: '55px', height: '28px', opacity: 0.9}}>About</span>
            <span className="rs-button" style={{minWidth: '55px', height: '28px', opacity: 0.7}}>Skills</span>
            <span className="rs-button" style={{minWidth: '65px', height: '28px', opacity: 0.7}}>Projects</span>
          </div>
        </nav>
        <div className="play-nav-right">
          <span className="play-contact-link">Say hey ↗</span>
        </div>
      </header>

      <main>
        {/* Skeleton 1. Hero */}
        <section className="play-intro skeleton-hero">
          <div className="play-intro-left">
            <div className="skeleton-box skeleton-meta" />
            <div className="skeleton-box skeleton-title-1" />
            <div className="skeleton-box skeleton-title-2" />
            <div className="skeleton-box skeleton-bio-1" />
            <div className="skeleton-box skeleton-bio-2" />
            <div className="skeleton-buttons">
              <div className="skeleton-box skeleton-btn" />
              <div className="skeleton-box skeleton-btn" />
            </div>
          </div>
          <div className="play-intro-right">
            <div className="skeleton-box skeleton-photo-card" />
          </div>
        </section>

        {/* Skeleton 2. Skills & Toolkit */}
        <section className="play-skills-section skeleton-skills">
          <div className="play-skills-container">
            <div className="skeleton-box skeleton-heading" />
            <div className="skeleton-box skeleton-sub" />
            <div className="skeleton-toolkit">
              {Array.from({length: 10}).map((_, i) => (
                <div
                  key={i}
                  className="skeleton-box skeleton-pill"
                  style={{width: `${80 + (i % 5) * 22}px`}}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton 3. Featured Projects */}
        <section className="play-work skeleton-projects">
          <div className="play-work-container">
            <div className="skeleton-box skeleton-heading" />
            <div className="skeleton-card-grid">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="skeleton-box skeleton-card" />
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton 4. Contact */}
        <footer className="play-contact skeleton-contact">
          <div className="play-contact-container">
            <div className="skeleton-box skeleton-heading-lg" />
            <div className="skeleton-box skeleton-email-bar" />
          </div>
        </footer>
      </main>
    </div>
  );
}
