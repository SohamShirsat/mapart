import './BottomSheet.css'

export default function BottomSheet({ children, height, className = '' }) {
  return (
    <div
      className={`bottom-sheet ${className}`}
      style={height ? { height } : undefined}
    >
      <div className="bottom-sheet__handle" />
      <div className="bottom-sheet__content">
        {children}
      </div>
    </div>
  )
}
