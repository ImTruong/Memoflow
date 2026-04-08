import { useState, useCallback, useEffect } from 'react';
import { TabState } from '../types/flashcard';
import { mapLessonToListItem } from '../utils/flashcardParser';
import { flashcardApi } from '../api/flashcardApi';

const PAGE_SIZE = 10;

export const useFlashcardLessons = (type: 'Mine' | 'Community') => {
  const [state, setState] = useState<TabState>({
    items: [],
    pageNumber: -1,
    last: false,
    isInitialLoading: false,
    isLoadingMore: false,
    error: null,
  });

  const isMine = type === 'Mine';

  const fetchLessons = useCallback(async (page: number, shouldAppend: boolean) => {
    setState((prev) => ({
      ...prev,
      error: null,
      isInitialLoading: !shouldAppend,
      isLoadingMore: shouldAppend,
    }));

    try {
      const payload = isMine 
        ? await flashcardApi.getMyLessons(page, PAGE_SIZE)
        : await flashcardApi.getCommunityLessons(page, PAGE_SIZE);

      const mappedItems = payload.data.content.map((lesson) => 
        mapLessonToListItem(lesson, isMine)
      );

      setState((prev) => {
        const newItems = shouldAppend 
          ? [...prev.items, ...mappedItems.filter(mi => !prev.items.some(pi => pi.id === mi.id))] 
          : mappedItems;
        
        return {
          items: newItems,
          pageNumber: payload.data.pageNumber,
          last: payload.data.last,
          isInitialLoading: false,
          isLoadingMore: false,
          error: null,
        };
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitialLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định.',
      }));
    }
  }, [isMine]);

  const refresh = useCallback(() => {
    fetchLessons(0, false);
  }, [fetchLessons]);

  const loadMore = useCallback(() => {
    if (state.isInitialLoading || state.isLoadingMore || state.last || state.pageNumber < 0) {
      return;
    }
    fetchLessons(state.pageNumber + 1, true);
  }, [state, fetchLessons]);

  // Initial load only for 'Mine' or if requested
  useEffect(() => {
    if (isMine) {
      refresh();
    }
  }, [isMine, refresh]);

  return {
    ...state,
    refresh,
    loadMore,
  };
};
