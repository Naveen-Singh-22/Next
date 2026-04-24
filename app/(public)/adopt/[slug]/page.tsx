import { notFound } from "next/navigation";
import AnimalProfileTemplate from "@/components/AnimalProfilePage";
import { adoptAnimals, findAnimalBySlug } from "@/lib/adoptAnimals";

type AnimalProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return adoptAnimals.map((animal) => ({ slug: animal.slug }));
}

export default async function AnimalProfileRoute({ params }: AnimalProfilePageProps) {
  const { slug } = await params;
  const animal = findAnimalBySlug(slug);

  if (!animal) {
    notFound();
  }

  return <AnimalProfileTemplate animal={animal} />;
}
