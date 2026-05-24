const BASE = 'https://nominatim.openstreetmap.org'
const HEADERS = { 'User-Agent': 'Mapart-App/1.0 (contact@mapart.app)' }

export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return []
  const url = `${BASE}/search?q=${encodeURIComponent(query.trim())}&format=json&limit=6&addressdetails=1`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.map((item) => ({
    id: item.place_id,
    displayName: item.display_name,
    shortName: item.name || item.display_name.split(',')[0],
    region: [item.address?.city, item.address?.state, item.address?.country].filter(Boolean).join(', '),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }))
}

export async function reverseGeocode(lat, lng) {
  const url = `${BASE}/reverse?lat=${lat}&lon=${lng}&format=json`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return null
  const data = await res.json()
  return {
    displayName: data.display_name,
    shortName: data.address?.neighbourhood || data.address?.suburb || data.address?.city || data.display_name.split(',')[0],
    lat,
    lng,
  }
}
