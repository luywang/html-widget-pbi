import './LinkCard.css'

export default function LinkCard({ link }) {
  const isGithub = link.source === 'github'
  const iconBg = isGithub ? '#24292F' : '#0052CC'
  return (
    <a
      className="link-card"
      href={link.url || '#'}
      onClick={(e) => e.preventDefault()}
    >
      <div className="link-card-icon" style={{ background: iconBg }}>
        {isGithub ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.87 10.9.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.67 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.1-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.4-2.7 5.37-5.26 5.66.41.35.78 1.05.78 2.12v3.14c0 .31.21.66.8.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M12.004 0c-2.35 2.395-2.365 6.185.133 8.585l3.412 3.413-3.197 3.198a6.501 6.501 0 0 1 1.412 7.04l9.566-9.566a.95.95 0 0 0 0-1.344L12.004 0z"/>
            <path d="m10.256 1.74L.67 11.327a.95.95 0 0 0 0 1.344C4.45 16.44 8.22 20.244 12 24c2.295-2.298 2.395-6.096-.08-8.533l-3.47-3.469 3.2-3.2c-1.918-1.955-2.363-4.725-1.394-7.057z"/>
          </svg>
        )}
      </div>
      <div className="link-card-text">
        <div className="link-card-title">{link.title}</div>
        <div className="link-card-subtitle">{link.subtitle}</div>
      </div>
    </a>
  )
}
