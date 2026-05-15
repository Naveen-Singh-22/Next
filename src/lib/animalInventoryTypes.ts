export type AnimalSpecies = "dog" | "cat" | "bird";
export type AnimalGender = "male" | "female";
export type AnimalHealthStatus = "healthy" | "injured" | "recovering" | "critical";
export type AnimalStatus = "rescued" | "admitted" | "available" | "adopted";
export type AnimalVaccinationState = "up-to-date" | "due_soon" | "overdue";

export type Animal = {
  id: string; // External slug (e.g., "buddy-dog")
  intId?: number | null; // Internal integer ID for relationships
  animalCode: string;
  name: string;
  species: AnimalSpecies;
  breed?: string | null;
  age?: number | null;
  gender?: AnimalGender | null;
  healthStatus: AnimalHealthStatus;
  status: AnimalStatus;
  notes?: string | null;
  photoUrls: string[];
  createdAt: string;
  vaccinationState: AnimalVaccinationState;
  adopted: boolean;
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

export type AnimalCreateInput = Omit<Animal, "id" | "intId" | "createdAt" | "adopted"> & {
  animalCode?: string;
  status?: AnimalStatus;
};

export type AnimalUpdateInput = Partial<Omit<Animal, "id" | "intId" | "animalCode" | "createdAt">>;

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
