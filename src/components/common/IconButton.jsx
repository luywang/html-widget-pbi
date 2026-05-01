import './IconButton.css'

// Generic icon-only button. Provides a consistent button reset, hover state, and
// `aria-label` requirement. Callers add their own className for sizing or positioning.
//
// <IconButton label="Close" onClick={...}><Close /></IconButton>
// <IconButton label="Sessions" active={showSessions} className="header-action-btn">...</IconButton>
export default function IconButton({
  label,
  active = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['icon-button', active && 'icon-button-active', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" aria-label={label} className={cls} {...rest}>
      {children}
    </button>
  )
}
