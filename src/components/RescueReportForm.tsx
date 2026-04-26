"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngTuple } from "leaflet";
import RescueImageUpload from "@/components/RescueImageUpload";
import RescueLocationMap from "@/components/RescueLocationMap";

type SubmitState = "idle" | "success" | "error";
type Urgency = "critical" | "urgent" | "standard";

type RescueReportPayload = {
  fullName: string;
  email: string;
  phone: string;
  species: string;
  breed: string;
  healthConditions: string[];
  notes: string;
  lastSeenAddress: string;
  urgency: Urgency;
  location: {
    latitude: number;
    longitude: number;
  };
  animalImageDataUrl?: string;
};

type RescueApiResponse = {
  ok?: boolean;
  message?: string;
  reportId?: string;
};

const INDIA_CENTER: LatLngTuple = [22.7, 79.2];

const urgencyMeta: Array<{ key: Urgency; title: string; text: string }> = [
  { key: "critical", title: "Critical", text: "Life-threatening injury or immediate danger." },
  { key: "urgent", title: "Urgent", text: "Needs medical attention within 24 hours." },
  { key: "standard", title: "Standard", text: "Stable stray, needs routine rescue check." },
];

async function forwardGeocode(query: string): Promise<LatLngTuple | null> {
  const search = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    countrycodes: "in",
    q: query,
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${search.toString()}`);

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = results[0];

  if (!first) {
    return null;
  }

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
}

async function reverseGeocode(point: LatLngTuple): Promise<string | null> {
  const search = new URLSearchParams({
    format: "jsonv2",
    lat: String(point[0]),
    lon: String(point[1]),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${search.toString()}`);

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as { display_name?: string };
  return result.display_name ?? null;
}

export default function RescueReportForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [animalImageDataUrl, setAnimalImageDataUrl] = useState<string | null>(null);
  const [lastSeenAddress, setLastSeenAddress] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [marker, setMarker] = useState<LatLngTuple>(INDIA_CENTER);

  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const skipNextForwardRef = useRef(false);
  const forwardDebounceRef = useRef<number | null>(null);

  function toggleHealthCondition(value: string) {
    setHealthConditions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleMarkerChange(point: LatLngTuple) {
    setMarker(point);
    setIsResolvingAddress(true);

    try {
      const resolvedAddress = await reverseGeocode(point);
      if (resolvedAddress) {
        skipNextForwardRef.current = true;
        setLastSeenAddress(resolvedAddress);
      }
    } finally {
      setIsResolvingAddress(false);
    }
  }

  useEffect(() => {
    const query = lastSeenAddress.trim();

    if (skipNextForwardRef.current) {
      skipNextForwardRef.current = false;
      return;
    }

    if (query.length < 6) {
      return;
    }

    if (forwardDebounceRef.current) {
      window.clearTimeout(forwardDebounceRef.current);
    }

    forwardDebounceRef.current = window.setTimeout(async () => {
      const nextPoint = await forwardGeocode(query);
      if (nextPoint) {
        setMarker(nextPoint);
      }
    }, 700);

    return () => {
      if (forwardDebounceRef.current) {
        window.clearTimeout(forwardDebounceRef.current);
      }
    };
  }, [lastSeenAddress]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: RescueReportPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      species,
      breed: breed.trim(),
      healthConditions,
      notes: notes.trim(),
      lastSeenAddress: lastSeenAddress.trim(),
      urgency,
      location: {
        latitude: marker[0],
        longitude: marker[1],
      },
      animalImageDataUrl: animalImageDataUrl ?? undefined,
    };

    if (!payload.fullName || !payload.email || !payload.phone || !payload.lastSeenAddress) {
      setSubmitState("error");
      setSubmitMessage("Please fill all required fields: name, email, phone, and location.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState("idle");
      setSubmitMessage("");

      const response = await fetch("/api/rescue/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as RescueApiResponse;

      if (!response.ok || !result.ok) {
        setSubmitState("error");
        setSubmitMessage(result.message ?? "Unable to submit report. Please try again.");
        return;
      }

      setSubmitState("success");
      setSubmitMessage(result.message ?? "Rescue report submitted successfully.");
    } catch {
      setSubmitState("error");
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <section className="rescue-layout">
        <div className="rescue-left">
          <article className="panel reveal-item rescue-panel-anim">
            <h2>
              <span className="panel-dot">👤</span>
              Reporter Info
            </h2>
            <div className="field-stack">
              <label>
                Full Name
                <input
                  placeholder="Jane Doe"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <div className="field-grid">
                <label>
                  Email Address
                  <input
                    placeholder="jane@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
            </div>
          </article>

          <article className="panel reveal-item rescue-panel-anim">
            <h2>
              <span className="panel-dot">🐾</span>
              Animal Info
            </h2>
            <div className="field-grid">
              <label>
                Species
                <select value={species} onChange={(event) => setSpecies(event.target.value)}>
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Bird</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Breed (if known)
                <input
                  placeholder="e.g. Golden Retriever"
                  type="text"
                  value={breed}
                  onChange={(event) => setBreed(event.target.value)}
                />
              </label>
            </div>

            <p className="check-title">Health Condition</p>
            <div className="check-row">
              <label className="chip-check">
                <input
                  type="checkbox"
                  checked={healthConditions.includes("Injured")}
                  onChange={() => toggleHealthCondition("Injured")}
                />
                <span>Injured</span>
              </label>
              <label className="chip-check">
                <input
                  type="checkbox"
                  checked={healthConditions.includes("Malnourished")}
                  onChange={() => toggleHealthCondition("Malnourished")}
                />
                <span>Malnourished</span>
              </label>
              <label className="chip-check">
                <input
                  type="checkbox"
                  checked={healthConditions.includes("Healthy Stray")}
                  onChange={() => toggleHealthCondition("Healthy Stray")}
                />
                <span>Healthy Stray</span>
              </label>
            </div>

            <RescueImageUpload onImageChange={setAnimalImageDataUrl} />
          </article>

          <article className="panel reveal-item rescue-panel-anim">
            <h2>
              <span className="panel-dot notes">📝</span>
              Additional Notes
            </h2>
            <label>
              <textarea
                placeholder="Describe behavior, specific markings, or any hazards in the area..."
                rows={6}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </article>
        </div>

        <aside className="rescue-right">
          <article className="panel sticky reveal-item rescue-panel-anim">
            <h2>
              <span className="panel-dot">📍</span>
              Location
            </h2>
            <RescueLocationMap marker={marker} onMarkerChange={handleMarkerChange} />

            <label>
              Last Seen Address
              <input
                placeholder="Street, City, Landmarks..."
                type="text"
                value={lastSeenAddress}
                onChange={(event) => setLastSeenAddress(event.target.value)}
                required
              />
            </label>

            <p className="map-status" role="status" aria-live="polite">
              {isResolvingAddress
                ? "Resolving nearest address from selected pin..."
                : `Pinned at Lat ${marker[0].toFixed(5)}, Lng ${marker[1].toFixed(5)}`}
            </p>

            <p className="check-title">Urgency Level</p>
            <div className="urgency-list">
              {urgencyMeta.map((item) => (
                <label
                  key={item.key}
                  className={`urgency-item ${urgency === item.key ? "selected" : ""}`.trim()}
                >
                  <input
                    checked={urgency === item.key}
                    name="urgency"
                    type="radio"
                    onChange={() => setUrgency(item.key)}
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </div>
                </label>
              ))}
            </div>
          </article>

          <button className="submit-btn reveal-item" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting Report..." : "Submit Rescue Report"}
          </button>

          {submitMessage ? (
            <p
              className={`rescue-submit-status ${
                submitState === "success" ? "rescue-submit-status-success" : "rescue-submit-status-error"
              }`}
              role="status"
              aria-live="polite"
            >
              {submitMessage}
            </p>
          ) : null}

          <article className="panel post-note reveal-item rescue-panel-anim">
            <h3>Post-Submission</h3>
            <p>
              Upon submission, you will receive a unique Rescue Reference ID.
              This allows you to track response status and see medical updates.
            </p>
          </article>
        </aside>
      </section>
    </form>
  );
}
