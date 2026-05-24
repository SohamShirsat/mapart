import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/icons')
mkdirSync(OUT, { recursive: true })

// Icon SVG: dark square, mint GPS trace drawing an "M"
const iconSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.14}" fill="#09090E"/>
  <path
    d="M${size*0.18},${size*0.78} L${size*0.28},${size*0.28} L${size*0.50},${size*0.65} L${size*0.72},${size*0.28} L${size*0.82},${size*0.78}"
    stroke="#00E87A"
    stroke-width="${size * 0.07}"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"/>
  <circle cx="${size*0.18}" cy="${size*0.78}" r="${size*0.055}" fill="#00E87A"/>
</svg>`

// Maskable version — extra padding so the mark fits inside the safe zone
const maskableSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#09090E"/>
  <path
    d="M${size*0.22},${size*0.74} L${size*0.31},${size*0.30} L${size*0.50},${size*0.62} L${size*0.69},${size*0.30} L${size*0.78},${size*0.74}"
    stroke="#00E87A"
    stroke-width="${size * 0.065}"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"/>
  <circle cx="${size*0.22}" cy="${size*0.74}" r="${size*0.05}" fill="#00E87A"/>
</svg>`

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
