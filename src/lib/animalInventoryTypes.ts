export type AnimalSpecies = "dog" | "cat" | "bird";
export type AnimalGender = "male" | "female";
export type AnimalHealthStatus = "healthy" | "injured" | "recovering" | "critical";
export type AnimalStatus = "rescued" | "admitted" | "available" | "adopted";
export type AnimalVaccinationStatus = "up_to_date" | "due_soon" | "overdue";

export type Animal = {
  id: number;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  age?: number;
  gender?: AnimalGender;
  healthStatus: AnimalHealthStatus;
  status: AnimalStatus;
  notes?: string;
  photoUrls: string[];
  createdAt: string;
  vaccinationStatus: AnimalVaccinationStatus;
};

export type AnimalFilters = {
  search?: string;
  species?: AnimalSpecies | "";
  healthStatus?: AnimalHealthStatus | "";
  status?: AnimalStatus | "";
  sort?: "newest" | "health" | "alphabetical" | "";
  page?: number;
  limit?: number;
};

export type AnimalCreateInput = Omit<Animal, "id" | "createdAt"> & {
  status?: AnimalStatus;
};

export type AnimalUpdateInput = Partial<Omit<Animal, "id" | "createdAt">>;

const allowedStatusTransitions: Record<AnimalStatus, AnimalStatus[]> = {
  rescued: ["admitted"],
  admitted: ["available"],
  available: ["adopted"],
  adopted: [],
};

export function isAllowedStatusTransition(currentStatus: AnimalStatus, nextStatus: AnimalStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  return allowedStatusTransitions[currentStatus].includes(nextStatus);
}

export function getAllowedNextStatuses(currentStatus: AnimalStatus) {
  return allowedStatusTransitions[currentStatus];
}
