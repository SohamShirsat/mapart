const OSRM_BASE = 'https://router.project-osrm.org'
const CHUNK_SIZE = 15    // waypoints per OSRM call — keeps consecutive pts close → roads follow shape
const MAX_TOTAL  = 180   // downsample cap before chunking
const BATCH_PAR  = 4     // parallel OSRM calls per batch

function downsample(points, max) {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  const out = []
  for (let i = 0; i < max; i++) out.push(points[Math.round(i * step)])
  return out
}

// Overlapping chunks: last point of chunk N = first point of chunk N+1
function chunkOverlap(arr, size) {
  if (arr.length <= size) return [arr]
  const chunks = []
  let i = 0
  while (i < arr.length - 1) {
    chunks.push(arr.slice(i, Math.min(i + size, arr.length)))
    i += size - 1
  }
  return chunks
}

async function routeChunk(pts) {
  const coords = pts.map((p) => `${p.lng},${p.lat}`).join(';')
  const res = await fetch(`${OSRM_BASE}/route/v1/walking/${coords}?overview=full&geometries=geojson`)
  if (!res.ok) throw new Error(`OSRM ${res.status}`)
  const data = await res.json()
  if (!data.routes?.length) throw new Error('No route')
  return {
    points: data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    distance: data.routes[0].distance,
  }
}

function haversine(a, b) {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const c = sinDLat * sinDLat + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * sinDLng * sinDLng
  return 2 * R * Math.asin(Math.sqrt(c))
}

export function pathLength(points) {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i])
  return total
}

export async function snapToRoads(waypoints) {
  if (!waypoints || waypoints.length < 2) throw new Error('Need at least 2 waypoints')

  const sampled = downsample(waypoints, MAX_TOTAL)
  const chunks = chunkOverlap(sampled, CHUNK_SIZE)

  // Process in parallel batches to avoid overwhelming the public OSRM API
  const results = []
  for (let i = 0; i < chunks.length; i += BATCH_PAR) {
    const batch = chunks.slice(i, i + BATCH_PAR)
    const batchResults = await Promise.all(batch.map(routeChunk))
    results.push(...batchResults)
  }

  // Concatenate — skip first point of each chunk after the first (shared boundary)
  const snapped = []
  let distance = 0
  for (let i = 0; i < results.length; i++) {
    const pts = i === 0 ? results[i].points : results[i].points.slice(1)
    snapped.push(...pts)
    distance += results[i].distance
  }

  return { snapped, distance }
}

export function offsetWaypoints(waypoints, maxDeltaDeg = 0.0003) {
  const dLat = (Math.random() * 2 - 1) * maxDeltaDeg
  const dLng = (Math.random() * 2 - 1) * maxDeltaDeg
  return waypoints.map((p) => ({ lat: p.lat + dLat, lng: p.lng + dLng }))
}
