import { Request, Response } from 'express';
import {
  createSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  getScheduleWithDetails,
  getScheduleStats,
  getDailyScheduleSummary,
  getStudentScheduleSummary,
  getClassScheduleSummary,
  getSchedulesWithDetailsBatch,
  getScheduleStatsBatch,
} from './schedules.service';
import { CreateScheduleRequest, UpdateScheduleRequest, ScheduleFilter } from './schedules.types';

// 일정 생성 컨트롤러
export async function createScheduleController(req: Request, res: Response): Promise<Response> {
  try {
    const data: CreateScheduleRequest = req.body;
    const newSchedule = await createSchedule(data);
    return res.status(201).json({ success: true, data: newSchedule });
  } catch (error) {
    console.error('일정 생성 오류:', error);
    return res.status(500).json({ success: false, message: '일정 생성 중 오류가 발생했습니다' });
  }
}

// 일정 조회 컨트롤러
export async function getScheduleController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const schedule = await getSchedule(id);
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: '일정을 찾을 수 없습니다' });
    }
    
    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    console.error('일정 조회 오류:', error);
    return res.status(500).json({ success: false, message: '일정 조회 중 오류가 발생했습니다' });
  }
}

// 일정 목록 조회 컨트롤러
export async function getSchedulesController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: ScheduleFilter = req.query;
    const schedules = await getSchedules(filter);
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    console.error('일정 목록 조회 오류:', error);
    return res.status(500).json({ success: false, message: '일정 목록 조회 중 오류가 발생했습니다' });
  }
}

// 일정 업데이트 컨트롤러
export async function updateScheduleController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const data: UpdateScheduleRequest = req.body;
    const updatedSchedule = await updateSchedule(id, data);
    
    if (!updatedSchedule) {
      return res.status(404).json({ success: false, message: '일정을 찾을 수 없습니다' });
    }
    
    return res.status(200).json({ success: true, data: updatedSchedule });
  } catch (error) {
    console.error('일정 업데이트 오류:', error);
    return res.status(500).json({ success: false, message: '일정 업데이트 중 오류가 발생했습니다' });
  }
}

// 일정 삭제 컨트롤러
export async function deleteScheduleController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const success = await deleteSchedule(id);
    
    if (!success) {
      return res.status(404).json({ success: false, message: '일정을 찾을 수 없습니다' });
    }
    
    return res.status(200).json({ success: true, message: '일정이 삭제되었습니다' });
  } catch (error) {
    console.error('일정 삭제 오류:', error);
    return res.status(500).json({ success: false, message: '일정 삭제 중 오류가 발생했습니다' });
  }
}

// 일정 상세 정보 조회 컨트롤러
export async function getScheduleWithDetailsController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const scheduleWithDetails = await getScheduleWithDetails(id);
    
    if (!scheduleWithDetails) {
      return res.status(404).json({ success: false, message: '일정을 찾을 수 없습니다' });
    }
    
    return res.status(200).json({ success: true, data: scheduleWithDetails });
  } catch (error) {
    console.error('일정 상세 정보 조회 오류:', error);
    return res.status(500).json({ success: false, message: '일정 상세 정보 조회 중 오류가 발생했습니다' });
  }
}

// 일정 통계 조회 컨트롤러
export async function getScheduleStatsController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: ScheduleFilter = req.query;
    const stats = await getScheduleStats(filter);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('일정 통계 조회 오류:', error);
    return res.status(500).json({ success: false, message: '일정 통계 조회 중 오류가 발생했습니다' });
  }
}

// 일별 일정 요약 조회 컨트롤러
export async function getDailyScheduleSummaryController(req: Request, res: Response): Promise<Response> {
  try {
    const { date } = req.params;
    const { class_id, student_id } = req.query;
    
    const summary = await getDailyScheduleSummary(
      date,
      class_id as string,
      student_id as string
    );
    
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('일별 일정 요약 조회 오류:', error);
    return res.status(500).json({ success: false, message: '일별 일정 요약 조회 중 오류가 발생했습니다' });
  }
}

// 학생별 일정 요약 조회 컨트롤러
export async function getStudentScheduleSummaryController(req: Request, res: Response): Promise<Response> {
  try {
    const { student_id } = req.params;
    const { from, to } = req.query;
    
    const dateRange = from && to ? { from: from as string, to: to as string } : undefined;
    const summary = await getStudentScheduleSummary(student_id, dateRange);
    
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('학생별 일정 요약 조회 오류:', error);
    return res.status(500).json({ success: false, message: '학생별 일정 요약 조회 중 오류가 발생했습니다' });
  }
}

// 반별 일정 요약 조회 컨트롤러
export async function getClassScheduleSummaryController(req: Request, res: Response): Promise<Response> {
  try {
    const { class_id } = req.params;
    const { from, to } = req.query;
    
    const dateRange = from && to ? { from: from as string, to: to as string } : undefined;
    const summary = await getClassScheduleSummary(class_id, dateRange);
    
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('반별 일정 요약 조회 오류:', error);
    return res.status(500).json({ success: false, message: '반별 일정 요약 조회 중 오류가 발생했습니다' });
  }
}

// 배치 처리를 활용한 일정 상세 정보 조회 컨트롤러
export async function getSchedulesWithDetailsBatchController(req: Request, res: Response): Promise<Response> {
  try {
    const { schedule_ids } = req.body;
    
    if (!Array.isArray(schedule_ids) || schedule_ids.length === 0) {
      return res.status(400).json({ success: false, message: '일정 ID 목록이 필요합니다' });
    }
    
    const schedulesWithDetails = await getSchedulesWithDetailsBatch(schedule_ids);
    
    return res.status(200).json({ success: true, data: schedulesWithDetails });
  } catch (error) {
    console.error('배치 일정 상세 정보 조회 오류:', error);
    return res.status(500).json({ success: false, message: '배치 일정 상세 정보 조회 중 오류가 발생했습니다' });
  }
}

// 배치 처리를 활용한 일정 통계 조회 컨트롤러
export async function getScheduleStatsBatchController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: ScheduleFilter = req.query;
    const stats = await getScheduleStatsBatch(filter);
    
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('배치 일정 통계 조회 오류:', error);
    return res.status(500).json({ success: false, message: '배치 일정 통계 조회 중 오류가 발생했습니다' });
  }
} 