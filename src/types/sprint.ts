export interface Sprint {
  id?: string;
  userId: string;
  content: string;
  wordCount: number;
  duration: number;  // total duration in seconds
  completedAt: Date;
  endedEarly: boolean;  // true if ended before timer ran out, false if completed full duration
  actualDuration?: number;  // actual time spent if ended early
}