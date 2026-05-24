import { useState } from 'react'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import useMapartStore from '../store/useMapartStore'
import { downloadGPX, downloadShareImage } from '../lib/gpxExport'
import './Export.css'

function RouteThumbnail({ waypoints }) {
  if (!waypoints || waypoints.length < 2) return null

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const p of waypoints) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }

  const pad = 20
  const W = 320, H = 180
  const spanLat = maxLat - minLat || 0.001
  const spanLng = maxLng - minLng || 0.001

  const toSVG = (lat, lng) => ({
    x: pad + ((lng - minLng) / spanLng) * (W - pad * 2),
    y: H - pad - ((lat - minLat) / spanLat) * (H - pad * 2),
  })

  const pts = waypoints.map((p) => toSVG(p.lat, p.lng))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="route-thumb">
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="route-thumb-svg">
        {/* Grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * W/8} y1="0" x2={i * W/8} y2={H} stroke="#1E1E2E" strokeWidth="1"/>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * H/5} x2={W} y2={i * H/5} stroke="#1E1E2E" strokeWidth="1"/>
        ))}
        {/* Glow */}
        <path d={d} fill="none" stroke="rgba(0,232,122,0.2)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Route */}
        <path d={d} fill="none" stroke="#00E87A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Start dot */}
        <circle cx={pts[0].x} cy={pts[0].y} r="5" fill="#00E87A"/>
      </svg>
    </div>
  )
}

export default function Export() {
  const navigateTo = useMapartStore((s) => s.navigateTo)
  const snappedRoute = useMapartStore((s) => s.snappedRoute)
  const selectedLocation = useMapartStore((s) => s.selectedLocation)

  const [gpxDone, setGpxDone] = useState(false)
  const [imgDone, setImgDone] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  function handleGPX() {
    downloadGPX(snappedRoute)
    setGpxDone(true)
  }

  function handleShareImage() {
    downloadShareImage(snappedRoute, selectedLocation?.displayName?.split(',')[0] || '')
    setImgDone(true)
  }

  return (
    <div className="export-screen">
      <TopBar title="Get your route" backTo="preview" />

      <div className="export-content">
        {/* Route thumbnail */}
        <RouteThumbnail waypoints={snappedRoute} />

        {/* Location name */}
        {selectedLocation && (
          <div className="export-location">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1a3 3 0 00-3 3c0 2.5 3 7 3 7s3-4.5 3-7a3 3 0 00-3-3z" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
              <circle cx="6" cy="4" r="1.2" fill="var(--color-primary)"/>
            </svg>
            <span>{selectedLocation.displayName?.split(',').slice(0, 2).join(', ')}</span>
          </div>
        )}

        {/* Action cards */}
        <div className="export-cards">
          <button className={`export-card${gpxDone ? ' export-card--done' : ''}`} onClick={handleGPX}>
            <div className="export-card__icon">
              {gpxDone ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div className="export-card__text">
              <span className="export-card__title">{gpxDone ? 'Downloaded!' : 'Download GPX file'}</span>
              <span className="export-card__sub">Works with Strava, Garmin, Nike Run Club</span>
            </div>
            <div className="export-card__arrow">
              {gpxDone ? (
                <span className="export-card__badge">✓</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>

          <button className={`export-card${imgDone ? ' export-card--done' : ''}`} onClick={handleShareImage}>
            <div className="export-card__icon">
              {imgDone ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 15l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="export-card__text">
              <span className="export-card__title">{imgDone ? 'Saved!' : 'Save route image'}</span>
              <span className="export-card__sub">Instagram-ready · includes your art shape</span>
            </div>
            <div className="export-card__arrow">
              {imgDone ? (
                <span className="export-card__badge">✓</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Strava guide */}
        <div className="strava-guide">
          <button className="strava-guide__toggle" onClick={() => setGuideOpen(!guideOpen)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12l4.5-4L6 4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: guideOpen ? 'rotate(90deg)' : 'none', transformOrigin: '50% 50%', transition: 'transform 220ms ease' }}/>
            </svg>
            <span>How to import to Strava</span>
          </button>

          {guideOpen && (
            <div className="strava-guide__steps">
              {[
                'Download the GPX file above',
                'Open Strava → go to your profile',
                'Tap the + button → Upload activity',
                'Select the GPX file from your downloads',
                'Set activity type to "Run"',
                'Save — your art route is now a Strava activity!',
              ].map((step, i) => (
                <div key={i} className="strava-step">
                  <span className="strava-step__num">{i + 1}</span>
                  <span className="strava-step__text">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start over */}
        <Button variant="ghost" fullWidth onClick={() => navigateTo('home')}>
          ← Create another route
        </Button>
      </div>
    </div>
  )
}
