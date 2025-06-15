// Content script for JobMate AI+
import { AutoFillEngine, createAutoFillEngine } from '../autofillEngine';
import { extractJobInfo } from '../utils/jobExtraction';
import { showNotification } from '../utils/notifications';

class ContentScriptManager {
  private autoFillEngine: AutoFillEngine | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.init();
  }

  private async init(): Promise<void> {
    try {
      console.log('🚀 JobMate AI+ content script starting initialization...');
      
      // Initialize autofill engine
      this.autoFillEngine = createAutoFillEngine();
      this.isInitialized = true;
      
      console.log('✅ JobMate AI+ content script initialized successfully');
      console.log('📄 Page URL:', window.location.href);
      console.log('📄 Page title:', document.title);

      // Listen for messages from popup
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('📨 Content script received message:', request);
        this.handleMessage(request, sender, sendResponse);
        return true; // Keep message channel open for async responses
      });

      // Add visual indicators for detected form fields after page load
      this.scheduleFieldHighlighting();

      // Signal that content script is ready
      try {
        chrome.runtime.sendMessage({ action: 'contentScriptReady' });
      } catch (error) {
        // Ignore errors if background script isn't ready
        console.log('📡 Background script not ready, continuing...');
      }

    } catch (error) {
      console.error('❌ Content script initialization failed:', error);
      this.isInitialized = false;
    }
  }

  private scheduleFieldHighlighting(): void {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.highlightDetectedFields(), 1000);
      });
    } else {
      setTimeout(() => this.highlightDetectedFields(), 1000);
    }
  }

  private async handleMessage(request: any, sender: any, sendResponse: (response: any) => void) {
    try {
      // Wait for initialization to complete
      if (this.initializationPromise) {
        await this.initializationPromise;
      }

      console.log(`🔄 Processing action: ${request.action}`);

      switch (request.action) {
        case 'ping':
          console.log('🏓 Ping received, responding...');
          sendResponse({ 
            success: true, 
            message: 'Content script is alive',
            initialized: this.isInitialized,
            url: window.location.href,
            title: document.title
          });
          break;
          
        case 'autoFill':
          const result = await this.handleAutoFill();
          sendResponse(result);
          break;
          
        case 'extractJobInfo':
          const jobInfo = this.extractJobInfo();
          sendResponse(jobInfo);
          break;
          
        case 'extractJobDescription':
          const jobDescription = this.extractJobDescription();
          sendResponse(jobDescription);
          break;
          
        case 'getSelectedText':
          const selectedText = window.getSelection()?.toString() || '';
          sendResponse({ selectedText });
          break;
          
        default:
          console.warn(`❓ Unknown action: ${request.action}`);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Content script message handling error:', error);
      sendResponse({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  }

  private async handleAutoFill(): Promise<{ success: boolean; result?: any; error?: string; message?: string }> {
    try {
      if (!this.autoFillEngine) {
        return { success: false, error: 'Autofill engine not initialized' };
      }

      console.log('🔄 Starting auto-fill process...');
      const result = await this.autoFillEngine.autoFillPage();
      
      if (result.filled > 0) {
        console.log(`✅ Auto-fill successful: ${result.filled} fields filled`);
        showNotification(`Successfully filled ${result.filled} fields!`, 'success');
        return { success: true, result };
      } else {
        console.log('⚠️ No fillable fields found');
        showNotification('No fillable fields found on this page', 'warning');
        return { success: false, message: 'No fields found' };
      }
    } catch (error) {
      console.error('❌ AutoFill error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private extractJobInfo(): any {
    try {
      console.log('🔍 Starting job info extraction...');
      console.log('📄 Current page title:', document.title);
      console.log('📄 Current page URL:', window.location.href);
      
      // Use the sophisticated job extraction utility
      const result = extractJobInfo();
      
      console.log('✅ Job extraction result:', result);
      
      // Return the result with success flag
      return {
        ...result,
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error extracting job info:', error);
      return {
        title: 'Unknown Position',
        company: 'Unknown Company',
        url: window.location.href,
        source: window.location.hostname,
        confidence: 0,
        method: 'fallback',
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractJobDescription(): any {
    try {
      console.log('🔍 Extracting job description...');
      
      // Try multiple selectors for job description
      const descriptionSelectors = [
        '[data-testid="job-description"]',
        '.job-description',
        '.job-details',
        '.description',
        '[class*="description"]',
        '.job-content',
        '[class*="content"]',
        '.posting-description',
        '.job-posting-description',
        '[data-automation-id="jobPostingDescription"]',
        '.job-details-section',
        '.job-summary'
      ];

      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.length > 100) {
          console.log(`✅ Found job description via selector: ${selector}`);
          return {
            text: element.textContent.trim(),
            html: element.innerHTML,
            source: selector,
            success: true
          };
        }
      }

      // Fallback: get selected text or main content
      const selectedText = window.getSelection()?.toString();
      if (selectedText && selectedText.length > 100) {
        console.log('✅ Using selected text as job description');
        return {
          text: selectedText.trim(),
          html: selectedText,
          source: 'selection',
          success: true
        };
      }

      // Last resort: try to get main content
      const mainContent = document.querySelector('main, .main, #main, .content, #content');
      if (mainContent && mainContent.textContent && mainContent.textContent.length > 100) {
        console.log('✅ Using main content as job description');
        return {
          text: mainContent.textContent.trim(),
          html: mainContent.innerHTML,
          source: 'main-content',
          success: true
        };
      }

      console.log('⚠️ No job description found');
      return {
        text: '',
        html: '',
        source: 'none',
        success: false
      };
    } catch (error) {
      console.error('❌ Error extracting job description:', error);
      return {
        text: '',
        html: '',
        source: 'error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private highlightDetectedFields() {
    if (!this.autoFillEngine || !this.isInitialized) {
      console.log('⚠️ Cannot highlight fields - autofill engine not ready');
      return;
    }

    try {
      const detectedFields = this.autoFillEngine.getDetectedFields();
      console.log(`🎯 Highlighting ${Object.keys(detectedFields).length} detected fields`);
      
      Object.keys(detectedFields).forEach(selector => {
        try {
          const element = document.querySelector(selector);
          if (element) {
            (element as HTMLElement).style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
            (element as HTMLElement).style.transition = 'box-shadow 0.3s ease';
            
            // Add tooltip
            (element as HTMLElement).title = `JobMate AI+ detected: ${detectedFields[selector]}`;
          }
        } catch (error) {
          console.warn('⚠️ Error highlighting field:', selector, error);
        }
      });
    } catch (error) {
      console.warn('⚠️ Error highlighting detected fields:', error);
    }
  }
}

// Initialize content script with error handling and global availability
try {
  console.log('🚀 Initializing JobMate AI+ content script...');
  
  // Create the manager instance
  const contentScriptManager = new ContentScriptManager();
  
  // Make it globally available for debugging
  (window as any).jobMateContentScript = contentScriptManager;
  
  console.log('✅ JobMate AI+ content script setup complete');
} catch (error) {
  console.error('❌ Failed to initialize JobMate AI+ content script:', error);
}

// Also handle the case where the script is injected multiple times
if (!(window as any).jobMateContentScriptLoaded) {
  (window as any).jobMateContentScriptLoaded = true;
  console.log('🔒 JobMate AI+ content script marked as loaded');
} else {
  console.log('⚠️ JobMate AI+ content script already loaded, skipping initialization');
}