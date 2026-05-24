import { useEffect, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import MapView from '../components/MapView'
import RouteLayer from '../components/RouteLayer'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import useMapartStore from '../store/useMapartStore'
import { snapToRoads, pathLength, offsetWaypoints } from '../lib/snapToRoads'
import './RoutePreview.css'

function MapFitBounds({ waypoints }) {
  const map = useMap()
  useEffect(() => {
    if (waypoints && waypoints.length >= 2) {
      const bounds = waypoints.map((p) => [p.lat, p.lng])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: true, duration: 0.8 })
    }
  }, [waypoints, map])
  return null
}

function fmtDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`
}

function fmtTime(m) {
  const mins = Math.round(m / 1000 * 6)
  return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins} min`
}

export default function RoutePreview() {
  const navigateTo = useMapartStore((s) => s.navigateTo)
  const snappedRoute = useMapartStore((s) => s.snappedRoute)
  const routeStatus = useMapartStore((s) => s.routeStatus)
  const routeDistance = useMapartStore((s) => s.routeDistance)
  const routeError = useMapartStore((s) => s.routeError)
  const rawWaypoints = useMapartStore((s) => s.rawWaypoints)
  const selectedLocation = useMapartStore((s) => s.selectedLocation)
  const setSnappedRoute = useMapartStore((s) => s.setSnappedRoute)
  const setRouteDistance = useMapartStore((s) => s.setRouteDistance)
  const setRouteStatus = useMapartStore((s) => s.setRouteStatus)
  const setRouteError = useMapartStore((s) => s.setRouteError)

  const center = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [20.5937, 78.9629]

  const isLoading = routeStatus === 'loading'
  const isError   = routeStatus === 'error'
  const isSuccess = routeStatus === 'success' || routeStatus === 'low_quality'
  const isLowQ    = routeStatus === 'low_quality'

  async function handleRegenerate() {
    setRouteStatus('loading')
    setRouteError(null)
    try {
      const offsetPts = offsetWaypoints(rawWaypoints)
      const { snapped, distance } = await snapToRoads(offsetPts)
      const rawLen = pathLength(rawWaypoints)
      setSnappedRoute(snapped)
      setRouteDistance(distance)
      setRouteStatus(distance > rawLen * 3 ? 'low_quality' : 'success')
    } catch (e) {
      setRouteStatus('error')
      setRouteError(e.message || 'Could not generate route')
    }
  }

  return (
    <div className="route-preview">
      {/* Loading overlay */}
      {isLoading && (
        <div className="route-loading">
          <div className="route-loading__inner">
            <RouteAnimation />
            <p className="route-loading__text">Snapping to streets…</p>
            <p className="route-loading__sub">Finding roads near your art shape</p>
          </div>
        </div>
      )}

      {/* Map */}
      {(isSuccess || isError) && (
        <>
          <div className="route-map-wrap">
            <MapView center={center} zoom={15} className="route-map">
              {isSuccess && snappedRoute.length >= 2 && (
                <>
                  <RouteLayer waypoints={snappedRoute} variant="solid" />
                  <MapFitBounds waypoints={snappedRoute} />
                </>
              )}
            </MapView>

            {/* Overlaid TopBar */}
            <div className="route-topbar-wrap">
              <TopBar title="Your Route" backTo="creator" transparent />
            </div>
          </div>

          {/* Bottom sheet */}
          <div className="route-bottom">
            {isLowQ && (
              <div className="route-warning">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14.5 13H1.5L8 2Z" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M8 6.5v3M8 11v.01" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Street layout may affect shape quality. Try regenerating or a different area.</span>
              </div>
            )}

            {isError && (
              <div className="route-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="var(--color-accent)" strokeWidth="1.5"/>
                  <path d="M5 5l6 6M11 5l-6 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Couldn't generate route for this area. {routeError ? `(${routeError})` : ''}</span>
              </div>
            )}

            {isSuccess && (
              <div className="route-stats">
                <div className="route-stat">
                  <span className="route-stat__val">{fmtDist(routeDistance)}</span>
                  <span className="route-stat__label">Distance</span>
                </div>
                <div className="route-stat-divider" />
                <div className="route-stat">
                  <span className="route-stat__val">{fmtTime(routeDistance)}</span>
                  <span className="route-stat__label">Est. Time</span>
                </div>
                <div className="route-stat-divider" />
                <div className="route-stat">
                  <span className="route-stat__val">{snappedRoute.length}</span>
                  <span className="route-stat__label">Points</span>
                </div>
              </div>
            )}

            <div className="route-bottom__actions">
              <Button variant="outlined" onClick={handleRegenerate}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8a5 5 0 009.9-1M13 8a5 5 0 01-9.9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M13 4v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Regenerate
              </Button>
              <Button
                variant="primary"
                onClick={() => navigateTo('export')}
                disabled={!isSuccess}
                className="route-export-btn"
              >
                Export Route →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Animated GPS trace for loading state
function RouteAnimation() {
  return (
    <svg className="route-loading-svg" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10,60 C10,60 20,20 35,20 C50,20 50,60 65,60 C80,60 80,20 95,20 C110,20 110,60 110,60"
        stroke="#00E87A"
        strokeWidth="3"
        strokeLinecap="round"
        className="route-loading-path"
      />
      <circle cx="10" cy="60" r="4" fill="#00E87A" opacity="0.8" />
    </svg>
  )
}
