import { useState, useCallback } from 'react';

interface JobInfo {
  title: string;
  company: string;
  url: string;
  source: string;
  confidence: number;
  method: string;
}

interface UseJobExtractionReturn {
  extractJobInfo: () => Promise<JobInfo | null>;
  isExtracting: boolean;
  error: string | null;
}

export const useJobExtraction = (): UseJobExtractionReturn => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractJobInfo = useCallback(async (): Promise<JobInfo | null> => {
    setIsExtracting(true);
    setError(null);

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id || !tab.url) {
          throw new Error('No active tab found');
        }

        console.log('📄 Tab title:', tab.title);
        console.log('📄 Tab URL:', tab.url);

        // Check if we can inject scripts on this URL
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
          throw new Error('Cannot access browser internal pages');
        }

        let contentScriptReady = false;
        let attempts = 0;
        const maxAttempts = 5; // Increased attempts

        while (!contentScriptReady && attempts < maxAttempts) {
          attempts++;
          console.log(`🔄 Attempt ${attempts}/${maxAttempts} to communicate with content script`);

          try {
            // Try to ping the existing content script
            const pingResponse = await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Ping timeout')), 2000);
              
              chrome.tabs.sendMessage(tab.id!, { action: 'ping' }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });

            if ((pingResponse as any)?.success) {
              console.log('🏓 Content script is alive:', pingResponse);
              contentScriptReady = true;
              break;
            }
          } catch (pingError) {
            console.log(`❌ Ping failed on attempt ${attempts}:`, pingError);
          }

          // If ping failed, try to inject the content script
          if (!contentScriptReady) {
            try {
              console.log('💉 Injecting content script...');
              
              // Inject the content script
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content/contentScript.js']
              });

              // Wait for the script to initialize
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Try to ping again
              const pingResponse = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Post-inject ping timeout')), 3000);
                
                chrome.tabs.sendMessage(tab.id!, { action: 'ping' }, (response) => {
                  clearTimeout(timeout);
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(response);
                  }
                });
              });

              if ((pingResponse as any)?.success) {
                console.log('✅ Content script injected and responding');
                contentScriptReady = true;
              }
            } catch (injectError) {
              console.error(`❌ Failed to inject content script on attempt ${attempts}:`, injectError);
              
              if (attempts === maxAttempts) {
                throw new Error('Could not inject content script. Please refresh the page and try again.');
              }
            }
          }

          // Wait before next attempt
          if (!contentScriptReady && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!contentScriptReady) {
          throw new Error('Content script is not responding after multiple attempts');
        }

        // Now extract job info
        console.log('🔍 Starting job info extraction...');
        const response = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Extraction timeout')), 10000);
          
          chrome.tabs.sendMessage(tab.id!, { action: 'extractJobInfo' }, (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('📄 Extraction response:', response);

        if (response && (response as any).success !== false) {
          const result = response as any;
          // Validate the response has meaningful data
          if (result.title && result.company && 
              result.title !== 'Unknown Position' && 
              result.company !== 'Unknown Company') {
            
            console.log('✅ Job extraction successful:', result);
            return {
              title: result.title,
              company: result.company,
              url: result.url || tab.url,
              source: result.source || tab.url?.split('/')[2] || 'unknown',
              confidence: result.confidence || 50,
              method: result.method || 'content-script'
            };
          } else {
            // Fallback: try to extract from tab title and URL
            console.log('⚠️ Content script returned generic data, trying fallback extraction...');
            const fallbackResult = extractFromTabInfo(tab.title || '', tab.url);
            
            if (fallbackResult.title !== 'Unknown Position' && fallbackResult.company !== 'Unknown Company') {
              console.log('✅ Fallback extraction successful:', fallbackResult);
              return fallbackResult;
            } else {
              throw new Error('Could not extract meaningful job information from this page');
            }
          }
        } else {
          throw new Error((response as any)?.error || 'Content script returned no data');
        }
      } else {
        throw new Error('Chrome extension APIs not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract job information';
      console.error('❌ Job extraction error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return {
    extractJobInfo,
    isExtracting,
    error
  };
};

// Fallback extraction from tab title and URL
function extractFromTabInfo(title: string, url: string): JobInfo {
  console.log('🔄 Fallback extraction from tab info...');
  console.log('📄 Title:', title);
  console.log('📄 URL:', url);

  let jobTitle = 'Unknown Position';
  let company = 'Unknown Company';
  let confidence = 20;

  if (title) {
    // Enhanced patterns for title extraction
    const patterns = [
      // "Job Application for Senior Technical Writer at Anduril Industries"
      {
        regex: /^(?:Job Application for\s+)?(.+?)\s+at\s+(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 85
      },
      
      // "Binance - Senior Frontend Engineer - KYC Saas"
      {
        regex: /^([A-Z][a-zA-Z\s&.-]{1,30})\s*[-–—]\s*(.+?)(?:\s*[-–—].*)?$/i,
        titleIndex: 2,
        companyIndex: 1,
        confidence: 80
      },
      
      // "Senior Software Engineer at Google"
      {
        regex: /^(.+?)\s+at\s+(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 75
      },
      
      // "Google - Senior Software Engineer"
      {
        regex: /^([^-]+?)\s*[-–—]\s*(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 2,
        companyIndex: 1,
        confidence: 70
      },
      
      // "Job Title | Company Name"
      {
        regex: /^(.+?)\s*\|\s*(.+?)(?:\s*[-|•].*)?$/i,
        titleIndex: 1,
        companyIndex: 2,
        confidence: 65
      }
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern.regex);
      if (match) {
        const extractedTitle = match[pattern.titleIndex]?.trim();
        const extractedCompany = match[pattern.companyIndex]?.trim();

        if (extractedTitle && extractedCompany && 
            extractedTitle.length > 2 && extractedCompany.length > 2) {
          
          // Clean up the extracted values
          jobTitle = extractedTitle.replace(/[^\w\s&.-]/g, '').trim();
          company = extractedCompany.replace(/[^\w\s&.-]/g, '').trim();
          confidence = pattern.confidence;
          
          console.log(`📄 Pattern matched: "${jobTitle}" at "${company}" (confidence: ${confidence}%)`);
          break;
        }
      }
    }
  }

  // Try to extract company from URL if we still don't have one
  if (company === 'Unknown Company' && url) {
    const hostname = new URL(url).hostname;
    
    if (hostname.includes('greenhouse.io')) {
      const pathMatch = url.match(/greenhouse\.io\/([^\/]+)/);
      if (pathMatch) {
        company = pathMatch[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        confidence = Math.max(confidence, 60);
      }
    } else if (hostname.includes('lever.co')) {
      const pathMatch = url.match(/lever\.co\/([^\/]+)/);
      if (pathMatch) {
        company = pathMatch[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        confidence = Math.max(confidence, 60);
      }
    } else if (hostname.includes('jobs.')) {
      const companyMatch = hostname.match(/jobs\.([^.]+)/);
      if (companyMatch) {
        company = companyMatch[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        confidence = Math.max(confidence, 55);
      }
    }
  }

  return {
    title: jobTitle,
    company: company,
    url: url,
    source: new URL(url).hostname,
    confidence: confidence,
    method: 'fallback-tab-info'
  };
}