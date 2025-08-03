import Widget from '../Widget/Widget'
import './SearchInput.css'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
  className?: string
}

function SearchInput({ 
  placeholder, 
  value, 
  onChange, 
  onClick,
  onHover,
  onMouseLeave,
  onFocus, 
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  className = ''
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Widget 
      onClick={onClick}
      onHover={onHover}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      className={`search-input-container ${className}`}
    >
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
    </Widget>
  )
}

export default SearchInput
