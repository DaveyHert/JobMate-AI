// Background script for JobMate AI+
import type { Application, ApplicationStatus, UserProfile } from "../models/models";
import { jobMateStore } from "../store/jobMateStore";
import { llmClient, LLMNotConfiguredError, LLMRequestError } from "../engine/LLMClient";

type NewApplication = Omit<Application, "id" | "status" | "dateApplied" | "history">;

type BackgroundRequest =
  | { action: "trackApplication"; data: NewApplication }
  | { action: "getApplications" }
  | { action: "updateApplicationStatus"; applicationId: number; status: ApplicationStatus }
  | { action: "generateCoverLetter"; jobDescription: string; profile: UserProfile }
  | { action: "analyzeJobFit"; jobDescription: string; profile: UserProfile };

interface ErrorResponse {
  success?: false;
  error: string;
  needsConfig?: boolean;
  status?: number;
}

type BackgroundResponse =
  | { success: true; application: Application }
  | { applications: Application[] }
  | { success: true }
  | { success: true; coverLetter: string }
  | { success: true; analysis: unknown }
  | ErrorResponse;

type SendResponse = (response: BackgroundResponse) => void;

class BackgroundManager {
  constructor() {
    this.init();
  }

  private init() {
    chrome.runtime.onInstalled.addListener((details) => {
      console.log("JobMate AI+ extension installed");
      this.initializeDefaultData();

      // Open onboarding only on a fresh install, not on update/reload
      if (details.reason === "install") {
        chrome.tabs.create({
          url: chrome.runtime.getURL("onboarding.html"),
        });
      }
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

  private async handleMessage(
    request: BackgroundRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: SendResponse,
  ) {
    try {
      switch (request.action) {
        case "trackApplication":
          await this.handleTrackApplication(request.data, sendResponse);
          break;

        case "getApplications":
          await this.getApplications(sendResponse);
          break;

        case "updateApplicationStatus":
          await this.updateApplicationStatus(request.applicationId, request.status, sendResponse);
          break;

        case "generateCoverLetter":
          await this.generateCoverLetter(request.jobDescription, request.profile, sendResponse);
          break;

        case "analyzeJobFit":
          await this.analyzeJobFit(request.jobDescription, request.profile, sendResponse);
          break;

        default:
          sendResponse({ error: "Unknown action" });
      }
    } catch (error) {
      console.error("Background script error:", error);
      sendResponse({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  private async handleTrackApplication(
    applicationData: NewApplication,
    sendResponse: SendResponse,
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

  private async getApplications(sendResponse: SendResponse) {
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
    sendResponse: SendResponse,
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
    sendResponse: SendResponse,
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
    sendResponse: SendResponse,
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
        id: "autoFill",
        title: "Auto-fill form with JobMate AI+",
        contexts: ["page"],
      });

      chrome.contextMenus.create({
        id: "trackApplication",
        title: "Track this job application",
        contexts: ["page"],
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (!tab?.id) return;

      switch (info.menuItemId) {
        case "autoFill":
          chrome.tabs.sendMessage(tab.id, { action: "autoFill" });
          break;
        case "trackApplication":
          chrome.tabs.sendMessage(tab.id, { action: "trackApplication" });
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
function buildAIErrorResponse(error: unknown): ErrorResponse {
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

console.log("JobMate AI+ background script loaded");
