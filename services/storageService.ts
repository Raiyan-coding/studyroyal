
import { MissionDataStore, DayData } from '../types';
import { CONFIG } from '../constants';

export const saveToStorage = (data: MissionDataStore): void => {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export const loadFromStorage = (): MissionDataStore => {
  try {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return {};
  }
};

export const getDhakaDate = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: CONFIG.TIMEZONE }));
};

export const getDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${m}-${d}`;
};
