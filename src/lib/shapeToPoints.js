// Parse and sample a normalized SVG path string (100x100 viewBox) into geo coordinates

function parsePath(d) {
  const commands = []
  const re = /([MLCQZAz])\s*([-\d.,\s]*)/gi
  let m
  while ((m = re.exec(d)) !== null) {
    const type = m[1].toUpperCase()
    const nums = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (type === 'M') commands.push({ type: 'M', x: nums[0], y: nums[1] })
    else if (type === 'L') {
      for (let i = 0; i < nums.length; i += 2) commands.push({ type: 'L', x: nums[i], y: nums[i+1] })
    }
    else if (type === 'C') {
      for (let i = 0; i < nums.length; i += 6)
        commands.push({ type: 'C', x1: nums[i], y1: nums[i+1], x2: nums[i+2], y2: nums[i+3], x: nums[i+4], y: nums[i+5] })
    }
    else if (type === 'Q') {
      for (let i = 0; i < nums.length; i += 4)
        commands.push({ type: 'Q', x1: nums[i], y1: nums[i+1], x: nums[i+2], y: nums[i+3] })
    }
    else if (type === 'A') {
      // Approximate arc as cubic bezier (simplified — convert to many line segments)
      for (let i = 0; i < nums.length; i += 7)
        commands.push({ type: 'A', rx: nums[i], ry: nums[i+1], xRot: nums[i+2], largeArc: nums[i+3], sweep: nums[i+4], x: nums[i+5], y: nums[i+6] })
    }
    else if (type === 'Z') commands.push({ type: 'Z' })
  }
  return commands
}

function arcToCubics(x0, y0, rx, ry, xRot, largeArc, sweep, x1, y1) {
  // Convert SVG arc to cubic bezier segments (simplified)
  const points = []
  const steps = 16
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const r = (rx + ry) / 2
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = Math.atan2(y0 - cy, x0 - cx) + t * (sweep ? 1 : -1) * Math.PI
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}

function sampleCommands(commands, interval = 3) {
  const points = []
  let cx = 0, cy = 0, startX = 0, startY = 0

  const lerp = (a, b, t) => a + (b - a) * t

  function seg(x0, y0, x1, y1) {
    const d = Math.sqrt((x1-x0)**2 + (y1-y0)**2)
    const n = Math.max(1, Math.floor(d / interval))
    for (let i = 0; i <= n; i++) {
      points.push({ x: lerp(x0,x1,i/n), y: lerp(y0,y1,i/n) })
    }
  }

  function cubic(x0, y0, x1, y1, x2, y2, x3, y3) {
    const steps = Math.max(8, Math.floor(
      (Math.sqrt((x1-x0)**2+(y1-y0)**2) + Math.sqrt((x2-x1)**2+(y2-y1)**2) + Math.sqrt((x3-x2)**2+(y3-y2)**2)) / interval
    ))
    for (let i = 1; i <= steps; i++) {
      const t = i/steps, mt = 1-t
      points.push({
        x: mt**3*x0 + 3*mt**2*t*x1 + 3*mt*t**2*x2 + t**3*x3,
        y: mt**3*y0 + 3*mt**2*t*y1 + 3*mt*t**2*y2 + t**3*y3,
      })
    }
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        cx = cmd.x; cy = cmd.y; startX = cx; startY = cy
        points.push({ x: cx, y: cy })
        break
      case 'L':
        seg(cx, cy, cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'C':
        cubic(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'Q':
        cubic(cx, cy, cx+(2/3)*(cmd.x1-cx), cy+(2/3)*(cmd.y1-cy), cmd.x+(2/3)*(cmd.x1-cmd.x), cmd.y+(2/3)*(cmd.y1-cmd.y), cmd.x, cmd.y)
        cx = cmd.x; cy = cmd.y
        break
      case 'A': {
        const arcPts = arcToCubics(cx, cy, cmd.rx, cmd.ry, cmd.xRot, cmd.largeArc, cmd.sweep, cmd.x, cmd.y)
        arcPts.forEach(p => points.push(p))
        cx = cmd.x; cy = cmd.y
        break
      }
      case 'Z':
        seg(cx, cy, startX, startY)
        cx = startX; cy = startY
        break
    }
  }
  return points
}

const METERS_PER_DEG_LAT = 111320
const mPerDegLng = (lat) => 111320 * Math.cos((lat * Math.PI) / 180)

function pointsToGeo(rawPoints, centerLat, centerLng, sizeMeter) {
  if (!rawPoints.length) return []
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of rawPoints) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1
  const scale = sizeMeter / span
  const mLng = mPerDegLng(centerLat)

  return rawPoints.map((p) => ({
    lat: centerLat - ((p.y - (minY + (maxY-minY)/2)) * scale) / METERS_PER_DEG_LAT,
    lng: centerLng + ((p.x - (minX + (maxX-minX)/2)) * scale) / mLng,
  }))
}

export function shapeToWaypoints(shapePath, centerLat, centerLng, sizeMeter) {
  const commands = parsePath(shapePath)
  const rawPoints = sampleCommands(commands, 2)
  return pointsToGeo(rawPoints, centerLat, centerLng, sizeMeter)
}
