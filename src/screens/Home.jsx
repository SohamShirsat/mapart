import { useEffect, useRef } from 'react'
import useMapartStore from '../store/useMapartStore'
import Button from '../components/Button'
import './Home.css'

// Animated SVG drawing "HI" with GPS trace aesthetic
function HeroAnimation() {
  const pathRef1 = useRef(null)
  const pathRef2 = useRef(null)

  useEffect(() => {
    // Drive the draw animation via CSS; repeat cycle
    const paths = [pathRef1.current, pathRef2.current].filter(Boolean)
    paths.forEach((p) => {
      const len = p.getTotalLength?.() || 300
      p.style.strokeDasharray = len
      p.style.strokeDashoffset = len
    })
  }, [])

  return (
    <div className="hero-anim">
      <svg viewBox="0 0 320 160" className="hero-svg" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="160" stroke="#1E1E2E" strokeWidth="1" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} stroke="#1E1E2E" strokeWidth="1" />
        ))}

        {/* H letter trace */}
        <path
          ref={pathRef1}
          className="hero-trace"
          d="M40,30 L40,130 M40,80 L100,80 M100,30 L100,130"
          fill="none"
          stroke="#00E87A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* I letter trace */}
        <path
          ref={pathRef2}
          className="hero-trace hero-trace--delay"
          d="M160,30 L220,30 M190,30 L190,130 M160,130 L220,130"
          fill="none"
          stroke="#00E87A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Waypoint dots */}
        <circle className="hero-dot" cx="40" cy="30" r="5" fill="#00E87A" />
        <circle className="hero-dot hero-dot--delay" cx="190" cy="80" r="5" fill="#00E87A" />

        {/* GPS pulse at start */}
        <circle className="hero-pulse" cx="40" cy="30" r="8" fill="none" stroke="#00E87A" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export default function Home() {
  const navigateTo = useMapartStore((s) => s.navigateTo)
  const setMode = useMapartStore((s) => s.setMode)

  function handleStart(mode) {
    setMode(mode)
    navigateTo('location')
  }

  return (
    <div className="home">
      <div className="home__top">
        <div className="home__wordmark">
          <span className="home__logo-text">Mapart</span>
          <span className="home__pulse-dot" />
        </div>
        <div className="home__coords">48.8566°N / 2.3522°E</div>
      </div>

      <div className="home__hero">
        <HeroAnimation />
        <p className="home__tagline">Draw with your feet.</p>
        <p className="home__sub">
          Type a word or pick a shape — we generate a real<br />runnable route you can import into Strava.
        </p>
      </div>

      <div className="home__actions">
        <Button variant="primary" fullWidth onClick={() => handleStart('text')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M6 4v10M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Type a Word
        </Button>
        <Button variant="outlined" fullWidth onClick={() => handleStart('shape')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L11.5 7.5H17L12.5 11L14.5 16.5L9 13L3.5 16.5L5.5 11L1 7.5H6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          Pick a Shape
        </Button>

        <div className="home__hint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a6 6 0 100 12A6 6 0 007 1zM7 10V7M7 4.5v.01" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>No account needed · 100% free · Works on Strava</span>
        </div>
      </div>
    </div>
  )
}
