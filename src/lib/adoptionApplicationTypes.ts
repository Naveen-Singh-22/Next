export type AdoptionStatus =
  | "applied"
  | "shortlisted"
  | "home_visit"
  | "approved"
  | "rejected"
  | "adopted";

export type AdoptionTimelineEntry = {
  type: string;
  time: string;
};

export type AdoptionApplication = {
  id: number;
  applicantName: string;
  email: string;
  phone: string;
  city: string;
  housing: string;
  petExperience: string;
  whyAdopt: string;
  animalId: number;
  status: AdoptionStatus;
  adminNotes?: string;
  timeline: AdoptionTimelineEntry[];
  createdAt: string;
};

export const PIPELINE_STATUSES: Exclude<AdoptionStatus, "rejected">[] = [
  "applied",
  "shortlisted",
  "home_visit",
  "approved",
  "adopted",
];

export const STATUS_LABELS: Record<AdoptionStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  home_visit: "Home Visit",
  approved: "Approved",
  rejected: "Rejected",
  adopted: "Adopted",
};
