import { useState, useEffect, useCallback } from 'react';
import { flashcardApi } from '../api/flashcardApi';

export const useDailyStats = (refreshTrigger?: number) => {
  const [stats, setStats] = useState({
    reviewedTodayCount: 0,
    dueTodayCount: 0,
    totalReviewsCount: 0,
    isLoading: true
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await flashcardApi.getDailyStats();
      if (response.success) {
        setStats({
          ...response.data,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  return { ...stats, refresh: fetchStats };
};
