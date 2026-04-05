import { LessonSummary, FlashcardListItem } from '../types/flashcard';

/**
 * Safely parses a string or object into a Record, handling JSON strings if necessary.
 */
export const parseValueFromContent = (
  content: Record<string, unknown> | string | undefined,
  key: string
): string | undefined => {
  if (!content) return undefined;

  let parsedContent: Record<string, unknown>;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      return undefined;
    }
  } else {
    parsedContent = content;
  }

  const value = parsedContent[key];
  return typeof value === 'string' ? value : undefined;
};

/**
 * Maps a raw lesson summary from the API to a formatted item for the UI.
 */
export const mapLessonToListItem = (
  lesson: LessonSummary,
  isMine: boolean
): FlashcardListItem => {
  const content = lesson.content;
  
  // Privacy parsing
  const privacyMode = 
    parseValueFromContent(content, 'privacyMode') || 
    parseValueFromContent(content, 'privacy_mode') ||
    parseValueFromContent(content, 'privacy');
  
  const isPrivate = 
    privacyMode?.toUpperCase() === 'PRIVATE' || 
    (typeof content === 'object' && content !== null && (content['isPrivate'] === true || content['is_private'] === true || content['privacyMode'] === 'PRIVATE'));

  // Stats
  const setTotal = lesson.totalWords || 0;
  const startedCount = lesson.totalDueWord || 0;
  const masteredCount = lesson.learnedWords || 0;
  const actualDueCount = Math.max(0, startedCount - masteredCount);

  // Visuals
  const icon = 
    parseValueFromContent(content, 'iconName') || 
    parseValueFromContent(content, 'icon') || 
    'book-outline';

  const iconBgColor = parseValueFromContent(content, 'iconBgColor') || '#EEF2FF';
  const iconColor = parseValueFromContent(content, 'iconColor') || '#4F46E5';
  const progressBarColor = parseValueFromContent(content, 'progressBarColor') || '#4F46E5';

  return {
    id: lesson.id,
    title: lesson.title,
    wordCount: setTotal,
    dueCount: actualDueCount,
    totalDue: startedCount,
    author: isMine ? undefined : lesson.creatorName,
    isPrivate: !!isPrivate,
    isOwner: lesson.isOwner ?? isMine, // Use from API or fallback to isMine
    creatorId: lesson.creatorId,
    icon,
    imageUrl: lesson.imageUrl,
    iconBgColor,
    iconColor,
    progressBarColor,
    progressPercentage: setTotal > 0 ? Math.min(100, Math.round((masteredCount / setTotal) * 100)) : 0,
  };
};
