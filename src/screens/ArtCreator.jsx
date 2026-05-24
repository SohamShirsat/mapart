import { useState, useEffect, useCallback, useRef } from 'react'
import { useMap } from 'react-leaflet'
import MapView from '../components/MapView'
import RouteLayer from '../components/RouteLayer'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Slider from '../components/Slider'
import ShapeGrid from '../components/ShapeGrid'
import useMapartStore from '../store/useMapartStore'
import { textToWaypoints } from '../lib/letterToPoints'
import { shapeToWaypoints } from '../lib/shapeToPoints'
import { SHAPES } from '../lib/shapes'
import { snapToRoads, pathLength, offsetWaypoints } from '../lib/snapToRoads'
import './ArtCreator.css'

const MIN_SIZE = 200
const MAX_SIZE = 2000

function estKm(meters) { return (meters / 1000).toFixed(1) }
function estMin(meters) { return Math.round(meters / 1000 * 6) }

// Fit map to waypoints
function MapFitBounds({ waypoints }) {
  const map = useMap()
  useEffect(() => {
    if (waypoints && waypoints.length >= 2) {
      const bounds = waypoints.map((p) => [p.lat, p.lng])
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true, duration: 0.8 })
    }
  }, [waypoints, map])
  return null
}

export default function ArtCreator() {
  const navigateTo = useMapartStore((s) => s.navigateTo)
  const mode = useMapartStore((s) => s.mode)
  const setMode = useMapartStore((s) => s.setMode)
  const inputText = useMapartStore((s) => s.inputText)
  const setInputText = useMapartStore((s) => s.setInputText)
  const selectedFont = useMapartStore((s) => s.selectedFont)
  const setSelectedFont = useMapartStore((s) => s.setSelectedFont)
  const selectedShape = useMapartStore((s) => s.selectedShape)
  const setSelectedShape = useMapartStore((s) => s.setSelectedShape)
  const artSizeMeter = useMapartStore((s) => s.artSizeMeter)
  const setArtSizeMeter = useMapartStore((s) => s.setArtSizeMeter)
  const selectedLocation = useMapartStore((s) => s.selectedLocation)
  const rawWaypoints = useMapartStore((s) => s.rawWaypoints)
  const setRawWaypoints = useMapartStore((s) => s.setRawWaypoints)
  const setSnappedRoute = useMapartStore((s) => s.setSnappedRoute)
  const setRouteDistance = useMapartStore((s) => s.setRouteDistance)
  const setRouteStatus = useMapartStore((s) => s.setRouteStatus)
  const setRouteError = useMapartStore((s) => s.setRouteError)

  const [previewPts, setPreviewPts] = useState([])
  const [generating, setGenerating] = useState(false)
  const [fontLoading, setFontLoading] = useState(false)
  const previewTimer = useRef(null)

  const center = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [20.5937, 78.9629]

  // Regenerate preview points whenever inputs change
  const updatePreview = useCallback(async () => {
    if (!selectedLocation) return
    const { lat, lng } = selectedLocation
    try {
      if (mode === 'text') {
        if (!inputText.trim()) { setPreviewPts([]); return }
        setFontLoading(true)
        const pts = await textToWaypoints(inputText, selectedFont, lat, lng, artSizeMeter)
        setPreviewPts(pts)
        setRawWaypoints(pts)
      } else {
        if (!selectedShape) { setPreviewPts([]); return }
        const shape = SHAPES[selectedShape]
        if (!shape) return
        const pts = shapeToWaypoints(shape.path, lat, lng, artSizeMeter)
        setPreviewPts(pts)
        setRawWaypoints(pts)
      }
    } catch (e) {
      console.warn('Preview generation error:', e)
    } finally {
      setFontLoading(false)
    }
  }, [mode, inputText, selectedFont, selectedShape, artSizeMeter, selectedLocation])

  // Debounce preview updates
  useEffect(() => {
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(updatePreview, 300)
    return () => clearTimeout(previewTimer.current)
  }, [updatePreview])

  async function handleGenerate() {
    if (!rawWaypoints || rawWaypoints.length < 2) return
    setGenerating(true)
    setRouteStatus('loading')
    setRouteError(null)
    navigateTo('preview')

    try {
      const { snapped, distance } = await snapToRoads(rawWaypoints)
      const rawLen = pathLength(rawWaypoints)
      const quality = distance > rawLen * 3 ? 'low_quality' : 'success'
      setSnappedRoute(snapped)
      setRouteDistance(distance)
      setRouteStatus(quality)
    } catch (e) {
      setRouteStatus('error')
      setRouteError(e.message || 'Could not generate route')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = mode === 'text'
    ? inputText.trim().length > 0
    : selectedShape !== null

  const locationLabel = selectedLocation?.displayName?.split(',').slice(0, 2).join(',') || ''

  return (
    <div className="art-creator">
      <TopBar title="Create your art" subtitle={locationLabel} backTo="location" />

      {/* Mode tabs */}
      <div className="art-tabs">
        <button className={`art-tab${mode === 'text' ? ' art-tab--active' : ''}`} onClick={() => setMode('text')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3h10M5 3v8M9 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Text
        </button>
        <button className={`art-tab${mode === 'shape' ? ' art-tab--active' : ''}`} onClick={() => setMode('shape')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.8 5.4H13.4L9.7 8.1L11.1 12.5L7 9.8L2.9 12.5L4.3 8.1L0.6 5.4H5.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          Shape
        </button>
      </div>

      {/* Map preview */}
      <div className="art-map-wrap">
        <MapView center={center} zoom={14} className="art-map">
          {previewPts.length >= 2 && <RouteLayer waypoints={previewPts} variant="preview" />}
          {previewPts.length >= 2 && <MapFitBounds waypoints={previewPts} />}
        </MapView>
        {fontLoading && (
          <div className="art-map-loading">
            <div className="art-map-spinner" />
          </div>
        )}
      </div>

      {/* Control panel */}
      <div className="art-panel">
        {mode === 'text' ? (
          <TextPanel
            inputText={inputText}
            setInputText={setInputText}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
            artSizeMeter={artSizeMeter}
            setArtSizeMeter={setArtSizeMeter}
          />
        ) : (
          <ShapePanel
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            artSizeMeter={artSizeMeter}
            setArtSizeMeter={setArtSizeMeter}
          />
        )}

        <div className="art-panel__cta">
          <div className="art-dist-hint">
            <span className="art-dist-val">~{estKm(artSizeMeter)} km</span>
            <span className="art-dist-sep">·</span>
            <span className="art-dist-time">~{estMin(artSizeMeter)} min</span>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
          >
            {generating ? 'Generating…' : 'Generate Route →'}
          </Button>
        </div>
      </div>
    </div>
  )
}

const FONTS = [
  { key: 'block', label: 'Block' },
  { key: 'rounded', label: 'Round' },
  { key: 'bold', label: 'Bold' },
]

function TextPanel({ inputText, setInputText, selectedFont, setSelectedFont, artSizeMeter, setArtSizeMeter }) {
  const maxLen = 8
  return (
    <div className="text-panel">
      <div className="text-input-wrap">
        <input
          className="text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, maxLen))}
          placeholder="TYPE HERE…"
          maxLength={maxLen}
          autoCapitalize="characters"
          spellCheck={false}
        />
        <span className="text-counter">{inputText.length}/{maxLen}</span>
      </div>

      <div className="font-selector">
        <span className="art-label">Font</span>
        <div className="font-pills">
          {FONTS.map((f) => (
            <button
              key={f.key}
              className={`font-pill${selectedFont === f.key ? ' font-pill--active' : ''}`}
              onClick={() => setSelectedFont(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <SizeSlider value={artSizeMeter} onChange={setArtSizeMeter} />
    </div>
  )
}

function ShapePanel({ selectedShape, setSelectedShape, artSizeMeter, setArtSizeMeter }) {
  return (
    <div className="shape-panel">
      <ShapeGrid selected={selectedShape} onSelect={setSelectedShape} />
      <SizeSlider value={artSizeMeter} onChange={setArtSizeMeter} />
    </div>
  )
}

function SizeSlider({ value, onChange }) {
  return (
    <div className="size-slider-wrap">
      <div className="size-slider-header">
        <span className="art-label">Run Distance</span>
      </div>
      <Slider
        value={value}
        min={MIN_SIZE}
        max={MAX_SIZE}
        step={50}
        onChange={onChange}
        leftLabel="Shorter"
        rightLabel="Longer"
      />
    </div>
  )
}
