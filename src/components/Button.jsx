import './Button.css'

export default function Button({ children, variant = 'primary', onClick, disabled, fullWidth, small, className = '' }) {
  return (
    <button
      className={`btn btn--${variant}${fullWidth ? ' btn--full' : ''}${small ? ' btn--small' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
