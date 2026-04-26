export type VaccinationStatus = "overdue" | "today" | "upcoming" | "up_to_date";

export type Vaccination = {
  id: number;
  animalId: number;
  animalName: string;
  vaccineName: string;
  dose: string;
  dateGiven: string;
  nextDueDate: string;
  notes?: string;
};

export type VaccinationCreateInput = {
  animalId: number;
  animalName: string;
  vaccineName: string;
  dose: string;
  dateGiven: string;
  nextDueDate: string;
  notes?: string;
};

export type VaccinationUpdateInput = Partial<Pick<Vaccination, "vaccineName" | "dose" | "dateGiven" | "nextDueDate" | "notes">>;

export function normalizeDate(value: string) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getVaccinationStatus(nextDueDate: string, referenceDate = new Date()) {
  const dueDate = normalizeDate(nextDueDate);
  const today = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  const upcomingWindowEnd = new Date(today);
  upcomingWindowEnd.setUTCDate(upcomingWindowEnd.getUTCDate() + 30);

  if (dueDate.getTime() < today.getTime()) {
    return "overdue" as const;
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today" as const;
  }

  if (dueDate.getTime() <= upcomingWindowEnd.getTime()) {
    return "upcoming" as const;
  }

  return "up_to_date" as const;
}

export function formatVaccinationStatusLabel(status: VaccinationStatus) {
  if (status === "overdue") {
    return "Overdue";
  }

  if (status === "today") {
    return "Today";
  }

  if (status === "upcoming") {
    return "Upcoming";
  }

  return "Up to date";
}
