"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import AnimalImageUploader from "@/components/AnimalImageUploader";
import {
  ANIMAL_GENDER_OPTIONS,
  ANIMAL_HEALTH_OPTIONS,
  ANIMAL_SPECIES_OPTIONS,
  ANIMAL_STATUS_OPTIONS,
  ANIMAL_VACCINATION_OPTIONS,
  HealthBadge,
  StatusBadge,
  VaccinationBadge,
  formatEnumLabel,
} from "@/components/AnimalBadges";
import { getAllowedNextStatuses } from "@/lib/animalInventoryTypes";
import type {
  Animal,
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalVaccinationStatus,
} from "@/lib/animalInventoryTypes";

type AnimalListResponse = {
  animals: Animal[];
  total: number;
  page: number;
  limit: number;
};

type AnimalFormState = {
  name: string;
  species: AnimalSpecies;
  breed: string;
  age: string;
  gender: AnimalGender;
  healthStatus: AnimalHealthStatus;
  status: AnimalStatus;
  notes: string;
  photoUrls: string[];
  vaccinationStatus: AnimalVaccinationStatus;
};

const PAGE_SIZE = 12;

const statusLabels: Record<AnimalStatus, string> = {
  rescued: "Rescued",
  admitted: "Admitted",
  available: "Available",
  adopted: "Adopted",
};

function createEmptyFormState(): AnimalFormState {
  return {
    name: "",
    species: "dog",
    breed: "",
    age: "",
    gender: "male",
    healthStatus: "healthy",
    status: "admitted",
    notes: "",
    photoUrls: [],
    vaccinationStatus: "up_to_date",
  };
}

function buildFormState(animal: Animal | null): AnimalFormState {
  if (!animal) {
    return createEmptyFormState();
  }

  return {
    name: animal.name,
    species: animal.species,
    breed: animal.breed ?? "",
    age: typeof animal.age === "number" ? String(animal.age) : "",
    gender: animal.gender ?? "male",
    healthStatus: animal.healthStatus,
    status: animal.status,
    notes: animal.notes ?? "",
    photoUrls: animal.photoUrls,
    vaccinationStatus: animal.vaccinationStatus,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildQueryParams({
  search,
  species,
  healthStatus,
  status,
  sort,
  page,
}: {
  search: string;
  species: AnimalSpecies | "";
  healthStatus: AnimalHealthStatus | "";
  status: AnimalStatus | "";
  sort: "newest" | "health" | "alphabetical";
  page: number;
}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (species) params.set("species", species);
  if (healthStatus) params.set("healthStatus", healthStatus);
  if (status) params.set("status", status);
  params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  return params;
}

function getStatusOptions(currentStatus?: AnimalStatus) {
  if (!currentStatus) {
    return ANIMAL_STATUS_OPTIONS;
  }

  const options = [currentStatus, ...getAllowedNextStatuses(currentStatus)] as AnimalStatus[];
  const seen = new Set<AnimalStatus>();

  return options
    .filter((status) => {
      if (seen.has(status)) {
        return false;
      }

      seen.add(status);
      return true;
    })
    .map((status) => ({ value: status, label: statusLabels[status] }));
}

function AnimalCard({
  animal,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (animal: Animal) => void;
  onStatusChange: (animal: Animal, status: AnimalStatus) => void;
}) {
  const statusOptions = getStatusOptions(animal.status);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="relative h-56 bg-slate-100">
        {animal.photoUrls[0] ? (
          <img src={animal.photoUrls[0]} alt={animal.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-700 to-slate-400 text-white">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">No image</p>
              <p className="mt-2 text-2xl font-semibold">{animal.name}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            {animal.animalCode}
          </span>
          <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            {formatEnumLabel(animal.species)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{animal.name}</h2>
              <p className="text-sm text-slate-500">Intake: {formatDate(animal.createdAt)}</p>
            </div>
            <StatusBadge status={animal.status} />
          </div>
          <p className="text-sm text-slate-600">
            {[animal.breed, animal.age ? `${animal.age} yr${animal.age === 1 ? "" : "s"}` : null]
              .filter(Boolean)
              .join(" • ") || "Breed and age unavailable"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <HealthBadge healthStatus={animal.healthStatus} />
          <VaccinationBadge vaccinationStatus={animal.vaccinationStatus} />
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{animal.notes || "No notes recorded yet."}</p>

        <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status workflow</label>
          <select
            value={animal.status}
            onChange={(event) => onStatusChange(animal, event.target.value as AnimalStatus)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onEdit(animal)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(animal)}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
          <Link
            href={`/admin/animals/${animal.id}`}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-white transition hover:bg-slate-700"
          >
            View record
          </Link>
          <Link
            href={`/admin/vaccinations?animalId=${animal.id}`}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-white transition hover:bg-emerald-500"
          >
            View vaccination
          </Link>
        </div>
      </div>
    </article>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Animal inventory</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export default function AnimalInventoryClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<AnimalSpecies | "">("");
  const [healthFilter, setHealthFilter] = useState<AnimalHealthStatus | "">("");
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | "">("");
  const [sort, setSort] = useState<"newest" | "health" | "alphabetical">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formState, setFormState] = useState<AnimalFormState>(createEmptyFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  async function loadAnimals(requestPage = page, signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/animals?${buildQueryParams({
          search,
          species: speciesFilter,
          healthStatus: healthFilter,
          status: statusFilter,
          sort,
          page: requestPage,
        }).toString()}`,
        {
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Failed to load animals.");
      }

      const payload = (await response.json()) as AnimalListResponse;
      setAnimals(Array.isArray(payload.animals) ? payload.animals : []);
      setTotal(typeof payload.total === "number" ? payload.total : 0);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "Failed to load animals.");
    } finally {
      if (!(signal?.aborted ?? false)) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadAnimals(page, controller.signal);

    return () => controller.abort();
  }, [search, speciesFilter, healthFilter, statusFilter, sort, page]);

  const pageSummary = useMemo(
    () => ({
      loaded: animals.length,
      current: page,
      totalPages,
      total,
    }),
    [animals.length, page, totalPages, total],
  );

  function openCreateModal() {
    setEditingAnimal(null);
    setFormState(createEmptyFormState());
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditModal(animal: Animal) {
    setEditingAnimal(animal);
    setFormState(buildFormState(animal));
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setIsFormOpen(false);
    setEditingAnimal(null);
    setFormError(null);
    setIsSubmitting(false);
  }

  function updateFormField<Key extends keyof AnimalFormState>(key: Key, value: AnimalFormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function submitAnimal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: formState.name.trim(),
      species: formState.species,
      breed: formState.breed.trim() || undefined,
      age: formState.age ? Number(formState.age) : undefined,
      gender: formState.gender,
      healthStatus: formState.healthStatus,
      status: formState.status,
      notes: formState.notes.trim() || undefined,
      photoUrls: formState.photoUrls,
      vaccinationStatus: formState.vaccinationStatus,
    };

    try {
      const response = await fetch(editingAnimal ? `/api/animals/${editingAnimal.id}` : "/api/animals", {
        method: editingAnimal ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to save animal.");
      }

      const nextPage = editingAnimal ? page : 1;
      if (!editingAnimal) {
        setPage(1);
      }

      closeFormModal();
      await loadAnimals(nextPage);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save animal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(animal: Animal, nextStatus: AnimalStatus) {
    if (animal.status === nextStatus) {
      return;
    }

    try {
      const response = await fetch(`/api/animals/${animal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = (await response.json().catch(() => null)) as { message?: string; animal?: Animal } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to update status.");
      }

      if (result?.animal) {
        setAnimals((currentAnimals) =>
          currentAnimals.map((currentAnimal) => (currentAnimal.id === result.animal?.id ? result.animal! : currentAnimal)),
        );
      }
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update status.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/animals/${deleteTarget.id}`, { method: "DELETE" });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to delete animal.");
      }

      setAnimals((currentAnimals) => currentAnimals.filter((animal) => animal.id !== deleteTarget.id));
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      setDeleteTarget(null);
      await loadAnimals(page);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete animal.");
    } finally {
      setIsDeleting(false);
    }
  }

  const statusFields = getStatusOptions(editingAnimal?.status);

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
            <input
              aria-label="Search animals"
              placeholder="Search by name, breed, notes or ID..."
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.currentTarget.value)}
              className="min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
          <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Admin animal inventory</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Animal Inventory</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {pageSummary.total} animals found. Showing {pageSummary.loaded} on page {pageSummary.current} of {pageSummary.totalPages}.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Add Animal
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Species</span>
                <select
                  value={speciesFilter}
                  onChange={(event) => {
                    setSpeciesFilter(event.target.value as AnimalSpecies | "");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">All species</option>
                  {ANIMAL_SPECIES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Health status</span>
                <select
                  value={healthFilter}
                  onChange={(event) => {
                    setHealthFilter(event.target.value as AnimalHealthStatus | "");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">All statuses</option>
                  {ANIMAL_HEALTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Animal status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as AnimalStatus | "");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">All statuses</option>
                  {ANIMAL_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as "newest" | "health" | "alphabetical");
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="newest">Newest</option>
                  <option value="health">Health severity</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </label>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Animal Cards</h2>
                <p className="text-sm text-slate-600">Quick actions and workflow controls.</p>
              </div>
              <p className="text-sm text-slate-500">Strict status flow: rescued → admitted → available → adopted</p>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[520px] animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            ) : animals.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {animals.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onEdit={openEditModal}
                    onDelete={setDeleteTarget}
                    onStatusChange={updateStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                No animals match the current filters. Add a record or adjust the search criteria.
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Inventory Ledger</h2>
                <p className="text-sm text-slate-600">Table view for fast review and record access.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Page {pageSummary.current}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{pageSummary.total} total</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-2">Animal</th>
                    <th className="px-4 py-2">Species</th>
                    <th className="px-4 py-2">Health Status</th>
                    <th className="px-4 py-2">Vaccination Status</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.length ? (
                    animals.map((animal) => {
                      const statusOptions = getStatusOptions(animal.status);

                      return (
                        <tr key={animal.id} className="rounded-2xl bg-slate-50 text-sm text-slate-700">
                          <td className="rounded-l-2xl px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-200">
                                {animal.photoUrls[0] ? (
                                  <img src={animal.photoUrls[0]} alt={animal.name} className="h-full w-full object-cover" />
                                ) : null}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-950">{animal.name}</p>
                                <p className="text-xs text-slate-500">{animal.animalCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{formatEnumLabel(animal.species)}</td>
                          <td className="px-4 py-4">
                            <HealthBadge healthStatus={animal.healthStatus} />
                          </td>
                          <td className="px-4 py-4">
                            <VaccinationBadge vaccinationStatus={animal.vaccinationStatus} />
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={animal.status}
                              onChange={(event) => updateStatus(animal, event.target.value as AnimalStatus)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="rounded-r-2xl px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(animal)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(animal)}
                                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Delete
                              </button>
                              <Link
                                href={`/admin/animals/${animal.id}`}
                                className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-slate-500" colSpan={6}>
                        No animal records available for this query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">
                Showing page {pageSummary.current} of {pageSummary.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </section>
      </main>

      {isFormOpen ? (
        <ModalShell title={editingAnimal ? `Edit ${editingAnimal.name}` : "Add Animal"} onClose={closeFormModal}>
          <form className="space-y-6" onSubmit={submitAnimal}>
            {formError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-800">Name</span>
                <input
                  value={formState.name}
                  onChange={(event) => updateFormField("name", event.currentTarget.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Species</span>
                <select
                  value={formState.species}
                  onChange={(event) => updateFormField("species", event.currentTarget.value as AnimalSpecies)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  {ANIMAL_SPECIES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Breed</span>
                <input
                  value={formState.breed}
                  onChange={(event) => updateFormField("breed", event.currentTarget.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Age</span>
                <input
                  type="number"
                  min="0"
                  value={formState.age}
                  onChange={(event) => updateFormField("age", event.currentTarget.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Gender</span>
                <select
                  value={formState.gender}
                  onChange={(event) => updateFormField("gender", event.currentTarget.value as AnimalGender)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  {ANIMAL_GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Health status</span>
                <select
                  value={formState.healthStatus}
                  onChange={(event) => updateFormField("healthStatus", event.currentTarget.value as AnimalHealthStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  {ANIMAL_HEALTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-800">Status</span>
                <select
                  value={formState.status}
                  onChange={(event) => updateFormField("status", event.currentTarget.value as AnimalStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  {statusFields.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-800">Vaccination status</span>
                <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {ANIMAL_VACCINATION_OPTIONS.find((option) => option.value === formState.vaccinationStatus)?.label ??
                    formatEnumLabel(formState.vaccinationStatus)}
                </div>
              </div>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-800">Notes</span>
                <textarea
                  rows={4}
                  value={formState.notes}
                  onChange={(event) => updateFormField("notes", event.currentTarget.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <div className="md:col-span-2">
                <AnimalImageUploader value={formState.photoUrls} onChange={(value) => updateFormField("photoUrls", value)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : editingAnimal ? "Update Animal" : "Create Animal"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {deleteTarget ? (
        <ModalShell title={`Delete ${deleteTarget.name}?`} onClose={() => setDeleteTarget(null)}>
          <div className="space-y-6">
            <p className="text-sm leading-6 text-slate-600">
              This will permanently remove the animal record from the inventory.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Animal"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
