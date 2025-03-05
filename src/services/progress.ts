import { db } from "./firebase";
import { ProgressRange, ProgressStats } from "../types/progress";
import { Sprint } from "../types/sprint";
import firebase from "firebase/compat/app";

export const progressService = {
  /**
   * Get progress statistics for a user based on the specified time range
   *
   * @param userId - The user ID to get progress for
   * @param range - The time range for progress stats (today, week, month, year, total)
   * @param timezone - Optional timezone string (defaults to user's local timezone)
   * @returns ProgressStats object with aggregated data
   */
  getProgress: async (
    userId: string,
    range: ProgressRange,
    timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
  ): Promise<ProgressStats> => {
    try {
      // Get range start time based on range type
      const now = new Date();
      let rangeStart: Date | null = null;

      // Set the range start date based on the selected range
      switch (range) {
        case "today":
          rangeStart = new Date(now);
          rangeStart.setHours(0, 0, 0, 0);
          break;
        case "week":
          rangeStart = new Date(now);
          // Get start of current week (Sunday)
          rangeStart.setDate(now.getDate() - now.getDay());
          rangeStart.setHours(0, 0, 0, 0);
          break;
        case "month":
          rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          rangeStart = new Date(now.getFullYear(), 0, 1);
          break;
        case "total":
          // No filter needed for total
          break;
      }

      // Query Firestore for sprints
      let sprintsQuery = db
        .collection("sprints")
        .where("userId", "==", userId)
        // We want all sprints that have a completedAt field, regardless of endedEarly value
        .where("completedAt", "!=", null);

      // Execute query to get all sprints
      const snapshot = await sprintsQuery.get();

      // Convert to Sprint objects with proper date handling
      const allSprints = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          completedAt: (
            data.completedAt as firebase.firestore.Timestamp
          ).toDate(),
        } as Sprint;
      });

      // Filter sprints based on range
      let rangeFilteredSprints: Sprint[];

      if (range === "today") {
        // For 'today' range, use a more reliable approach to filter by day

        // Helper function to check if a date is from today in the specified timezone
        const isDateFromToday = (date: Date): boolean => {
          // Convert dates to strings in YYYY-MM-DD format in the user's timezone
          const dateStr = new Date(date).toLocaleString("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          const todayStr = new Date().toLocaleString("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          return dateStr === todayStr;
        };

        rangeFilteredSprints = allSprints.filter((sprint) => {
          const isToday = isDateFromToday(sprint.completedAt);
          return isToday;
        });
      } else {
        // For other ranges, filter by the range start date
        rangeFilteredSprints = rangeStart
          ? allSprints.filter((sprint) => sprint.completedAt >= rangeStart!)
          : allSprints;
      }

      // Calculate basic stats based on range-filtered sprints
      const { wordCount, minutesWritten, averageWPM } =
        calculateBasicStats(rangeFilteredSprints);

      // Calculate streak using ALL sprints, independent of range
      const currentStreak = calculateCurrentStreak(allSprints, timezone);

      return {
        wordCount,
        minutesWritten,
        averageWPM,
        currentStreak,
      };
    } catch (error) {
      console.error("Error in getProgress:", error);
      throw error;
    }
  },
};

/**
 * Calculate basic progress statistics from sprint data
 */
function calculateBasicStats(sprints: Sprint[]): {
  wordCount: number;
  minutesWritten: number;
  averageWPM: number;
} {
  if (sprints.length === 0) {
    return {
      wordCount: 0,
      minutesWritten: 0,
      averageWPM: 0,
    };
  }

  // Calculate basic stats
  let totalWords = 0;
  let totalDurationSeconds = 0;
  let totalWPM = 0;

  sprints.forEach((sprint) => {
    totalWords += sprint.wordCount;

    // Use actualDuration if available (for sprints ended early), otherwise use planned duration
    const durationSeconds = sprint.actualDuration || sprint.duration;
    totalDurationSeconds += durationSeconds;

    // Calculate and add WPM for this sprint
    const durationMinutes = durationSeconds / 60;
    const wpm = sprint.wordCount / durationMinutes;
    totalWPM += wpm;
  });

  const minutesWritten = totalDurationSeconds / 60;
  const averageWPM = sprints.length > 0 ? totalWPM / sprints.length : 0;

  return {
    wordCount: totalWords,
    minutesWritten,
    averageWPM,
  };
}

/**
 * Calculate the current streak of consecutive days with completed sprints
 */
function calculateCurrentStreak(sprints: Sprint[], timezone: string): number {
  if (sprints.length === 0) {
    return 0;
  }

  // Sort sprints by completion date (most recent first)
  const sortedSprints = [...sprints].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  // Helper function to get date string in user's timezone
  const getDateStr = (date: Date): string => {
    return date.toLocaleDateString("en-US", { timeZone: timezone });
  };

  const now = new Date();
  const today = getDateStr(now);

  // Create yesterday's date correctly
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateStr(yesterday);

  // Get most recent sprint's date
  const lastSprintDate = getDateStr(sortedSprints[0].completedAt);

  // If last sprint isn't from today or yesterday, no current streak
  if (lastSprintDate !== today && lastSprintDate !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days backwards from the last sprint
  let streak = 1;
  let lastDate = lastSprintDate;
  let uniqueDates = new Set<string>([lastDate]);

  for (let i = 1; i < sortedSprints.length; i++) {
    const sprintDate = getDateStr(sortedSprints[i].completedAt);

    // Skip if same day as we already counted
    if (uniqueDates.has(sprintDate)) {
      continue;
    }

    // Create a date object for last date to check consecutive days
    const lastDateObj = new Date(lastDate);
    const expectedPrevDate = getDateStr(
      new Date(lastDateObj.setDate(lastDateObj.getDate() - 1))
    );

    // Check if dates are consecutive
    if (sprintDate !== expectedPrevDate) {
      break;
    }

    streak++;
    lastDate = sprintDate;
    uniqueDates.add(sprintDate);
  }

  return streak;
}
