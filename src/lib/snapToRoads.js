const OSRM_BASE = 'https://router.project-osrm.org'

// Maximum waypoints OSRM accepts per request
const MAX_WP = 100

// Downsample waypoints if too many — OSRM has a 100-coordinate limit
function downsample(points, max) {
  if (points.length <= max) return points
  const step = points.length / max
  const result = []
  for (let i = 0; i < max; i++) {
    result.push(points[Math.floor(i * step)])
  }
  result.push(points[points.length - 1])
  return result
}

// Compute total path length in meters from [{lat,lng}] array
export function pathLength(points) {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversine(points[i-1], points[i])
  }
  return total
}

function haversine(a, b) {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export async function snapToRoads(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    throw new Error('Need at least 2 waypoints')
  }

  const sampled = downsample(waypoints, MAX_WP)
  const coords = sampled.map((p) => `${p.lng},${p.lat}`).join(';')

  const url = `${OSRM_BASE}/route/v1/walking/${coords}?overview=full&geometries=geojson`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM error ${res.status}`)

  const data = await res.json()
  if (!data.routes || data.routes.length === 0) throw new Error('No route found')

  const route = data.routes[0]
  const coordinates = route.geometry.coordinates // [lng, lat] order
  const snapped = coordinates.map(([lng, lat]) => ({ lat, lng }))
  const distance = route.distance // meters

  return { snapped, distance }
}

// Apply a small random offset to waypoints (for regeneration)
export function offsetWaypoints(waypoints, maxDeltaDeg = 0.0005) {
  const dLat = (Math.random() * 2 - 1) * maxDeltaDeg
  const dLng = (Math.random() * 2 - 1) * maxDeltaDeg
  return waypoints.map((p) => ({ lat: p.lat + dLat, lng: p.lng + dLng }))
}
