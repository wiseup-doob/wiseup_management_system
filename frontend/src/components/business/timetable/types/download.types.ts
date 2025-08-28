export interface DownloadOptions {
  format: 'png' | 'jpeg';
  quality: number;           // 0.1 ~ 1.0
  scale: number;             // 1, 2, 3 (해상도 배율)
  filename: string;          // 파일명
  includeHeader: boolean;    // 헤더 포함 여부
  includeTimeColumn: boolean; // 시간 열 포함 여부
  backgroundColor: string;    // 배경색
}

export interface DownloadResult {
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
  fileSize?: number;
}

export interface TimetableDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetableData: any;
  studentInfo?: {
    name: string;
    grade?: string;
    status?: string;
  };
}

export interface ImageGenerationOptions {
  element: HTMLElement;
  options: DownloadOptions;
}

export interface DownloadProgress {
  stage: 'preparing' | 'generating' | 'downloading' | 'complete';
  progress: number;          // 0-100
  message: string;
}
