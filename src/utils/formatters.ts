/**
 * Formats a duration from seconds to a readable string (MM:SS).
 * @param seconds The total seconds.
 * @returns A string in MM:SS format.
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};