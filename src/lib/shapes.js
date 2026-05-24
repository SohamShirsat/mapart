// All shapes are normalized SVG path strings in a ~100x100 viewBox.
// Each path is a single continuous stroke (no pen lifts) so it maps to a running route.
// Disconnected parts (e.g. face eyes) are connected with a thin internal connector segment.

export const SHAPES = {
  // ── SYMBOLS ──────────────────────────────────────────────────────────────
  heart: {
    id: 'heart', label: 'Heart', category: 'SYMBOLS',
    path: 'M50,80 C20,60 5,45 5,30 C5,15 17,5 30,5 C38,5 46,10 50,18 C54,10 62,5 70,5 C83,5 95,15 95,30 C95,45 80,60 50,80 Z',
  },
  star: {
    id: 'star', label: 'Star', category: 'SYMBOLS',
    path: 'M50,5 L61,35 L95,35 L68,57 L79,90 L50,70 L21,90 L32,57 L5,35 L39,35 Z',
  },
  lightning: {
    id: 'lightning', label: 'Lightning', category: 'SYMBOLS',
    path: 'M58,5 L25,52 L48,52 L42,95 L75,48 L52,48 Z',
  },
  peace: {
    id: 'peace', label: 'Peace', category: 'SYMBOLS',
    path: 'M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 Z M50,5 L50,95 M50,50 L14,72 M50,50 L86,72',
  },
  infinity: {
    id: 'infinity', label: 'Infinity', category: 'SYMBOLS',
    path: 'M30,50 C30,35 15,25 10,35 C5,45 15,65 30,65 C50,65 50,35 70,35 C85,35 95,45 90,55 C85,65 70,60 70,50 C70,35 50,35 30,50 Z',
  },
  diamond: {
    id: 'diamond', label: 'Diamond', category: 'SYMBOLS',
    path: 'M50,5 L90,40 L50,95 L10,40 Z',
  },
  arrow: {
    id: 'arrow', label: 'Arrow Up', category: 'SYMBOLS',
    path: 'M50,5 L85,45 L62,45 L62,95 L38,95 L38,45 L15,45 Z',
  },
  crown: {
    id: 'crown', label: 'Crown', category: 'SYMBOLS',
    path: 'M10,75 L10,35 L28,55 L50,15 L72,55 L90,35 L90,75 Z',
  },

  // ── FACES ────────────────────────────────────────────────────────────────
  smiley: {
    id: 'smiley', label: 'Smiley', category: 'FACES',
    // Circle + left eye + connector + right eye + connector + smile
    path: 'M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 M35,38 A4,4 0 1,0 35,46 A4,4 0 1,0 35,38 M35,42 L65,42 M65,38 A4,4 0 1,0 65,46 A4,4 0 1,0 65,38 M65,42 L35,62 C38,72 62,72 65,62',
  },
  wink: {
    id: 'wink', label: 'Wink', category: 'FACES',
    path: 'M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 M30,38 L40,42 L30,46 L30,38 M50,42 L65,42 M65,38 A4,4 0 1,0 65,46 A4,4 0 1,0 65,38 M65,42 L35,62 C38,72 62,72 65,62',
  },
  surprised: {
    id: 'surprised', label: 'Surprised', category: 'FACES',
    path: 'M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 M35,38 A4,4 0 1,0 35,46 A4,4 0 1,0 35,38 M35,42 L65,42 M65,38 A4,4 0 1,0 65,46 A4,4 0 1,0 65,38 M65,42 L50,42 M50,62 A10,10 0 1,0 50,82 A10,10 0 1,0 50,62',
  },
  sunglasses: {
    id: 'sunglasses', label: 'Cool', category: 'FACES',
    path: 'M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 M20,38 L80,38 M20,38 L20,50 C20,56 28,60 35,60 C42,60 50,56 50,50 L50,38 M50,38 L50,50 C50,56 58,60 65,60 C72,60 80,56 80,50 L80,38 M35,72 C38,78 62,78 65,72',
  },

  // ── NATURE ───────────────────────────────────────────────────────────────
  sun: {
    id: 'sun', label: 'Sun', category: 'NATURE',
    path: 'M50,20 A30,30 0 1,0 50,80 A30,30 0 1,0 50,20 M50,5 L50,15 M50,85 L50,95 M5,50 L15,50 M85,50 L95,50 M18,18 L25,25 M75,75 L82,82 M82,18 L75,25 M25,75 L18,82',
  },
  flower: {
    id: 'flower', label: 'Flower', category: 'NATURE',
    path: 'M50,35 A15,15 0 1,0 50,65 A15,15 0 1,0 50,35 M50,5 A15,15 0 0,0 35,20 A15,15 0 0,0 50,35 A15,15 0 0,0 65,20 A15,15 0 0,0 50,5 M95,50 A15,15 0 0,0 80,35 A15,15 0 0,0 65,50 A15,15 0 0,0 80,65 A15,15 0 0,0 95,50 M50,95 A15,15 0 0,0 65,80 A15,15 0 0,0 50,65 A15,15 0 0,0 35,80 A15,15 0 0,0 50,95 M5,50 A15,15 0 0,0 20,65 A15,15 0 0,0 35,50 A15,15 0 0,0 20,35 A15,15 0 0,0 5,50',
  },
  leaf: {
    id: 'leaf', label: 'Leaf', category: 'NATURE',
    path: 'M50,90 C50,90 10,65 10,35 C10,15 30,5 50,5 C70,5 90,15 90,35 C90,65 50,90 50,90 M50,90 L50,5',
  },
  wave: {
    id: 'wave', label: 'Wave', category: 'NATURE',
    path: 'M5,65 C15,65 20,50 30,50 C40,50 45,65 55,65 C65,65 70,50 80,50 C90,50 95,65 95,65 M5,50 C15,50 20,35 30,35 C40,35 45,50 55,50 C65,50 70,35 80,35 C90,35 95,50 95,50',
  },
  mountain: {
    id: 'mountain', label: 'Mountain', category: 'NATURE',
    path: 'M50,10 L90,80 L65,80 L75,95 L10,95 L30,60 L15,80 L50,10 M50,10 L35,45 L50,35 L65,45 Z',
  },
  tree: {
    id: 'tree', label: 'Tree', category: 'NATURE',
    path: 'M50,5 L80,45 L63,45 L85,70 L60,70 L60,95 L40,95 L40,70 L15,70 L37,45 L20,45 Z',
  },

  // ── MISC ─────────────────────────────────────────────────────────────────
  trophy: {
    id: 'trophy', label: 'Trophy', category: 'MISC',
    path: 'M25,5 L75,5 L75,40 C75,60 62,70 50,75 C38,70 25,60 25,40 Z M25,20 L10,20 C10,20 8,40 25,40 M75,20 L90,20 C90,20 92,40 75,40 M35,75 L35,85 L65,85 L65,75 M25,85 L75,85 L75,95 L25,95 Z',
  },
  music: {
    id: 'music', label: 'Music Note', category: 'MISC',
    path: 'M35,75 A15,15 0 1,0 35,85 A15,15 0 1,0 35,75 M35,80 L35,20 L80,10 L80,55 M80,60 A15,15 0 1,0 80,70 A15,15 0 1,0 80,60',
  },
  fire: {
    id: 'fire', label: 'Fire', category: 'MISC',
    path: 'M50,95 C25,95 10,78 10,60 C10,45 22,38 28,28 C28,42 35,46 35,46 C35,30 45,18 50,5 C55,18 58,30 65,38 C68,32 68,22 65,15 C80,28 90,45 90,60 C90,78 75,95 50,95 Z',
  },
  moon: {
    id: 'moon', label: 'Moon', category: 'MISC',
    path: 'M65,10 A40,40 0 1,0 65,90 A30,30 0 1,1 65,10 Z',
  },
  spiral: {
    id: 'spiral', label: 'Spiral', category: 'MISC',
    path: 'M50,50 C50,50 60,50 60,40 C60,30 50,25 40,30 C28,36 25,50 30,62 C36,78 55,85 70,78 C88,68 93,48 85,30 C76,10 52,4 32,14 C10,25 4,52 15,75 C27,100 57,105 80,93',
  },
  cross: {
    id: 'cross', label: 'Cross', category: 'MISC',
    path: 'M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35 Z',
  },
}

export const SHAPE_CATEGORIES = ['ALL', 'SYMBOLS', 'FACES', 'NATURE', 'MISC']

export function getShapesByCategory(category) {
  const all = Object.values(SHAPES)
  if (category === 'ALL') return all
  return all.filter((s) => s.category === category)
}
