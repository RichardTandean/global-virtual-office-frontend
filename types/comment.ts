export interface CommentItem {
  id: string;
  taskId: string;
  videoSubmissionId: string | null;
  userId: string;
  content: string;
  timestampSeconds: number | null;
  parentId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  videoSubmission?: {
    id: string;
    version: number;
  } | null;
  parent?: {
    id: string;
    userId: string;
  } | null;
  _count?: {
    replies: number;
  };
  replies?: CommentItem[];
}

export function buildCommentTree(comments: CommentItem[]): CommentItem[] {
  const map = new Map<string, CommentItem>();
  const roots: CommentItem[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
