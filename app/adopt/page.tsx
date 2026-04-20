import Link from "next/link";
import SiteNav from "../components/SiteNav";

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
    image: "/adopt/murphy.svg",
  },
  {
    name: "Luna",
    breed: "Domestic Shorthair",
    age: "4 Years",
    status: "Foster Home",
    image: "/adopt/luna.svg",
  },
  {
    name: "Scout & Jem",
    breed: "Border Collie Mix",
    age: "6 Months",
    status: "Active",
    pair: "Bonded Pair",
    image: "/adopt/scout-jem.svg",
  },
  {
    name: "Balthazar",
    breed: "Great Dane",
    age: "5 Years",
    status: "Ready",
    image: "/adopt/balthazar.svg",
  },
  {
    name: "Rio",
    breed: "Macaw",
    age: "12 Years",
    status: "Expert Required",
    image: "/adopt/rio.svg",
  },
  {
    name: "Oliver",
    breed: "Tabby Mix",
    age: "3 Months",
    status: "Newly Rescued",
    image: "/adopt/oliver.svg",
  },
];

export default function AdoptPage() {
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
          {adoptCards.map((item) => (
            <article key={item.name} className="adopt-card">
              <div className="adopt-image">
                <img className="adopt-photo" src={item.image} alt={`${item.name} photo`} loading="lazy" />
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
          <button type="button" className="adopt-load-btn">
            Load More Rescues
          </button>
        </div>
      </main>

      <footer className="footer section-wrap">
        <div>
          <p className="brand">thecaninehelp</p>
          <p>Dedicated to finding permanent, loving homes for every rescued soul.</p>
        </div>
        <div className="footer-links">
          <a href="#">Contact Us</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Adoption Fees</a>
        </div>
      </footer>
    </div>
  );
}
