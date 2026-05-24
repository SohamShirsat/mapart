import { parse as opentypeParse } from 'opentype.js'

// Font cache — loaded once, reused
const fontCache = {}

const FONT_URLS = {
  block:   '/fonts/Oswald-Bold.woff',
  rounded: '/fonts/Nunito-Bold.woff',
  bold:    '/fonts/Rubik-Bold.woff',
}

export async function loadFont(fontKey) {
  if (fontCache[fontKey]) return fontCache[fontKey]
  const url = FONT_URLS[fontKey] || FONT_URLS.block
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Font fetch failed: ${resp.status}`)
  const buffer = await resp.arrayBuffer()
  const font = opentypeParse(buffer)
  fontCache[fontKey] = font
  return font
}

// Convert SVG path commands to a sampled point array
function samplePathCommands(commands, interval = 4) {
  const points = []
  let cx = 0, cy = 0
  let startX = 0, startY = 0

  function lerp(a, b, t) { return a + (b - a) * t }

  function addSegmentPoints(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0
    const len = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.max(1, Math.floor(len / interval))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      points.push({ x: lerp(x0, x1, t), y: lerp(y0, y1, t) })
    }
  }

  function addCubicPoints(x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1) {
    const steps = 20
    let px = x0, py = y0
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const mt = 1 - t
      const nx = mt*mt*mt*x0 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x1
      const ny = mt*mt*mt*y0 + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*y1
      const dx = nx - px, dy = ny - py
      const len = Math.sqrt(dx*dx + dy*dy)
      if (len >= interval || i === steps) {
        points.push({ x: nx, y: ny })
        px = nx; py = ny
      }
    }
  }

  function addQuadPoints(x0, y0, cpx, cpy, x1, y1) {
    addCubicPoints(
      x0, y0,
      x0 + (2/3)*(cpx-x0), y0 + (2/3)*(cpy-y0),
      x1 + (2/3)*(cpx-x1), y1 + (2/3)*(cpy-y1),
      x1, y1
    )
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        cx = cmd.x; cy = cmd.y
        startX = cx; startY = cy
        points.push({ x: cx, y: cy })
        break
      case 'L':
        addSegmentPoints(cx, cy, cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'C':
        addCubicPoints(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'Q':
        addQuadPoints(cx, cy, cmd.x1, cmd.y1, cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'Z':
        addSegmentPoints(cx, cy, startX, startY)
        cx = startX; cy = startY
        break
      default:
        break
    }
  }

  return points
}

// Degrees per meter at a given latitude
const METERS_PER_DEG_LAT = 111320
function metersPerDegLng(lat) { return 111320 * Math.cos((lat * Math.PI) / 180) }

// Scale and translate raw glyph points to geo coordinates centered on (lat, lng)
function pointsToGeo(rawPoints, centerLat, centerLng, sizeMeter) {
  if (rawPoints.length === 0) return []

  // Compute bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of rawPoints) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1

  // Scale so the larger dimension = sizeMeter
  const scale = sizeMeter / Math.max(spanX, spanY)

  // Half-size in geo degrees
  const halfW = (spanX * scale) / 2
  const halfH = (spanY * scale) / 2

  const mPerDegLng = metersPerDegLng(centerLat)

  return rawPoints.map((p) => {
    // Normalize to [0, span], then center on 0
    const nx = (p.x - minX - spanX / 2) * scale
    const ny = (p.y - minY - spanY / 2) * scale
    return {
      lat: centerLat - ny / METERS_PER_DEG_LAT, // y-axis flip (SVG y goes down)
      lng: centerLng + nx / mPerDegLng,
    }
  })
}

// Main export: text → [{lat, lng}] waypoints
// Bypasses BIDI/GSUB by mapping each character to its glyph directly — avoids
// unsupported OpenType feature table errors in opentype.js.
export async function textToWaypoints(text, fontKey, centerLat, centerLng, sizeMeter) {
  const font = await loadFont(fontKey)
  const fontSize = 72
  const scale = fontSize / font.unitsPerEm
  const allCommands = []
  let xOffset = 0

  // Access cmap directly to bypass opentype.js Bidi/GSUB processing
  const glyphIndexMap = font.tables.cmap?.glyphIndexMap ?? {}

  for (const char of text.toUpperCase()) {
    const cp = char.codePointAt(0)
    const glyphIndex = glyphIndexMap[cp] ?? 0
    const glyph = font.glyphs.get(glyphIndex)
    if (!glyph || !glyph.path) continue

    const glyphPath = glyph.getPath(xOffset, 0, fontSize)
    allCommands.push(...glyphPath.commands)

    const advance = glyph.advanceWidth != null
      ? glyph.advanceWidth * scale
      : fontSize * 0.6
    xOffset += advance + fontSize * 0.05
  }

  const rawPoints = samplePathCommands(allCommands, 3)
  return pointsToGeo(rawPoints, centerLat, centerLng, sizeMeter)
}
