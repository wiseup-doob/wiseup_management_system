import { forwardRef, useState } from 'react'
import { BaseWidget } from './BaseWidget'
import { Label } from '../labels/Label'
import type { BaseWidgetProps } from '../../types/components'
import './BaseTab.css'

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

export interface BaseTabProps extends BaseWidgetProps {
  tabs: TabItem[]
  defaultActiveTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export const BaseTab = forwardRef<HTMLDivElement, BaseTabProps>(
  ({ 
    tabs, 
    defaultActiveTab, 
    onTabChange,
    className = '',
    ...props 
  }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '')

    const handleTabClick = (tabId: string) => {
      setActiveTab(tabId)
      onTabChange?.(tabId)
    }

    const currentTab = tabs.find(tab => tab.id === activeTab)

    return (
      <BaseWidget
        ref={ref}
        className={`base-tab ${className}`}
        {...props}
      >
        {/* 탭 헤더 */}
        <div className="tab-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <Label 
                variant="default" 
                size="medium" 
                className="tab-label"
              >
                {tab.label}
              </Label>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="tab-content">
          {currentTab && (
            <div className="tab-panel">
              {currentTab.content}
            </div>
          )}
        </div>
      </BaseWidget>
    )
  }
)

BaseTab.displayName = 'BaseTab' 