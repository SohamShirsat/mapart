import { useState } from 'react'
import { SHAPES, SHAPE_CATEGORIES, getShapesByCategory } from '../lib/shapes'
import './ShapeGrid.css'

// SVG icon renderer for each shape
function ShapeIcon({ shape }) {
  return (
    <svg viewBox="0 0 100 100" className="shape-icon" xmlns="http://www.w3.org/2000/svg">
      <path d={shape.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ShapeGrid({ selected, onSelect }) {
  const [category, setCategory] = useState('ALL')
  const shapes = getShapesByCategory(category)

  return (
    <div className="shape-grid-wrap">
      <div className="shape-categories">
        {SHAPE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`shape-cat-pill${category === cat ? ' shape-cat-pill--active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="shape-grid">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            className={`shape-tile${selected === shape.id ? ' shape-tile--selected' : ''}`}
            onClick={() => onSelect(shape.id)}
            aria-label={shape.label}
          >
            <ShapeIcon shape={shape} />
            <span className="shape-tile-label">{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
