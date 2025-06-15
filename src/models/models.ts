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
  professional: {
    currentTitle: string;
    experience: string[];
    skills: string[];
  };
  preferences: {
    jobTypes: string[];
    locations: string[];
    salaryRange: string;
  };
}
