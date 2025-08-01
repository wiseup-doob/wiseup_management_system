import Widget from '../Widget/Widget'
import './Label.css'

interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
  className?: string
  variant?: 'default' | 'heading' | 'caption' | 'error'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

function Label({
  children,
  htmlFor,
  className = '',
  variant = 'default',
  size = 'medium',
  color = 'primary',
  ...props
}: LabelProps) {
  return (
    <Widget
      className={`label label--${variant} label--${size} label--${color} ${className}`}
      role="label"
      {...props}
    >
      {htmlFor && (
        <label htmlFor={htmlFor} className="label__text">
          {children}
        </label>
      )}
      {!htmlFor && (
        <span className="label__text">
          {children}
        </span>
      )}
    </Widget>
  )
}

export default Label 