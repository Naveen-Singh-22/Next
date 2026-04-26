"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";
import { animalToAdoptAnimal, inventoryAnimalIsAdoptable } from "@/lib/publicAdoptAnimals";
import type { Animal } from "@/lib/animalInventoryTypes";
import type { AdoptAnimal } from "@/lib/adoptAnimals";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 3;

export default function AdoptPage() {
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All Species");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [genderFilter, setGenderFilter] = useState("All Genders");
  const [ageFilter, setAgeFilter] = useState("All Ages");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [animals, setAnimals] = useState<AdoptAnimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnimals() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/animals?limit=500&sort=newest", {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => null)) as { animals?: unknown[]; message?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Failed to load adoptable animals.");
        }

        const nextAnimals = Array.isArray(payload?.animals)
          ? payload.animals
              .filter((item): item is Animal => {
                if (!item || typeof item !== "object") {
                  return false;
                }

                return "status" in (item as Record<string, unknown>);
              })
              .filter(inventoryAnimalIsAdoptable)
              .map(animalToAdoptAnimal)
          : [];

        setAnimals(nextAnimals);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load adoptable animals.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnimals();

    return () => controller.abort();
  }, []);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return animals.filter((card) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        card.name.toLowerCase().includes(normalizedQuery) ||
        card.breed.toLowerCase().includes(normalizedQuery);

      const matchesSpecies = speciesFilter === "All Species" || card.species === speciesFilter;
      const matchesSize = sizeFilter === "All Sizes" || card.size === sizeFilter;
      const matchesGender = genderFilter === "All Genders" || card.gender === genderFilter;

      const matchesAge =
        ageFilter === "All Ages" ||
        (ageFilter === "0-1 Years" && card.ageYears <= 1) ||
        (ageFilter === "1-5 Years" && card.ageYears > 1 && card.ageYears <= 5) ||
        (ageFilter === "5+ Years" && card.ageYears > 5);

      return matchesQuery && matchesSpecies && matchesSize && matchesGender && matchesAge;
    });
  }, [ageFilter, animals, genderFilter, query, sizeFilter, speciesFilter]);

  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < filteredCards.length;

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, filteredCards.length));
  };

  return (
    <div className="adopt-page">
      <SiteNav />

      <main className="section-wrap adopt-main">
        <ScrollReveal as="section" className="adopt-hero">
          <h1 className="reveal-item">
            Find Your New <span>Soulmate</span>
          </h1>
          <p className="reveal-item">
            Our curated selection of rescues waiting for forever homes. Every
            animal here has completed health checks and behavior assessment.
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="adopt-filters adopt-filters-dramatic"
          aria-label="Adoption search filters"
          delayMs={70}
        >
          <label>
            Search
            <input
              type="text"
              placeholder="Name or Breed"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
            />
          </label>
          <label>
            Species
            <select
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
            >
              <option>All Species</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
            </select>
          </label>
          <label>
            Size
            <select
              value={sizeFilter}
              onChange={(event) => {
                setSizeFilter(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
            >
              <option>All Sizes</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </label>
          <label>
            Gender
            <select
              value={genderFilter}
              onChange={(event) => {
                setGenderFilter(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
            >
              <option>All Genders</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </label>
          <label>
            Age
            <select
              value={ageFilter}
              onChange={(event) => {
                setAgeFilter(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
            >
              <option>All Ages</option>
              <option>0-1 Years</option>
              <option>1-5 Years</option>
              <option>5+ Years</option>
            </select>
          </label>
        </ScrollReveal>

        <section className="adopt-grid" aria-label="Adoptable animals gallery">
          {isLoading ? (
            <article className="adopt-empty-state" role="status" aria-live="polite">
              <h2>Loading animals...</h2>
              <p>We are syncing the latest inventory records into the adoption gallery.</p>
            </article>
          ) : error ? (
            <article className="adopt-empty-state" role="status" aria-live="polite">
              <h2>Unable to load adoptable animals.</h2>
              <p>{error}</p>
            </article>
          ) : visibleCards.length === 0 ? (
            <article className="adopt-empty-state" role="status" aria-live="polite">
              <h2>No matching rescues found.</h2>
              <p>Try changing one or more filters to discover more animals.</p>
            </article>
          ) : null}

          {visibleCards.map((item, index) => (
            <article
              key={item.slug}
              className="adopt-card adopt-card-dramatic"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="adopt-image">
                <Image
                  className="adopt-photo"
                  src={item.image}
                  alt={`${item.name} photo`}
                  fill
                  sizes="(max-width: 920px) 100vw, 33vw"
                />
                <div className="adopt-chip-row">
                  {item.pair ? <span className="adopt-chip pair">{item.pair}</span> : null}
                  <span className="adopt-chip">{item.status}</span>
                </div>
              </div>
              <div className="adopt-body">
                <div className="adopt-title-row">
                  <h2>{item.name}</h2>
                  <span aria-hidden="true">♥</span>
                </div>
                <p className="adopt-breed">
                  {item.breed} • {item.age} • {item.gender}
                </p>
                <Link href={`/adopt/${item.slug}`} className="adopt-btn">
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </section>

        <div className="adopt-load-wrap">
          <button
            type="button"
            className="adopt-load-btn"
            onClick={handleLoadMore}
            disabled={!hasMoreCards || filteredCards.length === 0}
          >
            {hasMoreCards ? "Load More Rescues" : "All Rescues Loaded"}
          </button>
        </div>
      </main>

    </div>
  );
}

