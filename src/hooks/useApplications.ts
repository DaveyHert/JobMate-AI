import { useState, useEffect, useCallback } from 'react';
import { mockApplications, type Application } from '../data/mockApplications';

interface WeeklyGoal {
  current: number;
  target: number;
}

interface UseApplicationsReturn {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  addApplication: (application: Omit<Application, 'id' | 'status' | 'dateApplied'>) => Promise<void>;
  updateApplicationStatus: (id: number, status: Application['status']) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
  updateWeeklyGoal: (target: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useApplications = (): UseApplicationsReturn => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>({ current: 0, target: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['jobMateData']);
        if (result.jobMateData) {
          setApplications(result.jobMateData.applications || []);
          setWeeklyGoal(result.jobMateData.weeklyGoal || { current: 0, target: 10 });
        }
      } else {
        // Fallback for development
        setApplications(mockApplications);
        setWeeklyGoal({ current: 5, target: 10 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to storage
  const saveData = useCallback(async (newApplications: Application[], newWeeklyGoal: WeeklyGoal) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['jobMateData']);
        const existingData = result.jobMateData || {};
        
        await chrome.storage.local.set({
          jobMateData: {
            ...existingData,
            applications: newApplications,
            weeklyGoal: newWeeklyGoal
          }
        });
      }
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }, []);

  // Add new application
  const addApplication = useCallback(async (applicationData: Omit<Application, 'id' | 'status' | 'dateApplied'>) => {
    try {
      const newApplication: Application = {
        id: Date.now(),
        ...applicationData,
        status: 'applied',
        dateApplied: new Date().toISOString(),
        notes: ''
      };

      const updatedApplications = [newApplication, ...applications];
      const updatedWeeklyGoal = { ...weeklyGoal, current: weeklyGoal.current + 1 };

      setApplications(updatedApplications);
      setWeeklyGoal(updatedWeeklyGoal);
      
      await saveData(updatedApplications, updatedWeeklyGoal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add application');
    }
  }, [applications, weeklyGoal, saveData]);

  // Update application status
  const updateApplicationStatus = useCallback(async (id: number, status: Application['status']) => {
    try {
      const updatedApplications = applications.map(app =>
        app.id === id ? { ...app, status } : app
      );

      setApplications(updatedApplications);
      await saveData(updatedApplications, weeklyGoal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application');
    }
  }, [applications, weeklyGoal, saveData]);

  // Delete application
  const deleteApplication = useCallback(async (id: number) => {
    try {
      const updatedApplications = applications.filter(app => app.id !== id);
      setApplications(updatedApplications);
      await saveData(updatedApplications, weeklyGoal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  }, [applications, weeklyGoal, saveData]);

  // Update weekly goal
  const updateWeeklyGoal = useCallback(async (target: number) => {
    try {
      const updatedWeeklyGoal = { ...weeklyGoal, target };
      setWeeklyGoal(updatedWeeklyGoal);
      await saveData(applications, updatedWeeklyGoal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update weekly goal');
    }
  }, [applications, weeklyGoal, saveData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    applications,
    weeklyGoal,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    updateWeeklyGoal,
    isLoading,
    error
  };
};