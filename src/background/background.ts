// Background script for JobMate AI+

interface Application {
  id: number;
  title: string;
  company: string;
  url?: string;
  source: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offer' | 'ghosted';
  dateApplied: string;
  notes?: string;
}

interface UserProfile {
  name: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    linkedIn: string;
    website: string;
    github: string;
  };
  professional: {
    currentTitle: string;
    company: string;
    experience: string;
    salary: string;
    salaryMin: string;
    salaryMax: string;
    availability: string;
    workAuthorization: string;
    preferredLocation: string;
  };
  documents: {
    resumeUrl: string;
    coverLetterUrl: string;
  };
}

interface JobMateData {
  currentProfile: string;
  applications: Application[];
  weeklyGoal: { current: number; target: number };
  profiles: Record<string, UserProfile>;
  settings: {
    darkMode: boolean;
    autoFillEnabled: boolean;
    notifications: boolean;
    weeklyGoalReminders: boolean;
  };
}

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
      const result = await chrome.storage.local.get(['jobMateData']);
      if (!result.jobMateData) {
        const defaultData: JobMateData = {
          currentProfile: 'product-manager',
          applications: [],
          weeklyGoal: { current: 0, target: 10 },
          profiles: {
            'product-manager': {
              name: 'Product Manager',
              personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john.doe@email.com',
                phone: '(555) 123-4567',
                address: '123 Main Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'United States',
                linkedIn: 'https://linkedin.com/in/johndoe',
                website: 'https://johndoe.dev',
                github: 'https://github.com/johndoe'
              },
              professional: {
                currentTitle: 'Senior Product Manager',
                company: 'Tech Corp',
                experience: '5+ years',
                salary: '$140,000',
                salaryMin: '$130,000',
                salaryMax: '$150,000',
                availability: 'Immediately',
                workAuthorization: 'US Citizen',
                preferredLocation: 'San Francisco, CA'
              },
              documents: {
                resumeUrl: '/resume-pm.pdf',
                coverLetterUrl: '/cover-letter-pm.pdf'
              }
            },
            'software-engineer': {
              name: 'Software Engineer',
              personalInfo: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john.doe@email.com',
                phone: '(555) 123-4567',
                address: '123 Main Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'United States',
                linkedIn: 'https://linkedin.com/in/johndoe',
                website: 'https://johndoe.dev',
                github: 'https://github.com/johndoe'
              },
              professional: {
                currentTitle: 'Senior Software Engineer',
                company: 'Tech Corp',
                experience: '5+ years',
                salary: '$120,000',
                salaryMin: '$110,000',
                salaryMax: '$130,000',
                availability: 'Immediately',
                workAuthorization: 'US Citizen',
                preferredLocation: 'San Francisco, CA'
              },
              documents: {
                resumeUrl: '/resume-swe.pdf',
                coverLetterUrl: '/cover-letter-swe.pdf'
              }
            }
          },
          settings: {
            darkMode: false,
            autoFillEnabled: true,
            notifications: true,
            weeklyGoalReminders: true
          }
        };
        
        await chrome.storage.local.set({ jobMateData: defaultData });
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
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

  private async handleTrackApplication(applicationData: any, sendResponse: (response: any) => void) {
    try {
      const result = await chrome.storage.local.get(['jobMateData']);
      const data: JobMateData = result.jobMateData || {};
      
      if (!data.applications) {
        data.applications = [];
      }
      
      const application: Application = {
        id: Date.now(),
        ...applicationData,
        status: 'applied' as const,
        dateApplied: new Date().toISOString(),
        notes: ''
      };
      
      data.applications.unshift(application);
      
      // Update weekly goal
      if (!data.weeklyGoal) {
        data.weeklyGoal = { current: 0, target: 10 };
      }
      data.weeklyGoal.current++;
      
      await chrome.storage.local.set({ jobMateData: data });
      sendResponse({ success: true, application });
    } catch (error) {
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to track application' });
    }
  }

  private async getApplications(sendResponse: (response: any) => void) {
    try {
      const result = await chrome.storage.local.get(['jobMateData']);
      const data: JobMateData = result.jobMateData || {};
      sendResponse({ applications: data.applications || [] });
    } catch (error) {
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to get applications' });
    }
  }

  private async updateApplicationStatus(applicationId: number, status: string, sendResponse: (response: any) => void) {
    try {
      const result = await chrome.storage.local.get(['jobMateData']);
      const data: JobMateData = result.jobMateData || {};
      
      if (data.applications) {
        const application = data.applications.find(app => app.id === applicationId);
        if (application) {
          application.status = status as Application['status'];
          
          await chrome.storage.local.set({ jobMateData: data });
          sendResponse({ success: true });
        } else {
          sendResponse({ error: 'Application not found' });
        }
      } else {
        sendResponse({ error: 'No applications found' });
      }
    } catch (error) {
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to update application' });
    }
  }

  private async generateCoverLetter(jobDescription: string, profile: any, sendResponse: (response: any) => void) {
    try {
      // TODO: Integrate with AI service (OpenAI, Claude, etc.)
      // For now, return a placeholder response
      
      const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${profile.professional.currentTitle} position. With ${profile.professional.experience} of experience in the field, I am confident that my skills and background make me an ideal candidate for this role.

In my current position at ${profile.professional.company}, I have successfully [specific achievements related to the job description]. My expertise in [relevant skills] aligns perfectly with your requirements.

I am particularly excited about this opportunity because [reason specific to the company/role]. I believe my experience in [relevant area] would allow me to make an immediate impact on your team.

Thank you for considering my application. I look forward to discussing how my background and enthusiasm can contribute to your organization's success.

Best regards,
${profile.personalInfo.fullName}`;

      sendResponse({
        success: true,
        coverLetter,
        metadata: {
          generatedAt: new Date().toISOString(),
          jobDescriptionLength: jobDescription.length,
          profile: profile.professional.currentTitle
        }
      });
    } catch (error) {
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to generate cover letter' });
    }
  }

  private async analyzeJobFit(jobDescription: string, profile: any, sendResponse: (response: any) => void) {
    try {
      // TODO: Integrate with AI service for real analysis
      // For now, return a mock analysis
      
      const mockAnalysis = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100%
        matches: ['JavaScript', 'React', 'Node.js', 'Product Management', 'Agile'],
        missing: ['Python', 'AWS', 'Machine Learning'],
        recommendations: [
          'Highlight your React experience in your resume',
          'Mention any cloud computing experience you have',
          'Emphasize your leadership and team collaboration skills',
          'Include specific metrics from your previous roles'
        ],
        keyRequirements: [
          { requirement: 'Bachelor\'s degree', match: true },
          { requirement: '5+ years experience', match: true },
          { requirement: 'JavaScript proficiency', match: true },
          { requirement: 'Python experience', match: false },
          { requirement: 'Cloud platforms', match: false }
        ]
      };
      
      sendResponse({
        success: true,
        analysis: mockAnalysis,
        metadata: {
          analyzedAt: new Date().toISOString(),
          jobDescriptionLength: jobDescription.length,
          profile: profile.professional.currentTitle
        }
      });
    } catch (error) {
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to analyze job fit' });
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

// Initialize background manager
new BackgroundManager();

console.log('JobMate AI+ background script loaded');