export interface Sprint {
  id?: string;
  userId: string;
  content: string;
  wordCount: number;
  duration: number;  // total duration in seconds
  completedAt: Date;
  isCompleted: boolean;  // true if sprint was completed, false if discarded/ended early
  actualDuration?: number;  // actual time spent if ended early
}