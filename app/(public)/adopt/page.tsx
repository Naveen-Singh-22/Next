"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";

type AdoptCard = {
  name: string;
  breed: string;
  age: string;
  ageYears: number;
  species: "Dog" | "Cat" | "Bird";
  size: "Small" | "Medium" | "Large";
  gender: "Female" | "Male";
  image: string;
  status: string;
  pair?: string;
};

const adoptCards: AdoptCard[] = [
  {
    name: "Murphy",
    breed: "Golden Retriever",
    age: "2 Years",
    ageYears: 2,
    species: "Dog",
    size: "Large",
    gender: "Male",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
  },
  {
    name: "Luna",
    breed: "Domestic Shorthair",
    age: "4 Years",
    ageYears: 4,
    species: "Cat",
    size: "Small",
    gender: "Female",
    status: "Foster Home",
    image: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
  },
  {
    name: "Scout & Jem",
    breed: "Border Collie Mix",
    age: "6 Months",
    ageYears: 0.5,
    species: "Dog",
    size: "Medium",
    gender: "Male",
    status: "Active",
    pair: "Bonded Pair",
    image: "/images/unsplash/photo-1601758228041-f3b2795255f1.jpg",
  },
  {
    name: "Balthazar",
    breed: "Great Dane",
    age: "5 Years",
    ageYears: 5,
    species: "Dog",
    size: "Large",
    gender: "Male",
    status: "Ready",
    image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
  },
  {
    name: "Rio",
    breed: "Macaw",
    age: "12 Years",
    ageYears: 12,
    species: "Bird",
    size: "Large",
    gender: "Male",
    status: "Expert Required",
    image: "/images/unsplash/photo-1530281700549-e82e7bf110d6.jpg",
  },
  {
    name: "Oliver",
    breed: "Tabby Mix",
    age: "3 Months",
    ageYears: 0.25,
    species: "Cat",
    size: "Small",
    gender: "Male",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1552053831-71594a27632d.jpg",
  },
  {
    name: "Hazel",
    breed: "Labrador Mix",
    age: "1 Year",
    ageYears: 1,
    species: "Dog",
    size: "Large",
    gender: "Female",
    status: "Ready",
    image: "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
  },
  {
    name: "Milo",
    breed: "Indie Dog",
    age: "2 Years",
    ageYears: 2,
    species: "Dog",
    size: "Medium",
    gender: "Male",
    status: "Foster Home",
    image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
  },
  {
    name: "Pepper",
    breed: "Domestic Shorthair",
    age: "8 Months",
    ageYears: 0.67,
    species: "Cat",
    size: "Small",
    gender: "Female",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
  },
  {
    name: "Koda",
    breed: "Husky Mix",
    age: "3 Years",
    ageYears: 3,
    species: "Dog",
    size: "Large",
    gender: "Male",
    status: "Active",
    image: "/images/unsplash/photo-1560250097-0b93528c311a.jpg",
  },
  {
    name: "Nori",
    breed: "Parakeet",
    age: "2 Years",
    ageYears: 2,
    species: "Bird",
    size: "Small",
    gender: "Female",
    status: "Expert Required",
    image: "/images/unsplash/photo-1623387641168-d9803ddd3f35.jpg",
  },
  {
    name: "Coco",
    breed: "Calico Cat",
    age: "1 Year",
    ageYears: 1,
    species: "Cat",
    size: "Small",
    gender: "Female",
    status: "Ready",
    image: "/images/unsplash/photo-1542204625-de293a38bda2.jpg",
  },
];

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 3;

export default function AdoptPage() {
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All Species");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [genderFilter, setGenderFilter] = useState("All Genders");
  const [ageFilter, setAgeFilter] = useState("All Ages");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return adoptCards.filter((card) => {
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
  }, [ageFilter, genderFilter, query, sizeFilter, speciesFilter]);

  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < filteredCards.length;

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, adoptCards.length));
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
          {visibleCards.length === 0 ? (
            <article className="adopt-empty-state" role="status" aria-live="polite">
              <h2>No matching rescues found.</h2>
              <p>Try changing one or more filters to discover more animals.</p>
            </article>
          ) : null}

          {visibleCards.map((item, index) => (
            <article
              key={item.name}
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
                <Link href="/rescue" className="adopt-btn">
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

