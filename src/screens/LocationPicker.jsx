import { useState, useEffect, useCallback, useRef } from 'react'
import { useMapEvents, useMap } from 'react-leaflet'
import MapView from '../components/MapView'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import useMapartStore from '../store/useMapartStore'
import { searchLocation, reverseGeocode } from '../lib/nominatim'
import './LocationPicker.css'

const DEFAULT_CENTER = [20.5937, 78.9629] // India center fallback
const DEBOUNCE_MS = 400

function debounce(fn, ms) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms) }
}

// Component that captures map center on move
function MapCenterTracker({ onCenterChange }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter()
      onCenterChange(c.lat, c.lng)
    },
  })
  return null
}

// Component to fly map to coordinates
function MapFlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 })
  }, [target, map])
  return null
}

export default function LocationPicker() {
  const navigateTo = useMapartStore((s) => s.navigateTo)
  const setSelectedLocation = useMapartStore((s) => s.setSelectedLocation)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState(null)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [pendingGeo, setPendingGeo] = useState(false)
  const [locationName, setLocationName] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef(null)

  // Debounced search
  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) { setResults([]); return }
      setSearching(true)
      try {
        const r = await searchLocation(q)
        setResults(r)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, DEBOUNCE_MS),
    []
  )

  function handleQueryChange(e) {
    const v = e.target.value
    setQuery(v)
    doSearch(v)
    setSearchOpen(true)
    if (!v) setLocationName(null)
  }

  function handleResultSelect(result) {
    setQuery(result.shortName)
    setLocationName(result.shortName)
    setResults([])
    setSearchOpen(false)
    setFlyTarget({ lat: result.lat, lng: result.lng })
    setMapCenter([result.lat, result.lng])
  }

  function handleCurrentLocation() {
    if (!navigator.geolocation) return
    setPendingGeo(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const info = await reverseGeocode(lat, lng).catch(() => null)
        const name = info?.shortName || 'Current location'
        setQuery(name)
        setLocationName(name)
        setFlyTarget({ lat, lng })
        setMapCenter([lat, lng])
        setPendingGeo(false)
      },
      () => setPendingGeo(false)
    )
  }

  function handleMapCenterChange(lat, lng) {
    setMapCenter([lat, lng])
  }

  function handleConfirm() {
    setSelectedLocation({
      lat: mapCenter[0],
      lng: mapCenter[1],
      displayName: locationName || `${mapCenter[0].toFixed(4)}, ${mapCenter[1].toFixed(4)}`,
    })
    navigateTo('creator')
  }

  const hasLocation = locationName !== null

  return (
    <div className="location-picker">
      <TopBar title="Where will you run?" backTo="home" />

      {/* Search bar */}
      <div className="location-search">
        <div className="location-search__bar">
          <svg className="location-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="location-search__input"
            placeholder="Search area, park, city…"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setSearchOpen(true)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {searching && <div className="location-search__spinner" />}
        </div>

        {searchOpen && results.length > 0 && (
          <div className="location-search__dropdown">
            {results.map((r) => (
              <button
                key={r.id}
                className="location-search__result"
                onClick={() => handleResultSelect(r)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1a4 4 0 00-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 00-4-4z" stroke="var(--color-primary)" strokeWidth="1.3" fill="none"/>
                  <circle cx="7" cy="5" r="1.5" fill="var(--color-primary)"/>
                </svg>
                <div className="location-search__result-text">
                  <span className="location-search__result-name">{r.shortName}</span>
                  <span className="location-search__result-region">{r.region}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="location-map-wrap">
        <MapView center={DEFAULT_CENTER} zoom={5} className="location-map">
          <MapCenterTracker onCenterChange={handleMapCenterChange} />
          {flyTarget && <MapFlyTo target={flyTarget} />}
        </MapView>

        {/* Crosshair */}
        <div className="location-crosshair" aria-hidden="true">
          <div className="location-crosshair__v" />
          <div className="location-crosshair__h" />
          <div className="location-crosshair__dot" />
        </div>

        {/* Current location button */}
        <button
          className="location-geo-btn"
          onClick={handleCurrentLocation}
          disabled={pendingGeo}
          aria-label="Use current location"
        >
          {pendingGeo ? (
            <div className="location-geo-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          <span>My location</span>
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="location-bottom">
        <div className="location-bottom__selected">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a4 4 0 00-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 00-4-4z" stroke={hasLocation ? 'var(--color-primary)' : 'var(--color-text-muted)'} strokeWidth="1.3" fill="none"/>
            {hasLocation && <circle cx="7" cy="5" r="1.5" fill="var(--color-primary)"/>}
          </svg>
          <span className={hasLocation ? 'location-bottom__name' : 'location-bottom__placeholder'}>
            {hasLocation ? locationName : 'Pan map to select location'}
          </span>
        </div>
        <Button
          variant="primary"
          fullWidth
          onClick={handleConfirm}
        >
          Confirm Location →
        </Button>
      </div>
    </div>
  )
}
