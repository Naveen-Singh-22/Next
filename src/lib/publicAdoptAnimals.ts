import { adoptAnimals } from "@/lib/adoptAnimals";
import type { AdoptAnimal } from "@/lib/adoptAnimals";
import type { Animal } from "@/lib/animalInventoryTypes";

const fallbackImages: Record<Animal["species"], string> = {
  dog: "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
  cat: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
  bird: "/images/unsplash/photo-1530281700549-e82e7bf110d6.jpg",
};

const temperamentBySpecies: Record<Animal["species"], string[]> = {
  dog: ["Friendly", "Trainable", "Active"],
  cat: ["Calm", "Curious", "Affectionate"],
  bird: ["Vocal", "Intelligent", "Curious"],
};

const goodWithBySpecies: Record<Animal["species"], string> = {
  dog: "families, walkers, and structured homes",
  cat: "quiet homes and patient adopters",
  bird: "bird-experienced homes",
};

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ageToDisplay(age?: number) {
  if (typeof age !== "number" || Number.isNaN(age)) {
    return "Age unknown";
  }

  if (age < 1) {
    const months = Math.max(1, Math.round(age * 12));
    return `${months} Month${months === 1 ? "" : "s"}`;
  }

  const wholeYears = Math.floor(age);
  const hasFraction = age !== wholeYears;

  if (!hasFraction) {
    return `${wholeYears} Year${wholeYears === 1 ? "" : "s"}`;
  }

  return `${age.toFixed(1)} Years`;
}

function inferSize(animal: Animal) {
  if (animal.species === "bird") {
    return "Small";
  }

  if (animal.species === "cat") {
    return "Small";
  }

  const breed = `${animal.breed ?? ""} ${animal.name}`.toLowerCase();

  if (/dane|shepherd|retriever|husky|labrador|mastiff|rottweiler/.test(breed)) {
    return "Large";
  }

  if (/mix|indie|beagle|collie/.test(breed)) {
    return "Medium";
  }

  return "Medium";
}

function inferGoodWith(animal: Animal) {
  return goodWithBySpecies[animal.species];
}

function inferNeutered(animal: Animal) {
  return animal.status === "available" || animal.status === "adopted";
}

function inferTemperament(animal: Animal) {
  const traits = temperamentBySpecies[animal.species];

  if (animal.healthStatus === "critical") {
    return ["Gentle", ...traits].slice(0, 3);
  }

  if (animal.healthStatus === "recovering") {
    return ["Calm", ...traits].slice(0, 3);
  }

  return traits.slice(0, 3);
}

function splitNotes(notes?: string) {
  const value = notes?.trim();

  if (!value) {
    return {
      profileSummary: "This animal is waiting for the right home and can be matched through the shelter team.",
      rescueStory: "More rescue details will be shared by the shelter team as the record is updated.",
    };
  }

  const parts = value.split(/(?<=[.!?])\s+/).filter(Boolean);

  return {
    profileSummary: parts[0] ?? value,
    rescueStory: parts.slice(1).join(" ") || value,
  };
}

export function makeAnimalSlug(animal: Pick<Animal, "id" | "name">) {
  return `${animal.name}-${animal.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function animalToAdoptAnimal(animal: Animal): AdoptAnimal {
  const notes = splitNotes(animal.notes);

  return {
    slug: makeAnimalSlug(animal),
    name: animal.name,
    breed: animal.breed ?? "Mixed Breed",
    age: ageToDisplay(animal.age),
    ageYears: typeof animal.age === "number" ? animal.age : 0,
    species: animal.species === "dog" ? "Dog" : animal.species === "cat" ? "Cat" : "Bird",
    size: inferSize(animal),
    gender: animal.gender === "female" ? "Female" : "Male",
    status: titleCase(animal.status),
    pair: undefined,
    image: animal.photoUrls[0] ?? fallbackImages[animal.species],
    city: "Shelter Intake",
    temperament: inferTemperament(animal),
    vaccinated: animal.vaccinationStatus === "up_to_date",
    neutered: inferNeutered(animal),
    goodWith: inferGoodWith(animal),
    profileSummary: notes.profileSummary,
    rescueStory: notes.rescueStory,
  };
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function findCatalogAnimalByInventoryAnimal(animal: Animal) {
  const normalizedName = normalizeName(animal.name);

  const exactNameMatch = adoptAnimals.find((catalogAnimal) => normalizeName(catalogAnimal.name) === normalizedName);
  if (exactNameMatch) {
    return exactNameMatch;
  }

  const normalizedBreed = normalizeName(animal.breed ?? "");
  return adoptAnimals.find((catalogAnimal) => {
    if (normalizedBreed.length === 0) {
      return false;
    }

    return normalizeName(catalogAnimal.breed) === normalizedBreed;
  });
}

export function buildAdoptProfileFromInventory(animal: Animal): AdoptAnimal {
  const mappedAnimal = animalToAdoptAnimal(animal);
  const catalogAnimal = findCatalogAnimalByInventoryAnimal(animal);

  if (!catalogAnimal) {
    return mappedAnimal;
  }

  return {
    ...catalogAnimal,
    slug: mappedAnimal.slug,
    name: mappedAnimal.name,
    breed: mappedAnimal.breed,
    age: mappedAnimal.age,
    ageYears: mappedAnimal.ageYears,
    species: mappedAnimal.species,
    size: mappedAnimal.size,
    gender: mappedAnimal.gender,
    city: mappedAnimal.city,
    status: mappedAnimal.status,
    image: mappedAnimal.image,
  };
}

export function inventoryAnimalIsAdoptable(animal: Animal) {
  return animal.status !== "adopted";
}
