// Background script for JobMate AI+
import type { Application, ApplicationStatus, UserProfile } from "../models/models";
import { jobMateStore } from "../store/jobMateStore";
import {
  llmClient,
  LLMNotConfiguredError,
  LLMRequestError,
} from "../engine/LLMClient";

class BackgroundManager {
  constructor() {
    this.init();
  }

  private init() {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('JobMate AI+ extension installed');
      this.initializeDefaultData();
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Set up context menus
    this.setupContextMenus();
  }

  private async initializeDefaultData() {
    try {
      // The store creates default data on first read if none exists.
      await jobMateStore.getData();
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  private async handleMessage(request: any, sender: any, sendResponse: (response: any) => void) {
    try {
      switch (request.action) {
        case 'trackApplication':
          await this.handleTrackApplication(request.data, sendResponse);
          break;
          
        case 'getApplications':
          await this.getApplications(sendResponse);
          break;
          
        case 'updateApplicationStatus':
          await this.updateApplicationStatus(request.applicationId, request.status, sendResponse);
          break;
          
        case 'generateCoverLetter':
          await this.generateCoverLetter(request.jobDescription, request.profile, sendResponse);
          break;
          
        case 'analyzeJobFit':
          await this.analyzeJobFit(request.jobDescription, request.profile, sendResponse);
          break;
          
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleTrackApplication(
    applicationData: Omit<Application, "id" | "status" | "dateApplied" | "history">,
    sendResponse: (response: any) => void
  ) {
    try {
      const application = await jobMateStore.addApplication(applicationData);
      sendResponse({ success: true, application });
    } catch (error) {
      sendResponse({
        error: error instanceof Error ? error.message : "Failed to track application",
      });
    }
  }

  private async getApplications(sendResponse: (response: any) => void) {
    try {
      const applications = await jobMateStore.getApplications();
      sendResponse({ applications });
    } catch (error) {
      sendResponse({
        error: error instanceof Error ? error.message : "Failed to get applications",
      });
    }
  }

  private async updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
    sendResponse: (response: any) => void
  ) {
    try {
      await jobMateStore.updateApplicationStatus(applicationId, status);
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({
        error: error instanceof Error ? error.message : "Failed to update application",
      });
    }
  }

  // AI handlers — real Claude calls via LLMClient. BYOK: if the user hasn't
  // added an API key in Settings, LLMClient throws LLMNotConfiguredError and
  // we surface that as a typed error the UI can prompt against.
  private async generateCoverLetter(
    jobDescription: string,
    profile: UserProfile,
    sendResponse: (response: any) => void
  ) {
    try {
      const coverLetter = await llmClient.generateCoverLetter(jobDescription, profile);
      sendResponse({ success: true, coverLetter });
    } catch (error) {
      sendResponse(buildAIErrorResponse(error));
    }
  }

  private async analyzeJobFit(
    jobDescription: string,
    profile: UserProfile,
    sendResponse: (response: any) => void
  ) {
    try {
      const analysis = await llmClient.analyzeJobFit(jobDescription, profile);
      sendResponse({ success: true, analysis });
    } catch (error) {
      sendResponse(buildAIErrorResponse(error));
    }
  }

  private setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'autoFill',
        title: 'Auto-fill form with JobMate AI+',
        contexts: ['page']
      });
      
      chrome.contextMenus.create({
        id: 'trackApplication',
        title: 'Track this job application',
        contexts: ['page']
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (!tab?.id) return;
      
      switch (info.menuItemId) {
        case 'autoFill':
          chrome.tabs.sendMessage(tab.id, { action: 'autoFill' });
          break;
        case 'trackApplication':
          chrome.tabs.sendMessage(tab.id, { action: 'trackApplication' });
          break;
      }
    });
  }
}

/**
 * Normalize LLMClient errors into a response the popup/dashboard can act on.
 * The `needsConfig` flag lets the UI jump straight to the API key settings
 * field instead of just showing a generic error toast.
 */
function buildAIErrorResponse(error: unknown): {
  success: false;
  error: string;
  needsConfig?: boolean;
  status?: number;
} {
  if (error instanceof LLMNotConfiguredError) {
    return { success: false, error: error.message, needsConfig: true };
  }
  if (error instanceof LLMRequestError) {
    return { success: false, error: error.message, status: error.status };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown AI error",
  };
}

// Initialize background manager
new BackgroundManager();

console.log('JobMate AI+ background script loaded');