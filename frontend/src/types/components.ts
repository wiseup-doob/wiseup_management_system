export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'
export type ButtonType = 'button' | 'submit' | 'reset'

export interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  disabled?: boolean
  id?: string
}

export interface BaseButtonProps extends BaseComponentProps {
  onClick?: () => void
  onHover?: () => void
  onFocus?: () => void
  onBlur?: () => void
  type?: ButtonType
  variant?: ButtonVariant
  size?: ButtonSize
}

export interface BaseWidgetProps extends BaseComponentProps {
  width?: string | number
  height?: string | number
  padding?: string | number
  margin?: string | number
}

export interface BaseLabelProps extends BaseWidgetProps {
  htmlFor?: string
  required?: boolean
  variant?: 'default' | 'heading' | 'caption' | 'error' | 'secondary' | 'success'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
} 