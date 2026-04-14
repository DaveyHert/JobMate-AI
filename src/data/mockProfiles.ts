// Default and seed profiles for JobMate AI+.
// The shape lives in src/models/models.ts — do not redefine it here.

import type { UserProfile, JobMateData, JobMateSettings } from "../models/models";
import { CURRENT_SCHEMA_VERSION } from "../models/models";

const now = () => new Date().toISOString();

export const defaultUserProfile: UserProfile = {
  id: "default",
  label: "Frontend Engineer",
  isActive: true,
  createdAt: now(),
  updatedAt: now(),

  identity: {
    firstName: "David",
    lastName: "Herbert",
    fullName: "David Herbert",
    email: "hello@daveyhert.com",
    phone: "+234 810 8946 523",
  },

  location: {
    address: "24 Isaiah Street",
    city: "Port Harcourt",
    state: "Rivers",
    zipCode: "500102",
    country: "Nigeria",
    countryCode: "NG",
    willingToRelocate: true,
    preferredLocations: ["Remote"],
    remotePreference: "remote",
  },

  links: {
    linkedIn: "https://www.linkedin.com/in/daveyhert/",
    github: "https://github.com/daveyhert",
    website: "https://www.daveyhert.com",
    custom: [],
  },

  work: [
    {
      id: "w1",
      jobTitle: "Frontend Engineer",
      company: "JobMate",
      location: "Remote",
      startDate: "2021-01",
      isCurrent: true,
      responsibilities: [
        "Built Chrome extension for AI-powered job applications",
        "Led frontend architecture decisions",
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS"],
    },
  ],

  education: [],
  skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Chrome Extensions"],

  compensation: {
    currency: "USD",
    expectedMin: 3000,
    expectedMax: 10000,
    negotiable: true,
  },

  authorization: {
    // Keyed by ISO country code. Add entries as the user applies to jobs in
    // different countries; the engine only fills for countries listed here.
    NG: "citizen",
  },

  availability: {
    startDate: "immediately",
    noticePeriod: "2 weeks",
  },

  documents: {
    resumes: [],
    resumeUrl: "/resume.pdf",
    resumeFileName: "david-herbert-resume.pdf",
  },

  credentials: [],
  customAnswers: [],
};

export const seedProfiles: UserProfile[] = [defaultUserProfile];

export const defaultSettings: JobMateSettings = {
  theme: "system",
  autoFillEnabled: true,
  notifications: true,
  weeklyGoalReminders: true,
  requireReviewBeforeFill: true, // never auto-submit, never surprise-fill

  coverLetterTone: "professional",
  resumeTweaksEnabled: true,
  minimumMatchScore: 60,

  allowDataSharing: false,
  personalizedExperience: true,
  loginAlerts: true,
  emailNotifications: true,

  linkedInConnected: false,

  // TODO: remove developer / debug settings before launch
  highlightFormFields: false,
};

export function createDefaultJobMateData(): JobMateData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    activeProfileId: defaultUserProfile.id,
    profiles: { [defaultUserProfile.id]: defaultUserProfile },
    applications: [],
    weeklyGoal: { current: 0, target: 10 },
    settings: defaultSettings,
  };
}
