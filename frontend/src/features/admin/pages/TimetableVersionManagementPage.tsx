import React, { useState } from 'react'
import { Button, Table, Modal, Form, Input, DatePicker, message, Tag } from 'antd'
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import { apiService } from '../../../services/api'
import type { TimetableVersion } from '../../schedule/types/timetable-version.types'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import './TimetableVersionManagementPage.css'

export const TimetableVersionManagementPage: React.FC = () => {
  const { versions, activeVersion, loadVersions, activateVersion } = useTimetableVersion()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false)
  const [isMigrationConfirmOpen, setIsMigrationConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<TimetableVersion | null>(null)
  const [selectedMigrationVersion, setSelectedMigrationVersion] = useState<TimetableVersion | null>(null)
  const [versionToDelete, setVersionToDelete] = useState<TimetableVersion | null>(null)
  const [migrationStats, setMigrationStats] = useState<{
    teachers: { total: number; migrated: number; unmigrated: number }
    classSections: { total: number; migrated: number; unmigrated: number }
    timetables: { total: number; migrated: number; unmigrated: number }
  } | null>(null)
  const [form] = Form.useForm()
  const [copyForm] = Form.useForm()

  // 버전 생성
  const handleCreate = async (values: any) => {
    try {
      await apiService.createTimetableVersion({
        name: values.name,
        displayName: values.displayName,
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        description: values.description,
        order: values.order || 0
      })

      message.success('버전이 생성되었습니다.')
      setIsModalOpen(false)
      form.resetFields()
      loadVersions()
    } catch (error) {
      console.error('버전 생성 실패:', error)
      message.error('버전 생성에 실패했습니다.')
    }
  }

  // 버전 활성화
  const handleActivate = async (versionId: string) => {
    try {
      await activateVersion(versionId)
      message.success('버전이 활성화되었습니다.')
    } catch (error) {
      console.error('버전 활성화 실패:', error)
      message.error('버전 활성화에 실패했습니다.')
    }
  }

  // 버전 삭제 확인 모달 열기
  const handleDeleteClick = (version: TimetableVersion) => {
    console.log('🗑️ 삭제 버튼 클릭:', version)
    setVersionToDelete(version)
    setIsDeleteConfirmOpen(true)
  }

  // 버전 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!versionToDelete) return

    try {
      console.log('🗑️ 삭제 실행:', versionToDelete.id)
      await apiService.deleteTimetableVersion(versionToDelete.id)
      message.success('버전이 삭제되었습니다.')
      setIsDeleteConfirmOpen(false)
      setVersionToDelete(null)
      loadVersions()
    } catch (error) {
      console.error('버전 삭제 실패:', error)
      message.error('버전 삭제에 실패했습니다.')
    }
  }

  // 버전 복사
  const handleCopy = async (values: any) => {
    if (!selectedVersion) return

    try {
      await apiService.copyTimetableVersion(selectedVersion.id, {
        name: values.name,
        displayName: values.displayName,
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        description: values.description,
        order: values.order || 0
      })

      message.success('버전이 복사되었습니다.')
      setIsCopyModalOpen(false)
      copyForm.resetFields()
      setSelectedVersion(null)
      loadVersions()
    } catch (error) {
      console.error('버전 복사 실패:', error)
      message.error('버전 복사에 실패했습니다.')
    }
  }

  // 모든 학생 시간표 초기화
  const handleBulkInitialize = async (versionId: string) => {
    Modal.confirm({
      title: '모든 학생의 시간표를 초기화하시겠습니까?',
      content: '활성 상태의 모든 학생에게 빈 시간표가 생성됩니다.',
      okText: '초기화',
      cancelText: '취소',
      onOk: async () => {
        try {
          await apiService.bulkInitializeTimetables(versionId)
          message.success('학생 시간표가 초기화되었습니다.')
        } catch (error) {
          console.error('초기화 실패:', error)
          message.error('초기화에 실패했습니다.')
        }
      }
    })
  }

  // 마이그레이션 상태 확인
  const checkMigrationStatus = async () => {
    try {
      console.log('🔍 마이그레이션 상태 확인 시작...')
      const response = await apiService.checkMigrationStatus()
      console.log('📊 마이그레이션 상태 응답:', response)
      if (response.success && response.data) {
        const stats = {
          teachers: {
            total: response.data.teachers?.total || 0,
            migrated: response.data.teachers?.migrated || 0,
            unmigrated: response.data.teachers?.unmigrated || 0
          },
          classSections: {
            total: response.data.classSections?.total || 0,
            migrated: response.data.classSections?.migrated || 0,
            unmigrated: response.data.classSections?.unmigrated || 0
          },
          timetables: {
            total: response.data.timetables?.total || 0,
            migrated: response.data.timetables?.migrated || 0,
            unmigrated: response.data.timetables?.unmigrated || 0
          }
        }
        console.log('✅ 마이그레이션 상태:', stats)
        setMigrationStats(stats)
      }
    } catch (error) {
      console.error('❌ 마이그레이션 상태 확인 실패:', error)
      message.error('마이그레이션 상태를 확인할 수 없습니다.')
    }
  }

  // 데이터 마이그레이션 실행 (교사, 수업, 학생 시간표 모두)
  const handleMigrate = async (versionId: string) => {
    try {
      console.log('🚀 전체 마이그레이션 시작:', versionId)
      await apiService.migrateAllToVersion(versionId)
      console.log('✅ 마이그레이션 완료')
      message.success('교사, 수업, 학생 시간표 마이그레이션이 완료되었습니다.')
      setIsMigrationConfirmOpen(false)
      setIsMigrationModalOpen(false)
      await checkMigrationStatus()
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error)
      message.error('데이터 마이그레이션에 실패했습니다.')
    }
  }

  // 마이그레이션 확인
  const handleMigrationConfirm = (version: TimetableVersion) => {
    console.log('📝 마이그레이션 확인 모달 열기:', version.id, version.name)
    setSelectedMigrationVersion(version)
    setIsMigrationConfirmOpen(true)
  }

  // 마이그레이션 모달 열기
  const openMigrationModal = async () => {
    console.log('📂 마이그레이션 모달 열기, 현재 버전 수:', versions.length)
    await checkMigrationStatus()
    setIsMigrationModalOpen(true)
  }

  const columns: ColumnsType<TimetableVersion> = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '표시명',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150
    },
    {
      title: '기간',
      key: 'period',
      width: 250,
      render: (record: TimetableVersion) => {
        if (!record.startDate || !record.endDate) {
          return <span style={{ color: '#999' }}>미설정</span>
        }
        return (
          <span>
            {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
          </span>
        )
      }
    },
    {
      title: '상태',
      key: 'status',
      width: 100,
      render: (record: TimetableVersion) => (
        <Tag color={record.isActive ? 'green' : 'default'}>
          {record.isActive ? '활성' : '비활성'}
        </Tag>
      )
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '작업',
      key: 'actions',
      width: 320,
      fixed: 'right',
      render: (record: TimetableVersion) => (
        <div className="action-buttons">
          {!record.isActive && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleActivate(record.id)}
            >
              활성화
            </Button>
          )}
          <Button
            size="small"
            onClick={() => {
              setSelectedVersion(record)
              setIsCopyModalOpen(true)
            }}
          >
            복사
          </Button>
          <Button
            size="small"
            onClick={() => handleBulkInitialize(record.id)}
          >
            학생 초기화
          </Button>
          {!record.isActive && (
            <Button
              size="small"
              danger
              onClick={() => handleDeleteClick(record)}
            >
              삭제
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="timetable-version-management-page">
      <div className="page-header">
        <h1>시간표 버전 관리</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="large" onClick={openMigrationModal}>
            데이터 마이그레이션
          </Button>
          <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>
            새 버전 만들기
          </Button>
        </div>
      </div>

      <Table
        dataSource={versions}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1200 }}
      />

      {/* 버전 생성 모달 */}
      <Modal
        title="새 시간표 버전 만들기"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="생성"
        cancelText="취소"
        width={600}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="name"
            label="버전 이름"
            rules={[{ required: true, message: '버전 이름을 입력하세요' }]}
          >
            <Input placeholder="예: 2024년 1학기" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="표시명"
            rules={[{ required: true, message: '표시명을 입력하세요' }]}
          >
            <Input placeholder="예: 2024-1학기" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="기간"
          >
            <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['시작일 (선택사항)', '종료일 (선택사항)']} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="버전 설명 (선택사항)" />
          </Form.Item>
          <Form.Item name="order" label="순서">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 버전 복사 모달 */}
      <Modal
        title={`"${selectedVersion?.name}" 버전 복사`}
        open={isCopyModalOpen}
        onCancel={() => {
          setIsCopyModalOpen(false)
          copyForm.resetFields()
          setSelectedVersion(null)
        }}
        onOk={() => copyForm.submit()}
        okText="복사"
        cancelText="취소"
        width={600}
      >
        <Form form={copyForm} onFinish={handleCopy} layout="vertical">
          <Form.Item
            name="name"
            label="새 버전 이름"
            rules={[{ required: true, message: '버전 이름을 입력하세요' }]}
          >
            <Input placeholder="예: 2024년 2학기" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="표시명"
            rules={[{ required: true, message: '표시명을 입력하세요' }]}
          >
            <Input placeholder="예: 2024-2학기" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="기간"
          >
            <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['시작일 (선택사항)', '종료일 (선택사항)']} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="버전 설명 (선택사항)" />
          </Form.Item>
          <Form.Item name="order" label="순서">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 데이터 마이그레이션 모달 */}
      <Modal
        title="데이터 마이그레이션"
        open={isMigrationModalOpen}
        onCancel={() => setIsMigrationModalOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
            ⚠️ 모든 교사, 수업, 학생 시간표 데이터의 versionId를 선택한 버전으로 강제 업데이트합니다.
          </p>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            기존에 다른 버전이 설정되어 있던 데이터도 모두 선택한 버전으로 변경됩니다.
          </p>

          {migrationStats && (
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '12px' }}>📊 현재 데이터 현황</h4>

              {/* 교사 */}
              <div style={{ marginBottom: '8px' }}>
                <strong>교사:</strong>
                <span style={{ marginLeft: '8px' }}>
                  전체 {migrationStats.teachers.total}명
                </span>
              </div>

              {/* 수업 */}
              <div style={{ marginBottom: '8px' }}>
                <strong>수업:</strong>
                <span style={{ marginLeft: '8px' }}>
                  전체 {migrationStats.classSections.total}개
                </span>
              </div>

              {/* 학생 시간표 */}
              <div>
                <strong>학생 시간표:</strong>
                <span style={{ marginLeft: '8px' }}>
                  전체 {migrationStats.timetables.total}개
                </span>
              </div>
            </div>
          )}
        </div>

        {migrationStats && (
          <div>
            <h4>마이그레이션할 버전 선택:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
              {versions.length === 0 && <p style={{ color: '#999' }}>버전이 없습니다. 먼저 버전을 생성하세요.</p>}
              {versions.map(version => (
                <Button
                  key={version.id}
                  type={version.isActive ? 'primary' : 'default'}
                  onClick={() => handleMigrationConfirm(version)}
                  block
                >
                  {version.displayName}
                  {version.isActive && <Tag color="green" style={{ marginLeft: 8 }}>활성</Tag>}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 마이그레이션 확인 모달 */}
      <Modal
        title="데이터 마이그레이션 확인"
        open={isMigrationConfirmOpen}
        onCancel={() => {
          setIsMigrationConfirmOpen(false)
          setSelectedMigrationVersion(null)
        }}
        onOk={() => {
          if (selectedMigrationVersion) {
            handleMigrate(selectedMigrationVersion.id)
          }
        }}
        okText="실행"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        {migrationStats && (
          <div>
            <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
              모든 데이터를 "<strong>{selectedMigrationVersion?.displayName}</strong>" 버전으로 강제 마이그레이션하시겠습니까?
            </p>
            <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #ffc107' }}>
              <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#856404' }}>⚠️ 주의사항:</p>
              <p style={{ color: '#856404' }}>• 교사 {migrationStats.teachers.total}명 전체</p>
              <p style={{ color: '#856404' }}>• 수업 {migrationStats.classSections.total}개 전체</p>
              <p style={{ color: '#856404' }}>• 학생 시간표 {migrationStats.timetables.total}개 전체</p>
              <p style={{ color: '#856404', marginTop: '8px' }}>기존 버전 정보가 모두 덮어씌워집니다.</p>
            </div>
            <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              ⚠️ 이 작업은 되돌릴 수 없습니다!
            </p>
          </div>
        )}
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title="버전 삭제 확인"
        open={isDeleteConfirmOpen}
        onCancel={() => {
          setIsDeleteConfirmOpen(false)
          setVersionToDelete(null)
        }}
        onOk={handleDeleteConfirm}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <p>
          "{versionToDelete?.displayName}" 버전을 삭제하시겠습니까?
        </p>
        <p style={{ color: '#ff4d4f', marginTop: '12px' }}>
          ⚠️ 이 작업은 되돌릴 수 없습니다. 해당 버전의 모든 학생 시간표가 삭제됩니다.
        </p>
      </Modal>
    </div>
  )
}
