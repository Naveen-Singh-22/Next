import { notFound } from "next/navigation";
import AnimalProfileTemplate from "@/components/AnimalProfilePage";
import { listAnimals } from "@/lib/animalInventoryDb";
import { buildAdoptProfileFromInventory, animalToAdoptAnimal, inventoryAnimalIsAdoptable } from "@/lib/publicAdoptAnimals";

type AnimalProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AnimalProfileRoute({ params }: AnimalProfilePageProps) {
  const { slug } = await params;
  const { animals } = await listAnimals({ limit: 1000 });
  const matchedInventoryAnimal = animals
    .filter(inventoryAnimalIsAdoptable)
    .find((item) => animalToAdoptAnimal(item).slug === slug);

  const animal = matchedInventoryAnimal ? buildAdoptProfileFromInventory(matchedInventoryAnimal) : null;

  if (!animal) {
    notFound();
  }

  return <AnimalProfileTemplate animal={animal} />;
}
