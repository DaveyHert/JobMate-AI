export interface Application {
  id: number;
  title: string;
  company: string;
  url?: string;
  source: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes?: string;
  jobType?: "fulltime" | "contract" | "gig";
  jobBrief?: string;
}

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "rejected"
  | "offer"
  | "ghosted"
  | "withdrawn";

export interface WeeklyGoal {
  current: number;
  target: number;
}

export interface PopupData {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  currentProfile: string;
}

export interface UserProfile {
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
    company?: string;
    yearsOfExperience: number;
    workExperience: string[];
    skills?: string[];
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
  preferences?: {
    jobTypes: string[];
    locations: string[];
    salaryRange: string;
  };
}
