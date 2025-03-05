export type ProgressRange = "today" | "week" | "month" | "year" | "total";

export interface ProgressStats {
  wordCount: number;
  averageWPM: number;
  minutesWritten: number;
  currentStreak: number;
}
