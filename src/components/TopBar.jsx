import './TopBar.css'
import useMapartStore from '../store/useMapartStore'

export default function TopBar({ title, subtitle, backTo, transparent }) {
  const navigateTo = useMapartStore((s) => s.navigateTo)

  return (
    <div className={`topbar${transparent ? ' topbar--transparent' : ''}`}>
      {backTo && (
        <button className="topbar__back" onClick={() => navigateTo(backTo)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="topbar__content">
        <span className="topbar__title">{title}</span>
        {subtitle && <span className="topbar__subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
