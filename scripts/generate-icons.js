import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/icons')
mkdirSync(OUT, { recursive: true })

const grid = (s) => {
  const c = '#131E32', n = '#1C2D48'
  const p = (x1,y1,x2,y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${s*0.009}"/>`
  const dot = (x,y) => `<circle cx="${x}" cy="${y}" r="${s*0.017}" fill="${n}"/>`
  return [
    p(0,s*.25,s,s*.16), p(0,s*.47,s,s*.38), p(0,s*.69,s,s*.59), p(0,s*.91,s,s*.81),
    p(s*.19,0,s*.12,s), p(s*.41,0,s*.34,s), p(s*.63,0,s*.56,s), p(s*.84,0,s*.78,s),
    p(0,0,s,s), p(s*.5,0,s,s*.66),
    dot(s*.20,s*.25), dot(s*.42,s*.38), dot(s*.63,s*.16), dot(s*.80,s*.59),
    dot(s*.34,s*.69), dot(s*.56,s*.81),
  ].join('\n  ')
}

// Icon SVG: dark background, city grid, glowing M GPS trace
const iconSVG = (size) => {
  const s = size, r = s*0.14, lw = s*0.044, gw = s*0.11
  const path = `M${s*.19},${s*.81} C${s*.19},${s*.72} ${s*.20},${s*.59} ${s*.22},${s*.47} C${s*.23},${s*.37} ${s*.26},${s*.31} ${s*.31},${s*.30} C${s*.38},${s*.27} ${s*.44},${s*.44} ${s*.50},${s*.56} C${s*.56},${s*.44} ${s*.62},${s*.27} ${s*.69},${s*.30} C${s*.74},${s*.31} ${s*.77},${s*.40} ${s*.78},${s*.50} C${s*.80},${s*.61} ${s*.81},${s*.72} ${s*.81},${s*.81}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${s*0.039}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${s}" height="${s}" rx="${r}" fill="#070C18"/>
  ${grid(s)}
  <path d="${path}" stroke="#00E87A" stroke-width="${gw}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.2"/>
  <path d="${path}" stroke="#00E87A" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow)"/>
  <circle cx="${s*.19}" cy="${s*.81}" r="${s*.05}" fill="#00E87A"/>
</svg>`
}

// Maskable — extra padding so mark stays inside safe zone
const maskableSVG = (size) => {
  const s = size, lw = s*0.042, gw = s*0.10
  const path = `M${s*.22},${s*.78} C${s*.22},${s*.70} ${s*.23},${s*.58} ${s*.25},${s*.47} C${s*.26},${s*.38} ${s*.29},${s*.32} ${s*.33},${s*.31} C${s*.40},${s*.28} ${s*.46},${s*.44} ${s*.50},${s*.55} C${s*.54},${s*.44} ${s*.60},${s*.28} ${s*.67},${s*.31} C${s*.71},${s*.32} ${s*.74},${s*.40} ${s*.75},${s*.50} C${s*.77},${s*.60} ${s*.78},${s*.70} ${s*.78},${s*.78}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${s*0.039}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${s}" height="${s}" fill="#070C18"/>
  ${grid(s)}
  <path d="${path}" stroke="#00E87A" stroke-width="${gw}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.2"/>
  <path d="${path}" stroke="#00E87A" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow)"/>
  <circle cx="${s*.22}" cy="${s*.78}" r="${s*.047}" fill="#00E87A"/>
</svg>`
}

async function generate(svgStr, filename, size) {
  const buf = Buffer.from(svgStr)
  await sharp(buf, { density: 300 }).resize(size, size).png().toFile(join(OUT, filename))
  console.log(`✓ ${filename}`)
}

await generate(iconSVG(192),  'icon-192.png',          192)
await generate(iconSVG(512),  'icon-512.png',          512)
await generate(maskableSVG(512), 'icon-512-maskable.png', 512)
await generate(iconSVG(180),  'apple-touch-icon.png',  180)

console.log('Icons generated in public/icons/')
