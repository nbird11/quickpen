import { db } from './firebase';
import { Sprint } from '../types/sprint';
import firebase from 'firebase/compat/app';

export type HighScoreCategory = 'wpm' | 'words' | 'duration';

export interface StreakResult {
  length: number;
}

export const highScoreService = {
  /**
   * Get the best sprint for a specific category
   * 
   * @param userId - The user ID to get high scores for
   * @param category - The category to find the best sprint for (wpm, words, duration)
   * @returns The best sprint for the specified category or null if no sprints exist
   */
  getBestSprint: async (userId: string, category: HighScoreCategory): Promise<Sprint | null> => {
    try {
      // Query all completed sprints for this user
      const sprintsRef = db.collection('sprints')
        .where('userId', '==', userId)
        // We want all completed sprints regardless of whether they ended early
        .where('completedAt', '!=', null);
      
      const snapshot = await sprintsRef.get();
      
      if (snapshot.empty) {
        return null;
      }
      
      // Convert to Sprint objects
      const sprints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: (doc.data().completedAt as firebase.firestore.Timestamp).toDate()
      })) as Sprint[];
      
      // Find the best sprint for the given category
      let bestSprint = sprints[0];
      
      for (const sprint of sprints) {
        switch (category) {
          case 'wpm': {
            const currentWPM = calculateWPM(sprint);
            const bestWPM = calculateWPM(bestSprint);
            if (currentWPM > bestWPM) {
              bestSprint = sprint;
            }
            break;
          }
          case 'words':
            if (sprint.wordCount > bestSprint.wordCount) {
              bestSprint = sprint;
            }
            break;
          case 'duration': {
            const currentDuration = sprint.actualDuration || sprint.duration;
            const bestDuration = bestSprint.actualDuration || bestSprint.duration;
            if (currentDuration > bestDuration) {
              bestSprint = sprint;
            }
            break;
          }
        }
      }
      
      return bestSprint;
    } catch (error) {
      console.error('Error in getBestSprint:', error);
      throw error;
    }
  },
  
  /**
   * Get the longest streak of consecutive days with sprints
   * 
   * @param userId - The user ID to get the streak for
   * @param timezone - Optional timezone string (defaults to user's local timezone)
   * @returns Object with the streak length
   */
  getBestStreak: async (
    userId: string,
    timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
  ): Promise<StreakResult> => {
    try {
      // Query all completed sprints for this user
      const sprintsRef = db.collection('sprints')
        .where('userId', '==', userId)
        // We want all completed sprints regardless of whether they ended early
        .where('completedAt', '!=', null)
        .orderBy('completedAt', 'asc');
      
      const snapshot = await sprintsRef.get();
      
      if (snapshot.empty) {
        return { length: 0 };
      }
      
      // Convert to Sprint objects
      const sprints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: (doc.data().completedAt as firebase.firestore.Timestamp).toDate()
      })) as Sprint[];
      
      // Calculate longest streak
      const streakLength = calculateLongestStreak(sprints, timezone);
      
      return { length: streakLength };
    } catch (error) {
      console.error('Error in getBestStreak:', error);
      throw error;
    }
  }
};

/**
 * Calculate WPM for a sprint
 */
function calculateWPM(sprint: Sprint): number {
  const durationMinutes = (sprint.actualDuration || sprint.duration) / 60;
  return sprint.wordCount / durationMinutes;
}

/**
 * Calculate the longest streak of consecutive days with sprints
 */
function calculateLongestStreak(sprints: Sprint[], timezone: string): number {
  if (sprints.length === 0) {
    return 0;
  }
  
  // Helper function to get date string in user's timezone
  const getDateStr = (date: Date): string => {
    return date.toLocaleDateString('en-US', { timeZone: timezone });
  };
  
  // Track unique dates with sprints
  const uniqueDates = new Set<string>();
  
  // Get all unique dates with sprints
  sprints.forEach(sprint => {
    uniqueDates.add(getDateStr(sprint.completedAt));
  });
  
  // Sort dates chronologically
  const sortedDates = Array.from(uniqueDates).sort();
  
  let currentStreak = 1;
  let longestStreak = 1;
  
  // Iterate through dates to find the longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    // Convert dates to objects for comparison
    const prevDate = new Date(sortedDates[i-1]);
    const currDate = new Date(sortedDates[i]);
    
    // Check if dates are consecutive by comparing milliseconds
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (Math.round(dayDiff) === 1) {
      // Consecutive day
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // Streak broken
      currentStreak = 1;
    }
  }
  
  return longestStreak;
} 