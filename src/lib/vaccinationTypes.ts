export type VaccinationStatus = "overdue" | "today" | "upcoming";

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

export type VaccinationUpdateInput = Partial<Pick<Vaccination, "nextDueDate" | "notes">>;

export function normalizeDate(value: string) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getVaccinationStatus(nextDueDate: string, referenceDate = new Date()) {
  const dueDate = normalizeDate(nextDueDate);
  const today = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));

  if (dueDate.getTime() < today.getTime()) {
    return "overdue" as const;
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today" as const;
  }

  return "upcoming" as const;
}

export function formatVaccinationStatusLabel(status: VaccinationStatus) {
  if (status === "overdue") {
    return "Overdue";
  }

  if (status === "today") {
    return "Today";
  }

  return "Upcoming";
}
