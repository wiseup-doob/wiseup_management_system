import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './SearchInput.css'

export interface SearchInputProps extends BaseWidgetProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
}

export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  ({ 
    placeholder = '검색...',
    value = '',
    onChange,
    onSearch,
    debounceMs = 300,
    className = '',
    ...props 
  }, ref) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)
    }
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value)
      }
    }
    
    return (
      <BaseWidget 
        ref={ref} 
        className={`search-input-container ${className}`}
        {...props}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
      </BaseWidget>
    )
  }
)

SearchInput.displayName = 'SearchInput'
