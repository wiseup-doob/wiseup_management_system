import { forwardRef, useMemo, useRef, useState } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './SearchInput.css'

export interface SearchInputProps extends BaseWidgetProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  // 신규: 제안 목록 및 선택 핸들러
  suggestions?: Array<{ id: string; label: string }>
  onSelectSuggestion?: (item: { id: string; label: string }) => void
  // 디자인 옵션
  variant?: 'default' | 'pill'
  showIcon?: boolean
  // 크기/스타일 커스터마이즈
  size?: 'xs' | 'sm' | 'md' | 'lg'
  containerStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
}

export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  ({ 
    placeholder = '검색...',
    value = '',
    onChange,
    onSearch,
    debounceMs = 300,
    className = '',
    suggestions = [],
    onSelectSuggestion,
    variant = 'pill',
    showIcon = true,
    size = 'lg',
    containerStyle,
    inputStyle,
    ...props 
  }, ref) => {
    const [open, setOpen] = useState(false)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)
      setOpen(!!newValue && suggestions.length > 0)
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value)
        setOpen(false)
      }
    }
    const filtered = useMemo(() => {
      const v = (value || '').toLowerCase().trim()
      if (!v) return suggestions
      return suggestions.filter(s => s.label.toLowerCase().includes(v))
    }, [suggestions, value])
    return (
      <BaseWidget 
        ref={ref} 
        className={`search-input-container compact ${variant === 'pill' ? 'pill' : ''} ${className}`}
        style={containerStyle}
        {...props}
      >
        {showIcon && (
          <span className="search-input-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`search-input search-input--${size} ${variant === 'pill' ? 'search-input--pill' : ''}`}
          onFocus={() => setOpen(!!value && suggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          style={inputStyle}
        />
        {open && filtered.length > 0 && (
          <div className="search-suggestions">
            {filtered.map(item => (
              <button
                key={item.id}
                className="search-suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectSuggestion?.(item)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </BaseWidget>
    )
  }
)

SearchInput.displayName = 'SearchInput'
