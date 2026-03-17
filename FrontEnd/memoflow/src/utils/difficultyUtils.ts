/**
 * Shared utilities for difficulty badge styling and stats calculation.
 * Used across VocabularyStatsScreen, VocabularyDailyStatsScreen, WordDetailStatsScreen.
 */

export type BadgeStyle = {
  bg: string;
  text: string;
  label: string;
  dot?: string;
};

/**
 * Returns the color/label for a given difficulty string.
 * Handles both full forms (AGAIN, VERY HARD, GOOD, EASY) and shorthand.
 */
export const getBadgeStyle = (difficulty: string): BadgeStyle => {
  const d = difficulty?.toUpperCase() || '';
  if (d === 'AGAIN' || d === 'VERY HARD')
    return { bg: '#FEF2F2', text: '#EF4444', label: 'Again', dot: '#EF4444' };
  if (d === 'HARD')
    return { bg: '#FFF7ED', text: '#F97316', label: 'Hard', dot: '#F97316' };
  if (d === 'GOOD' || d === 'EASY')
    return { bg: '#ECFDF5', text: '#10B981', label: 'Easy', dot: '#10B981' };
  return { bg: '#EFF6FF', text: '#3B82F6', label: 'Very Easy', dot: '#3B82F6' };
};

/**
 * Returns WordDetailStatsScreen-style uppercase badge (HARD/EASY...).
 */
export const getBadgeStyleAlt = (difficulty: string): BadgeStyle => {
  const d = difficulty?.toUpperCase() || '';
  if (d === 'AGAIN' || d === 'VERY HARD') return { bg: '#FEE2E2', text: '#EF4444', label: 'VERY HARD' };
  if (d === 'HARD') return { bg: '#FFEDD5', text: '#F97316', label: 'HARD' };
  if (d === 'GOOD' || d === 'EASY') return { bg: '#DCFCE7', text: '#10B981', label: 'EASY' };
  return { bg: '#DBEAFE', text: '#3B82F6', label: 'VERY EASY' };
};

export type DifficultyChartItem = {
  label: string;
  count: number;
  color: string;
  height: number;
};

/**
 * Normalizes any difficulty value into one of the 4 canonical categories.
 */
export const normalizeDifficulty = (d: string): 'VERY_HARD' | 'HARD' | 'EASY' | 'VERY_EASY' => {
  const upper = d?.toUpperCase() || '';
  if (upper === 'AGAIN' || upper === 'VERY HARD') return 'VERY_HARD';
  if (upper === 'HARD') return 'HARD';
  if (upper === 'GOOD' || upper === 'EASY') return 'EASY';
  return 'VERY_EASY';
};

/**
 * Calculates difficulty distribution from a list of reviews and
 * returns chart data with relative bar heights.
 */
export const getDifficultyChartData = (
  reviews: Array<{ difficulty: string }>,
  maxBarHeight = 60,
  labels = { veryHard: 'V. HARD', hard: 'HARD', easy: 'EASY', veryEasy: 'V. EASY' },
): DifficultyChartItem[] => {
  const counts = { VERY_HARD: 0, HARD: 0, EASY: 0, VERY_EASY: 0 };
  reviews.forEach(r => {
    counts[normalizeDifficulty(r.difficulty)]++;
  });
  const maxVal = Math.max(...Object.values(counts), 1);

  return [
    { label: labels.veryHard, count: counts.VERY_HARD, color: '#F87171', height: (counts.VERY_HARD / maxVal) * maxBarHeight || 5 },
    { label: labels.hard,     count: counts.HARD,      color: '#FB923C', height: (counts.HARD / maxVal) * maxBarHeight || 5 },
    { label: labels.easy,     count: counts.EASY,      color: '#34D399', height: (counts.EASY / maxVal) * maxBarHeight || 5 },
    { label: labels.veryEasy, count: counts.VERY_EASY, color: '#60A5FA', height: (counts.VERY_EASY / maxVal) * maxBarHeight || 5 },
  ];
};
