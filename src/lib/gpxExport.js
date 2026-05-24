export function generateGPX(waypoints, name = 'Mapart Route') {
  const rtepts = waypoints
    .map((p) => `    <rtept lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}"/>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Mapart" xmlns="http://www.topografix.com/GPX/1/1">
  <rte>
    <name>${escapeXml(name)}</name>
${rtepts}
  </rte>
</gpx>`
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function downloadGPX(waypoints, filename = 'mapart-route.gpx') {
  const xml = generateGPX(waypoints)
  const blob = new Blob([xml], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function generateShareImage(waypoints, locationName = '') {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#09090E'
  ctx.fillRect(0, 0, 1080, 1080)

  // Grid lines
  ctx.strokeStyle = '#1E1E2E'
  ctx.lineWidth = 1
  for (let i = 0; i <= 12; i++) {
    const x = (i / 12) * 1080
    const y = (i / 12) * 1080
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke()
  }

  if (waypoints.length < 2) {
    downloadCanvas(canvas)
    return
  }

  // Compute bounds
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const p of waypoints) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }

  const pad = 120
  const spanLat = maxLat - minLat || 0.001
  const spanLng = maxLng - minLng || 0.001

  function toCanvas(lat, lng) {
    const x = pad + ((lng - minLng) / spanLng) * (1080 - pad * 2)
    const y = 1080 - pad - ((lat - minLat) / spanLat) * (1080 - pad * 2)
    return { x, y }
  }

  // Glow pass
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 232, 122, 0.2)'
  ctx.lineWidth = 12
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.shadowColor = '#00E87A'
  ctx.shadowBlur = 20
  ctx.beginPath()
  const first = toCanvas(waypoints[0].lat, waypoints[0].lng)
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < waypoints.length; i++) {
    const pt = toCanvas(waypoints[i].lat, waypoints[i].lng)
    ctx.lineTo(pt.x, pt.y)
  }
  ctx.stroke()
  ctx.restore()

  // Main route line
  ctx.save()
  ctx.strokeStyle = '#00E87A'
  ctx.lineWidth = 4
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.shadowColor = '#00E87A'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < waypoints.length; i++) {
    const pt = toCanvas(waypoints[i].lat, waypoints[i].lng)
    ctx.lineTo(pt.x, pt.y)
  }
  ctx.stroke()
  ctx.restore()

  // Start dot
  ctx.save()
  ctx.fillStyle = '#00E87A'
  ctx.shadowColor = '#00E87A'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(first.x, first.y, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Location name (top left)
  if (locationName) {
    ctx.font = '600 28px "DM Mono", monospace'
    ctx.fillStyle = '#52526A'
    ctx.fillText(locationName.substring(0, 40), 60, 70)
  }

  // Watermark (bottom right)
  ctx.font = '700 42px "Syne", sans-serif'
  ctx.fillStyle = '#00E87A'
  ctx.textAlign = 'right'
  ctx.fillText('Mapart', 1020, 1040)

  ctx.font = '400 22px "DM Mono", monospace'
  ctx.fillStyle = '#52526A'
  ctx.fillText('Draw with your feet.', 1020, 1068)

  return canvas
}

export function downloadShareImage(waypoints, locationName = '') {
  const canvas = generateShareImage(waypoints, locationName)
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mapart-share.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
