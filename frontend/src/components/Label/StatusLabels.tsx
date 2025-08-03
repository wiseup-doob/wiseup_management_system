import Label from './Label'
import './StatusLabels.css'

const statusConfig = [
  { label: '자리_등원', color: 'success' as const, bgColor: '#c8e6c9' },
  { label: '자리_미...', color: 'secondary' as const, bgColor: '#ffffff' },
  { label: '자리_결석', color: 'error' as const, bgColor: '#ffcdd2' }
]

function StatusLabels() {
  return (
    <div className="status-labels">
      {statusConfig.map((status) => (
        <div key={status.color} className="status-item">
          <div 
            className="status-color"
            style={{ backgroundColor: status.bgColor }}
          />
          <Label 
            variant="caption" 
            size="small" 
            color={status.color}
          >
            {status.label}
          </Label>
        </div>
      ))}
    </div>
  )
}

export default StatusLabels
