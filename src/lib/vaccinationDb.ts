import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { listAnimals, updateAnimal } from "@/lib/animalInventoryDb";
import type { Animal } from "@/lib/animalInventoryTypes";
import { getVaccinationStatus } from "@/lib/vaccinationTypes";
import type {
  Vaccination,
  VaccinationCreateInput,
  VaccinationUpdateInput,
} from "@/lib/vaccinationTypes";

type VaccinationDbSchema = {
  vaccinations: Vaccination[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "vaccinations.json");

let dbPromise: Promise<Low<VaccinationDbSchema>> | null = null;

function getNextId(vaccinations: Vaccination[]) {
  return vaccinations.reduce((highestId, vaccination) => Math.max(highestId, vaccination.id), 0) + 1;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function speciesDefaultVaccine(animal: Animal) {
  if (animal.species === "cat") {
    return "FVRCP Combination";
  }

  if (animal.species === "bird") {
    return "Avian Wellness Booster";
  }

  return "Rabies Booster";
}

function speciesDefaultDose(animal: Animal) {
  if (animal.species === "bird") {
    return "Annual Booster";
  }

  return animal.status === "rescued" ? "Primary Course" : "Booster";
}

function buildSeedVaccinations(animals: Animal[]) {
  const today = new Date();

  return animals.slice(0, 24).map((animal, index) => {
    const dateGiven = addDays(today, -(index * 11 + 3));
    const dueOffset = index % 5 === 0 ? -4 : index % 4 === 0 ? 0 : 10 + index;

    return {
      id: index + 1,
      animalId: animal.id,
      animalName: animal.name,
      vaccineName: speciesDefaultVaccine(animal),
      dose: speciesDefaultDose(animal),
      dateGiven: toIsoDate(dateGiven),
      nextDueDate: toIsoDate(addDays(dateGiven, dueOffset)),
      notes: `Auto-seeded from the current inventory record for ${animal.name}.`,
    } satisfies Vaccination;
  });
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<VaccinationDbSchema>(DB_PATH);
      const db = new Low<VaccinationDbSchema>(adapter, { vaccinations: [] });

      try {
        await db.read();
      } catch {
        db.data = { vaccinations: [] };
        await db.write();
      }

      db.data ||= { vaccinations: [] };

      if (db.data.vaccinations.length === 0) {
        const { animals } = await listAnimals({ limit: 1000 });
        db.data.vaccinations = buildSeedVaccinations(animals);
        await db.write();
      }

      return db;
    })();
  }

  return dbPromise;
}

async function syncAnimalVaccinationStatus(animalId: number) {
  const vaccinations = await listVaccinationsForAnimal(animalId);

  if (vaccinations.length === 0) {
    return;
  }

  const latestRecord = [...vaccinations].sort(
    (left, right) => new Date(right.nextDueDate).getTime() - new Date(left.nextDueDate).getTime(),
  )[0];

  const computedStatus = getVaccinationStatus(latestRecord.nextDueDate);
  const vaccinationStatus = computedStatus === "overdue"
    ? "overdue"
    : computedStatus === "today" || computedStatus === "upcoming"
      ? "due_soon"
      : "up_to_date";

  const dbAnimals = await listAnimals({ limit: 1000 });
  const animal = dbAnimals.animals.find((entry) => entry.id === animalId);

  if (animal) {
    await updateAnimal(animalId, { vaccinationStatus });
  }
}

export async function listVaccinations() {
  const db = await getDb();
  await db.read();
  return db.data.vaccinations;
}

export async function listVaccinationsForAnimal(animalId: number) {
  const vaccinations = await listVaccinations();
  return vaccinations.filter((vaccination) => vaccination.animalId === animalId);
}

export async function createVaccination(input: VaccinationCreateInput) {
  const db = await getDb();
  await db.read();

  const vaccination: Vaccination = {
    id: getNextId(db.data.vaccinations),
    animalId: input.animalId,
    animalName: input.animalName.trim(),
    vaccineName: input.vaccineName.trim(),
    dose: input.dose.trim(),
    dateGiven: input.dateGiven,
    nextDueDate: input.nextDueDate,
    notes: input.notes?.trim() || undefined,
  };

  db.data.vaccinations.unshift(vaccination);
  await db.write();
  await syncAnimalVaccinationStatus(vaccination.animalId);

  return vaccination;
}

export async function bulkCreateVaccinations(inputs: VaccinationCreateInput[]) {
  const created: Vaccination[] = [];

  for (const input of inputs) {
    created.push(await createVaccination(input));
  }

  return created;
}

export async function updateVaccination(id: number, updates: VaccinationUpdateInput) {
  const db = await getDb();
  await db.read();

  const vaccination = db.data.vaccinations.find((item) => item.id === id);

  if (!vaccination) {
    return null;
  }

  if (updates.vaccineName !== undefined) {
    vaccination.vaccineName = updates.vaccineName.trim();
  }

  if (updates.dose !== undefined) {
    vaccination.dose = updates.dose.trim();
  }

  if (updates.dateGiven !== undefined) {
    vaccination.dateGiven = updates.dateGiven;
  }

  if (updates.nextDueDate !== undefined) {
    vaccination.nextDueDate = updates.nextDueDate;
  }

  if (updates.notes !== undefined) {
    vaccination.notes = updates.notes.trim() || undefined;
  }

  await db.write();
  await syncAnimalVaccinationStatus(vaccination.animalId);

  return vaccination;
}

export async function deleteVaccination(id: number) {
  const db = await getDb();
  await db.read();

  const index = db.data.vaccinations.findIndex((vaccination) => vaccination.id === id);

  if (index === -1) {
    return null;
  }

  const removed = db.data.vaccinations[index];
  db.data.vaccinations.splice(index, 1);
  await db.write();
  await syncAnimalVaccinationStatus(removed.animalId);

  return removed;
}
