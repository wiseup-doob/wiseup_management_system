import { Select, Tag } from 'antd'
import { useTimetableVersion } from '../contexts/TimetableVersionContext'
import type { TimetableVersion } from '../features/schedule/types/timetable-version.types'

interface TimetableVersionSelectorProps {
  style?: React.CSSProperties
  className?: string
}

export function TimetableVersionSelector({ style, className }: TimetableVersionSelectorProps) {
  const { versions, selectedVersion, activeVersion, loading, setSelectedVersion } = useTimetableVersion()

  const handleChange = (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    setSelectedVersion(version || null)
  }

  return (
    <div className={className} style={style}>
      <Select
        value={selectedVersion?.id}
        onChange={handleChange}
        loading={loading}
        placeholder="시간표 버전 선택"
        style={{ width: 200 }}
        optionLabelProp="label"
      >
        {versions.map((version) => (
          <Select.Option
            key={version.id}
            value={version.id}
            label={
              <span>
                {version.displayName}
                {version.isActive && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    활성
                  </Tag>
                )}
              </span>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{version.displayName}</span>
              {version.isActive && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  활성
                </Tag>
              )}
            </div>
            {version.startDate && version.endDate && (
              <div style={{ fontSize: '12px', color: '#888' }}>
                {new Date(version.startDate).toLocaleDateString()} ~ {new Date(version.endDate).toLocaleDateString()}
              </div>
            )}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}
