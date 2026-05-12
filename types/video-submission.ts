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
  [VideoStatus.Pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [VideoStatus.Reviewed]: "bg-blue-100 text-blue-800 border-blue-200",
  [VideoStatus.Approved]: "bg-green-100 text-green-800 border-green-200",
  [VideoStatus.Rejected]: "bg-red-100 text-red-800 border-red-200",
};
