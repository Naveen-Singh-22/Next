"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import { HealthBadge, StatusBadge, VaccinationBadge, formatEnumLabel } from "@/components/AnimalBadges";
import type { Animal } from "@/lib/animalInventoryTypes";

type AnimalResponse = {
  ok: boolean;
  animal?: Animal;
  message?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AnimalRecordClient() {
  const params = useParams<{ id: string }>();
  const animalId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animalId) {
      setError("Invalid animal record.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadAnimal() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/animals/${animalId}`, { cache: "no-store", signal: controller.signal });
        const payload = (await response.json().catch(() => null)) as AnimalResponse | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load animal record.");
        }

        setAnimal(payload?.animal ?? null);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load animal record.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnimal();

    return () => controller.abort();
  }, [animalId]);

  return (
    <div className="admin-page admin-mobile-shell inventory-page">
      <AdminSidebar activeHref="/admin/inventory" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="admin-main inventory-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              className="admin-menu-btn"
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open admin menu"
              aria-expanded={isSidebarOpen}
            >
              <span />
              <span />
              <span />
            </button>
            <Link href="/admin/inventory" className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
              Back to inventory
            </Link>
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Read-only animal record</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Animal Profile</h1>
            <p className="mt-2 text-sm text-slate-600">Full details from the inventory API.</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="h-[520px] animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-[520px] animate-pulse rounded-3xl bg-slate-100" />
            </div>
          ) : animal ? (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="overflow-hidden rounded-3xl bg-slate-100">
                  {animal.photoUrls.length ? (
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      {animal.photoUrls.map((photoUrl, index) => (
                        <img key={`${photoUrl}-${index}`} src={photoUrl} alt={`${animal.name} photo ${index + 1}`} className="h-72 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-700 to-slate-400 text-white">
                      <p className="text-lg font-semibold">No image available</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Animal {animal.animalCode}</p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-950">{animal.name}</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatEnumLabel(animal.species)} • {animal.breed || "Breed not recorded"}
                      </p>
                    </div>
                    <StatusBadge status={animal.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <HealthBadge healthStatus={animal.healthStatus} />
                    <VaccinationBadge vaccinationStatus={animal.vaccinationStatus} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Age</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{animal.age ?? "Not set"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gender</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{animal.gender ? formatEnumLabel(animal.gender) : "Not set"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Intake date</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{formatDate(animal.createdAt)}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                      {animal.notes || "No notes recorded for this animal."}
                    </p>
                  </div>
                </div>
              </section>

              <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Record actions</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Quick links</h3>
                </div>

                <Link
                  href={`/admin/vaccinations?animalId=${animal.id}`}
                  className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  View vaccination
                </Link>

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Status:</span> {formatEnumLabel(animal.status)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Health:</span> {formatEnumLabel(animal.healthStatus)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Vaccination:</span> {formatEnumLabel(animal.vaccinationStatus)}
                  </p>
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
