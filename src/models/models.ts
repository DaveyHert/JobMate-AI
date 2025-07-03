export interface Application {
  id: number;
  title: string;
  company: string;
  url?: string;
  source: string;
  status: ApplicationStatus;
  dateApplied: string;
  history?: StatusEventLog[];
  notes?: string;
  jobType?: JobType;
  jobBrief?: string;
}

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "rejected"
  | "offer"
  | "ghosted"
  | "withdrawn";

interface StatusEventLog {
  status: ApplicationStatus;
  date: string; // ISO timestamp of the change
}
//  – Every status change pushes a new {status, date} object onto `history. We NEVER delete events, so historical analytics remain intact.

export type JobType = "fulltime" | "contract" | "gig";
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
  linkedIn: string;
  website: string;
  github: string;
}

interface ProfessionalInfo {
  role: string;
  yearsOfExperience: number;
  workExperience?: WorkExperience[];
  company?: string;
  skills?: string[];
  salary?: string;
  salaryMin?: string;
  salaryMax?: string;
  availability?: string;
  workAuthorization?: string;
  preferredLocation?: string;
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
  label: string; // e.g. "Product Designer", "Frontend Dev"
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

interface WeeklyPercentageChange {
  applied: number | null;
  interviews: number | null;
  companies: number | null;
}

interface WeeklyLastWeek {
  applied: number;
  interviews: number;
  companies: number;
}

interface WeeklyChange {
  /** absolute counts this week */
  applied: number;
  interviews: number;
  companies: number /** response‑rate delta in percentage‑points */;
  responseRate: number /** absolute counts for previous week */;
  lastWeek: WeeklyLastWeek /** relative % change for counts (nullable when baseline = 0) */;
  percentageChange: WeeklyPercentageChange;
}

export interface DashboardStats {
  totalApplied: number;
  totalInterviews: number;
  totalCompanies: number;
  responseRate: number; // lifetime %
  weeklyChange: WeeklyChange;
}
