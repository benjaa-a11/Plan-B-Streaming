"use client";

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'plan-b-channel-history';

type ViewCounts = {
  [channelId: string]: number;
};

// Helper function to safely get history from localStorage
const getInitialHistory = (): ViewCounts => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory && storedHistory !== 'undefined' && storedHistory !== 'null') {
      const parsed = JSON.parse(storedHistory);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error parsing channel history from localStorage on init", error);
  }
  return {}; // Return empty object on any failure
};


export function useChannelHistory() {
  const [viewCounts, setViewCounts] = useState<ViewCounts>(getInitialHistory);
  const [isLoaded, setIsLoaded] = useState(false);

  // The isLoaded state is now mostly for external components that might need it,
  // as the initial state is now loaded synchronously.
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = useCallback((newHistory: ViewCounts) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving channel history to localStorage", error);
    }
  }, []);

  const recordView = useCallback((channelId: string) => {
    setViewCounts(prev => {
      const newCount = (prev[channelId] || 0) + 1;
      const newHistory = { ...prev, [channelId]: newCount };
      updateLocalStorage(newHistory);
      return newHistory;
    });
  }, [updateLocalStorage]);

  return { viewCounts, recordView, isLoaded };
}
