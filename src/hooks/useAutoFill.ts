import { useState, useCallback } from 'react';

interface AutoFillResult {
  filled: number;
  detected: number;
  fields: string[];
  analysis: Array<{
    fieldType: string;
    confidence: number;
    method: string;
    selector: string;
  }>;
}

interface UseAutoFillReturn {
  autoFill: () => Promise<AutoFillResult | null>;
  isAutoFilling: boolean;
  error: string | null;
  lastResult: AutoFillResult | null;
}

export const useAutoFill = (): UseAutoFillReturn => {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AutoFillResult | null>(null);

  const autoFill = useCallback(async (): Promise<AutoFillResult | null> => {
    setIsAutoFilling(true);
    setError(null);

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id) {
          throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage(tab.id, { action: 'autoFill' });
        
        if (response?.success) {
          setLastResult(response.result);
          return response.result;
        } else {
          throw new Error(response?.error || 'Auto-fill failed');
        }
      } else {
        throw new Error('Chrome extension APIs not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auto-fill failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsAutoFilling(false);
    }
  }, []);

  return {
    autoFill,
    isAutoFilling,
    error,
    lastResult
  };
};