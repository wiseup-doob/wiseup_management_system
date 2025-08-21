import { forwardRef } from 'react'
import { BaseButton } from '../base/BaseButton'
import type { BaseButtonProps } from '../../types/components'
import './AccountButton.css'

export interface AccountButtonProps extends BaseButtonProps {
  // AccountButton만의 추가 props
  accountName?: string
  accountEmail?: string
  showEmail?: boolean
}

export const AccountButton = forwardRef<HTMLButtonElement, AccountButtonProps>(
  ({ 
    children, 
    className = '', 
    accountName = '관리자',
    accountEmail = 'xxx@gmail.com',
    showEmail = true,
    ...props 
  }, ref) => {
    const combinedClasses = `account-button ${className}`.trim()
    
    return (
      <BaseButton
        ref={ref}
        variant="ghost"
        size="large"
        className={combinedClasses}
        {...props}
      >
        {/* 사용자 아이콘 */}
        <div className="account-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="5" fill="#9CA3AF"/>
            <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="#9CA3AF" strokeWidth="2"/>
          </svg>
        </div>
        
        {/* 계정 정보 */}
        <div className="account-info">
          <div className="account-name">{accountName}</div>
          {showEmail && <div className="account-email">{accountEmail}</div>}
        </div>
        
        {/* 드롭다운 화살표 */}
        <div className="account-dropdown">
          <span>▼</span>
        </div>
        
        {children}
      </BaseButton>
    )
  }
)

AccountButton.displayName = 'AccountButton'
