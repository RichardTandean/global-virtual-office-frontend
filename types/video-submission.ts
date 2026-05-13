export enum VideoStatus {
  Pending = "Pending",
  Reviewed = "Reviewed",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface VideoSubmissionItem {
  id: string;
  taskId: string;
  userId: string;
  fileUrl: string;
  fileSize: string | null;
  version: number;
  status: VideoStatus;
  submittedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
  task?: {
    id: string;
    title: string;
    status: string;
  };
}

export const videoStatusLabels: Record<VideoStatus, string> = {
  [VideoStatus.Pending]: "Menunggu Review",
  [VideoStatus.Reviewed]: "Sudah Direview",
  [VideoStatus.Approved]: "Disetujui",
  [VideoStatus.Rejected]: "Ditolak",
};

export const videoStatusColors: Record<VideoStatus, string> = {
  [VideoStatus.Pending]: "bg-status-on-hold/10 text-status-on-hold",
  [VideoStatus.Reviewed]: "bg-status-editing/10 text-status-editing",
  [VideoStatus.Approved]: "bg-status-completed/10 text-status-completed",
  [VideoStatus.Rejected]: "bg-status-danger/10 text-status-danger",
};
