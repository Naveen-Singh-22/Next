"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SiteNav from "@/components/SiteNav";

type AdoptCard = {
  name: string;
  breed: string;
  age: string;
  image: string;
  status: string;
  pair?: string;
};

const adoptCards: AdoptCard[] = [
  {
    name: "Murphy",
    breed: "Golden Retriever",
    age: "2 Years",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
  },
  {
    name: "Luna",
    breed: "Domestic Shorthair",
    age: "4 Years",
    status: "Foster Home",
    image: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
  },
  {
    name: "Scout & Jem",
    breed: "Border Collie Mix",
    age: "6 Months",
    status: "Active",
    pair: "Bonded Pair",
    image: "/images/unsplash/photo-1601758228041-f3b2795255f1.jpg",
  },
  {
    name: "Balthazar",
    breed: "Great Dane",
    age: "5 Years",
    status: "Ready",
    image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
  },
  {
    name: "Rio",
    breed: "Macaw",
    age: "12 Years",
    status: "Expert Required",
    image: "/images/unsplash/photo-1530281700549-e82e7bf110d6.jpg",
  },
  {
    name: "Oliver",
    breed: "Tabby Mix",
    age: "3 Months",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1552053831-71594a27632d.jpg",
  },
  {
    name: "Hazel",
    breed: "Labrador Mix",
    age: "1 Year",
    status: "Ready",
    image: "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
  },
  {
    name: "Milo",
    breed: "Indie Dog",
    age: "2 Years",
    status: "Foster Home",
    image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
  },
  {
    name: "Pepper",
    breed: "Domestic Shorthair",
    age: "8 Months",
    status: "Newly Rescued",
    image: "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
  },
  {
    name: "Koda",
    breed: "Husky Mix",
    age: "3 Years",
    status: "Active",
    image: "/images/unsplash/photo-1560250097-0b93528c311a.jpg",
  },
  {
    name: "Nori",
    breed: "Parakeet",
    age: "2 Years",
    status: "Expert Required",
    image: "/images/unsplash/photo-1623387641168-d9803ddd3f35.jpg",
  },
  {
    name: "Coco",
    breed: "Calico Cat",
    age: "1 Year",
    status: "Ready",
    image: "/images/unsplash/photo-1542204625-de293a38bda2.jpg",
  },
];

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 3;

export default function AdoptPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleCards = adoptCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < adoptCards.length;

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, adoptCards.length));
  };

  return (
    <div className="adopt-page">
      <SiteNav />

      <main className="section-wrap adopt-main">
        <section className="adopt-hero">
          <h1>
            Find Your New <span>Soulmate</span>
          </h1>
          <p>
            Our curated selection of rescues waiting for forever homes. Every
            animal here has completed health checks and behavior assessment.
          </p>
        </section>

        <section className="adopt-filters" aria-label="Adoption search filters">
          <label>
            Search
            <input type="text" placeholder="Name or Breed" />
          </label>
          <label>
            Species
            <select defaultValue="All Species">
              <option>All Species</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
            </select>
          </label>
          <label>
            Size
            <select defaultValue="All Sizes">
              <option>All Sizes</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </label>
          <label>
            Gender
            <select defaultValue="All Genders">
              <option>All Genders</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </label>
          <label>
            Age
            <select defaultValue="All Ages">
              <option>All Ages</option>
              <option>0-1 Years</option>
              <option>1-5 Years</option>
              <option>5+ Years</option>
            </select>
          </label>
        </section>

        <section className="adopt-grid" aria-label="Adoptable animals gallery">
          {visibleCards.map((item) => (
            <article key={item.name} className="adopt-card">
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
                  {item.breed} • {item.age}
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
            disabled={!hasMoreCards}
          >
            {hasMoreCards ? "Load More Rescues" : "All Rescues Loaded"}
          </button>
        </div>
      </main>

    </div>
  );
}

