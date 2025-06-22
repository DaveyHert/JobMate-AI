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
  profiles?: UserProfile[];
  currentProfile: string;
}

interface PersonalInfo {
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
}

interface ProfessionalInfo {
  role: string;
  yearsOfExperience: number;
  workExperience: WorkExperience[];
  skills?: string[];
  salary?: string;
  salaryMin?: string;
  salaryMax?: string;
  availability?: string;
  workAuthorization?: string;
  preferredLocation?: string;
  linkedIn: string;
  website: string;
  github: string;
}
export interface WorkExperience {
  id: string;
  jobTitle: string; // e.g., "Frontend Developer"
  company: string; // e.g., "Google"
  location?: string; // e.g., "Remote" or "San Francisco, CA"
  startDate: string; // e.g., "2022-01" (or "January 2022")
  endDate?: string; // optional if currently working
  isCurrent?: boolean;
  responsibilities: string[]; // bullet points of tasks/achievements
  technologies?: string[]; // (React, Node.js, etc.)
}

export interface UserProfile {
  id: string;
  name: string; // e.g. "Product Designer", "Frontend Dev"
  isActive: boolean;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  documents: {
    resumeUrl?: string;
    coverLetterUrl?: string;
  };
  preferences?: {
    jobTypes: string[];
    locations: string[];
    salaryRange: string;
  };
}
