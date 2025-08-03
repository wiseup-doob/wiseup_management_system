import Button from './Button'
import './ImageButton.css'

interface ImageButtonProps {
  src: string
  alt: string
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  tabIndex?: number
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  width?: string | number
  height?: string | number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

function ImageButton({
  src,
  alt,
  onClick,
  onHover,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  className = '',
  type = 'button',
  tabIndex = 0,
  variant = 'primary',
  size = 'medium',
  width,
  height,
  objectFit = 'contain',
  ...props
}: ImageButtonProps) {
  return (
    <Button
      onClick={onClick}
      onHover={onHover}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      className={`image-button ${className}`}
      type={type}
      tabIndex={tabIndex}
      variant={variant}
      size={size}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: width,
          height: height,
          objectFit: objectFit,
        }}
        className="image-button__image"
      />
    </Button>
  )
}

export default ImageButton 