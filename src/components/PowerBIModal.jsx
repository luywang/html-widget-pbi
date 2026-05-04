import { Close } from './common/Icon'

export default function PowerBIModal({ isOpen, onClose, reportName, chartData }) {
  if (!isOpen) return null

  const getColumnStyle = (item) => {
    return item.highlighted
      ? 'linear-gradient(180deg, #0078D4 0%, #1890E8 100%)'
      : 'linear-gradient(180deg, #6264A7 0%, #7C7EB8 100%)'
  }

  const getTextColor = (item) => {
    return item.highlighted ? '#242424' : '#616161'
  }

  return (
    <div className="powerbi-modal-overlay" onClick={onClose}>
      <div className="powerbi-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="powerbi-modal-header">
          <h2>{reportName}</h2>
          <button
            type="button"
            className="powerbi-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Close size={20} />
          </button>
        </div>
        <div className="powerbi-modal-body">
          <div className="powerbi-modal-chart">
            {chartData.map((item, i) => (
              <div key={i} className="powerbi-modal-column-wrapper">
                <div
                  className="powerbi-modal-column"
                  style={{
                    background: getColumnStyle(item),
                    height: `${item.height}px`,
                  }}
                  title={item.count}
                >
                  <span className="powerbi-modal-column-value">{item.value}%</span>
                  <div className="powerbi-modal-tooltip">{item.date}: {item.value}% • {item.count}</div>
                </div>
                <div
                  className="powerbi-modal-column-label"
                  style={{
                    color: getTextColor(item),
                    fontWeight: item.highlighted ? 600 : 500,
                  }}
                >
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="powerbi-modal-footer">
          <span>Last 30 days</span>
        </div>
      </div>
    </div>
  )
}
