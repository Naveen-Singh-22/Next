import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { adoptAnimals } from "@/lib/adoptAnimals";
import { isAllowedStatusTransition } from "@/lib/animalInventoryTypes";
import type {
  Animal,
  AnimalCreateInput,
  AnimalFilters,
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalUpdateInput,
  AnimalVaccinationStatus,
} from "@/lib/animalInventoryTypes";

type AnimalDbSchema = {
  animals: Animal[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "animals.json");

let dbPromise: Promise<Low<AnimalDbSchema>> | null = null;

const healthSortOrder: Record<AnimalHealthStatus, number> = {
  critical: 0,
  injured: 1,
  recovering: 2,
  healthy: 3,
};

function mapSpecies(species: string): AnimalSpecies {
  const value = species.toLowerCase();

  if (value === "cat") {
    return "cat";
  }

  if (value === "bird") {
    return "bird";
  }

  return "dog";
}

function mapGender(gender: string): AnimalGender {
  return gender.toLowerCase() === "female" ? "female" : "male";
}

function inferStatus(adoptStatus: string): AnimalStatus {
  const value = adoptStatus.toLowerCase();

  if (value.includes("adopted")) {
    return "adopted";
  }

  if (value.includes("newly rescued") || value.includes("rescued")) {
    return "rescued";
  }

  if (value.includes("foster")) {
    return "admitted";
  }

  if (value.includes("ready") || value.includes("active") || value.includes("expert")) {
    return "available";
  }

  return "admitted";
}

function inferHealthStatus(adoptStatus: string, rescueStory: string): AnimalHealthStatus {
  const statusValue = adoptStatus.toLowerCase();
  const storyValue = rescueStory.toLowerCase();

  if (storyValue.includes("critical") || storyValue.includes("severe")) {
    return "critical";
  }

  if (storyValue.includes("injur") || storyValue.includes("accident") || storyValue.includes("treatment")) {
    if (storyValue.includes("recovered") || storyValue.includes("recovery") || storyValue.includes("rehab")) {
      return "recovering";
    }

    return "injured";
  }

  if (statusValue.includes("newly rescued")) {
    return "recovering";
  }

  return "healthy";
}

function inferVaccinationStatus(vaccinated: boolean): AnimalVaccinationStatus {
  return vaccinated ? "up_to_date" : "due_soon";
}

function buildSeedAnimals() {
  const now = Date.now();

  return adoptAnimals.map((animal, index) => {
    const createdAt = new Date(now - index * 86400000).toISOString();

    return {
      id: index + 1,
      name: animal.name,
      species: mapSpecies(animal.species),
      breed: animal.breed,
      age: Number.isFinite(animal.ageYears) ? Math.max(0, Math.round(animal.ageYears * 10) / 10) : undefined,
      gender: mapGender(animal.gender),
      healthStatus: inferHealthStatus(animal.status, animal.rescueStory),
      status: inferStatus(animal.status),
      notes: `${animal.profileSummary} ${animal.rescueStory}`.trim(),
      photoUrls: animal.image ? [animal.image] : [],
      createdAt,
      vaccinationStatus: inferVaccinationStatus(animal.vaccinated),
    } satisfies Animal;
  });
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<AnimalDbSchema>(DB_PATH);
      const db = new Low<AnimalDbSchema>(adapter, { animals: [] });

      try {
        await db.read();
      } catch {
        db.data = { animals: [] };
        await db.write();
      }

      db.data ||= { animals: [] };

      if (db.data.animals.length === 0) {
        db.data.animals = buildSeedAnimals();
        await db.write();
      }

      return db;
    })();
  }

  return dbPromise;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function createSearchBlob(animal: Animal) {
  return [animal.name, animal.breed ?? "", animal.notes ?? "", animal.species, animal.status, animal.healthStatus]
    .join(" ")
    .toLowerCase();
}

function getNextId(animals: Animal[]) {
  return animals.reduce((highestId, animal) => Math.max(highestId, animal.id), 0) + 1;
}

function sortAnimals(animals: Animal[], sort: AnimalFilters["sort"]) {
  const items = [...animals];

  switch (sort) {
    case "health":
      return items.sort((left, right) => {
        const difference = healthSortOrder[left.healthStatus] - healthSortOrder[right.healthStatus];
        return difference !== 0 ? difference : left.name.localeCompare(right.name);
      });
    case "alphabetical":
      return items.sort((left, right) => left.name.localeCompare(right.name));
    case "newest":
    default:
      return items.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }
}

export function getAllowedNextStatuses(currentStatus: AnimalStatus) {
  if (currentStatus === "rescued") {
    return ["admitted"];
  }

  if (currentStatus === "admitted") {
    return ["available"];
  }

  if (currentStatus === "available") {
    return ["adopted"];
  }

  return [];
}

export async function listAnimals(filters: AnimalFilters = {}) {
  const db = await getDb();
  await db.read();

  const animals = db.data.animals.filter((animal) => {
    if (filters.search && !createSearchBlob(animal).includes(normalizeText(filters.search))) {
      return false;
    }

    if (filters.species && animal.species !== filters.species) {
      return false;
    }

    if (filters.healthStatus && animal.healthStatus !== filters.healthStatus) {
      return false;
    }

    if (filters.status && animal.status !== filters.status) {
      return false;
    }

    return true;
  });

  const sorted = sortAnimals(animals, filters.sort);
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 12);
  const total = sorted.length;
  const startIndex = (page - 1) * limit;

  return {
    animals: sorted.slice(startIndex, startIndex + limit),
    total,
    page,
    limit,
  };
}

export async function getAnimalById(id: number) {
  const db = await getDb();
  await db.read();

  return db.data.animals.find((animal) => animal.id === id) ?? null;
}

export async function createAnimal(input: AnimalCreateInput) {
  const db = await getDb();
  await db.read();

  const animal: Animal = {
    id: getNextId(db.data.animals),
    name: input.name.trim(),
    species: input.species,
    breed: input.breed?.trim() || undefined,
    age: input.age,
    gender: input.gender,
    healthStatus: input.healthStatus,
    status: input.status ?? "admitted",
    notes: input.notes?.trim() || undefined,
    photoUrls: input.photoUrls.filter(Boolean),
    createdAt: new Date().toISOString(),
    vaccinationStatus: input.vaccinationStatus,
  };

  db.data.animals.unshift(animal);
  await db.write();

  return animal;
}

export async function updateAnimal(id: number, updates: AnimalUpdateInput) {
  const db = await getDb();
  await db.read();

  const animal = db.data.animals.find((item) => item.id === id);

  if (!animal) {
    return null;
  }

  if (updates.status && !isAllowedStatusTransition(animal.status, updates.status)) {
    throw new Error(`Invalid status transition from ${animal.status} to ${updates.status}.`);
  }

  if (updates.name !== undefined) {
    animal.name = updates.name.trim();
  }

  if (updates.species) {
    animal.species = updates.species;
  }

  if (updates.breed !== undefined) {
    animal.breed = updates.breed.trim() || undefined;
  }

  if (updates.age !== undefined) {
    animal.age = updates.age;
  }

  if (updates.gender !== undefined) {
    animal.gender = updates.gender;
  }

  if (updates.healthStatus) {
    animal.healthStatus = updates.healthStatus;
  }

  if (updates.status) {
    animal.status = updates.status;
  }

  if (updates.notes !== undefined) {
    animal.notes = updates.notes.trim() || undefined;
  }

  if (updates.photoUrls) {
    animal.photoUrls = updates.photoUrls.filter(Boolean);
  }

  if (updates.vaccinationStatus) {
    animal.vaccinationStatus = updates.vaccinationStatus;
  }

  await db.write();

  return animal;
}

export async function deleteAnimal(id: number) {
  const db = await getDb();
  await db.read();

  const index = db.data.animals.findIndex((animal) => animal.id === id);

  if (index === -1) {
    return false;
  }

  db.data.animals.splice(index, 1);
  await db.write();

  return true;
}
