const BASE = 'https://geocode.maps.co'
const API_KEY = '6a135e524c4f1324628731xiu255373'

export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return []
  try {
    const url = `${BASE}/search?q=${encodeURIComponent(query.trim())}&api_key=${API_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Search failed: ${res.status}`)
    const data = await res.json()
    return data.slice(0, 5).map((item, i) => {
      const parts = item.display_name.split(',').map((s) => s.trim())
      return {
        id: item.place_id ?? i,
        displayName: item.display_name,
        shortName: parts[0],
        region: parts.slice(1, 4).filter(Boolean).join(', '),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }
    })
  } catch (err) {
    console.error('searchLocation error:', err)
    return []
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const url = `${BASE}/reverse?lat=${lat}&lon=${lng}&api_key=${API_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return {
      displayName: data.display_name,
      shortName: data.display_name.split(',')[0].trim(),
      lat,
      lng,
    }
  } catch (err) {
    console.error('reverseGeocode error:', err)
    return null
  }
}
