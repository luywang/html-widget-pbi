import './DemoArrow.css'

// Red pulsing arrow used to guide a viewer's eye to the next click
// target during a prototype walkthrough. The component only owns the
// visual + pulse animation; positioning (absolute, near the target) is
// the caller's job. Meant to be ephemeral — mount it when the hint
// should appear and unmount (or re-render without it) once the target
// is clicked. See DESIGN_GUIDE.md → "Demo Hint Arrows".
export default function DemoArrow({ direction = 'left', size = 24, className = '' }) {
  const rotations = { right: 0, down: 90, left: 180, up: 270 }
  const rotate = rotations[direction] ?? 0
  return (
    <span
      className={`demo-arrow demo-arrow-${direction} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform={`rotate(${rotate} 12 12)`}>
          <path d="M4 12h16" />
          <path d="M14 6l6 6-6 6" />
        </g>
      </svg>
    </span>
  )
}
