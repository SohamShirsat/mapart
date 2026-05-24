import './Slider.css'

export default function Slider({ value, min, max, step = 1, onChange, leftLabel, rightLabel }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="slider-wrap">
      {(leftLabel || rightLabel) && (
        <div className="slider-labels">
          <span className="slider-label">{leftLabel}</span>
          <span className="slider-label">{rightLabel}</span>
        </div>
      )}
      <div className="slider-track-wrap">
        <div className="slider-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
