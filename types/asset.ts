export interface AssetItem {
  id: string;
  taskId: string;
  uploadedBy: string;
  fileUrl: string;
  fileType: string;
  fileSize: string | null;
  label: string | null;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export function formatFileSize(bytes: string | number | null): string {
  if (!bytes) return "-";
  const n = typeof bytes === "string" ? BigInt(bytes) : BigInt(bytes);
  const num = Number(n);
  if (num < 1024) return num + " B";
  if (num < 1024 * 1024) return (num / 1024).toFixed(1) + " KB";
  if (num < 1024 * 1024 * 1024) return (num / (1024 * 1024)).toFixed(1) + " MB";
  return (num / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith("video/")) return "🎬";
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("zip") || fileType.includes("rar")) return "📦";
  return "📁";
}
