"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import VaccinationCalendar from "@/components/VaccinationCalendar";
import { VaccinationBadge } from "@/components/AnimalBadges";
import { getVaccinationStatus } from "@/lib/vaccinationTypes";
import type { Vaccination, VaccinationStatus } from "@/lib/vaccinationTypes";

type AnimalOption = {
  id: number;
  name: string;
  species: string;
  photoUrls: string[];
};

type VaccinationRecord = Vaccination & {
  status: VaccinationStatus;
  photoUrl: string;
  species: string;
};

type ModalMode = "create" | "bulk" | "edit" | null;

type FormState = {
  animalId: string;
  animalIds: string[];
  vaccineName: string;
  dose: string;
  dateGiven: string;
  nextDueDate: string;
  notes: string;
};

const emptyFormState: FormState = {
  animalId: "",
  animalIds: [],
  vaccineName: "",
  dose: "",
  dateGiven: new Date().toISOString().slice(0, 10),
  nextDueDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  notes: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function toCsv(records: VaccinationRecord[]) {
  const rows = [
    ["Animal ID", "Animal Name", "Species", "Vaccine", "Dose", "Date Given", "Next Due Date", "Status", "Notes"],
    ...records.map((record) => [
      String(record.animalId),
      record.animalName,
      record.species,
      record.vaccineName,
      record.dose,
      record.dateGiven,
      record.nextDueDate,
      record.status,
      record.notes ?? "",
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function VaccinationManagementClient() {
  const searchParams = useSearchParams();
  const queryAnimalId = searchParams.get("animalId") ?? "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);
  const [animals, setAnimals] = useState<AnimalOption[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [animalFilter, setAnimalFilter] = useState(queryAnimalId);
  const [statusFilter, setStatusFilter] = useState<"all" | VaccinationStatus>("all");
  const [sortBy, setSortBy] = useState<"nextDueDate" | "animalName" | "newest">("nextDueDate");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaccinationRecord | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(emptyFormState);
  const [bulkForm, setBulkForm] = useState<FormState>({ ...emptyFormState, animalIds: [] });
  const [editForm, setEditForm] = useState<Pick<FormState, "nextDueDate" | "notes">>({
    nextDueDate: emptyFormState.nextDueDate,
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAnimalFilter(queryAnimalId);
  }, [queryAnimalId]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [animalResponse, vaccinationResponse] = await Promise.all([
          fetch("/api/animals?limit=1000"),
          fetch(queryAnimalId ? `/api/vaccinations?animalId=${queryAnimalId}` : "/api/vaccinations"),
        ]);

        if (!animalResponse.ok || !vaccinationResponse.ok) {
          throw new Error("Unable to load vaccination data.");
        }

        const animalJson = (await animalResponse.json()) as { animals?: AnimalOption[] };
        const vaccinationJson = (await vaccinationResponse.json()) as { vaccinations?: Vaccination[] };

        if (!active) {
          return;
        }

        setAnimals(animalJson.animals ?? []);
        setVaccinations(vaccinationJson.vaccinations ?? []);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load vaccination data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [queryAnimalId]);

  const animalLookup = useMemo(() => new Map(animals.map((animal) => [animal.id, animal])), [animals]);

  const records = useMemo<VaccinationRecord[]>(() => {
    return vaccinations
      .map((record) => {
        const animal = animalLookup.get(record.animalId);
        const status = getVaccinationStatus(record.nextDueDate);

        return {
          ...record,
          status,
          photoUrl: animal?.photoUrls[0] ?? "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
          species: animal?.species ?? "animal",
        };
      })
      .filter((record) => {
        const matchesAnimal = !animalFilter || String(record.animalId) === animalFilter;
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        const searchValue = `${record.animalName} ${record.vaccineName} ${record.dose} ${record.notes ?? ""}`.toLowerCase();
        const matchesSearch = searchValue.includes(search.toLowerCase());

        return matchesAnimal && matchesStatus && matchesSearch;
      })
      .sort((left, right) => {
        if (sortBy === "animalName") {
          return left.animalName.localeCompare(right.animalName);
        }

        if (sortBy === "newest") {
          return new Date(right.dateGiven).getTime() - new Date(left.dateGiven).getTime();
        }

        return new Date(left.nextDueDate).getTime() - new Date(right.nextDueDate).getTime();
      });
  }, [animalLookup, animalFilter, search, sortBy, statusFilter, vaccinations]);

  const totalCount = vaccinations.length;
  const overdueCount = useMemo(() => records.filter((record) => record.status === "overdue").length, [records]);
  const todayCount = useMemo(() => records.filter((record) => record.status === "today").length, [records]);
  const upcomingCount = useMemo(() => records.filter((record) => record.status === "upcoming").length, [records]);

  async function refreshVaccinations(nextAnimalId = animalFilter) {
    const response = await fetch(nextAnimalId ? `/api/vaccinations?animalId=${nextAnimalId}` : "/api/vaccinations");
    if (!response.ok) {
      throw new Error("Unable to refresh vaccination records.");
    }

    const json = (await response.json()) as { vaccinations?: Vaccination[] };
    setVaccinations(json.vaccinations ?? []);
  }

  function openCreateModal() {
    const defaultAnimalId = animalFilter || String(animals[0]?.id ?? "");
    setCreateForm((current) => ({ ...current, animalId: defaultAnimalId, animalIds: [], vaccineName: current.vaccineName || "Rabies Booster" }));
    setMode("create");
  }

  function openBulkModal() {
    setBulkForm((current) => ({
      ...current,
      animalIds: selectedIds.map(String),
      vaccineName: current.vaccineName || "Rabies Booster",
    }));
    setMode("bulk");
  }

  function openEditModal(record: VaccinationRecord) {
    setEditingRecord(record);
    setEditForm({ nextDueDate: record.nextDueDate, notes: record.notes ?? "" });
    setMode("edit");
  }

  async function submitCreate() {
    if (!createForm.animalId || !createForm.vaccineName || !createForm.dose || !createForm.dateGiven || !createForm.nextDueDate) {
      return;
    }

    const selectedAnimal = animals.find((animal) => animal.id === Number(createForm.animalId));
    if (!selectedAnimal) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/vaccinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalId: Number(createForm.animalId),
          animalName: selectedAnimal.name,
          vaccineName: createForm.vaccineName,
          dose: createForm.dose,
          dateGiven: createForm.dateGiven,
          nextDueDate: createForm.nextDueDate,
          notes: createForm.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create vaccination record.");
      }

      await refreshVaccinations();
      setMode(null);
      setCreateForm(emptyFormState);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create vaccination record.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitBulk() {
    if (bulkForm.animalIds.length === 0 || !bulkForm.vaccineName || !bulkForm.dose || !bulkForm.dateGiven || !bulkForm.nextDueDate) {
      return;
    }

    const selectedAnimals = bulkForm.animalIds
      .map((id) => animals.find((animal) => animal.id === Number(id)))
      .filter((animal): animal is AnimalOption => Boolean(animal));

    if (selectedAnimals.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/vaccinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalIds: selectedAnimals.map((animal) => animal.id),
          animalNames: selectedAnimals.map((animal) => animal.name),
          vaccineName: bulkForm.vaccineName,
          dose: bulkForm.dose,
          dateGiven: bulkForm.dateGiven,
          nextDueDate: bulkForm.nextDueDate,
          notes: bulkForm.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to schedule vaccinations.");
      }

      setSelectedIds([]);
      await refreshVaccinations();
      setMode(null);
      setBulkForm({ ...emptyFormState, animalIds: [] });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to schedule vaccinations.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitEdit() {
    if (!editingRecord) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/vaccinations/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextDueDate: editForm.nextDueDate,
          notes: editForm.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update vaccination record.");
      }

      await refreshVaccinations();
      setMode(null);
      setEditingRecord(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update vaccination record.");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/vaccinations/${deleteTarget.id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Unable to delete vaccination record.");
      }

      await refreshVaccinations();
      setDeleteTarget(null);
      setMode(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete vaccination record.");
    } finally {
      setIsSaving(false);
    }
  }

  function exportCurrentCsv() {
    downloadCsv(toCsv(records), `vaccinations-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function toggleSelection(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }

  function toggleAllVisible() {
    const visibleIds = records.map((record) => record.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  }

  return (
    <div className="admin-page admin-mobile-shell">
      <AdminSidebar activeHref="/admin/vaccinations" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="admin-main">
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
              aria-label="Search vaccination records"
              placeholder="Search animals, vaccines, doses..."
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span className="avatar">VX</span>
          </div>
        </header>

        <section className="grid gap-6 rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-[0_30px_120px_rgba(15,23,42,0.24)] lg:grid-cols-[1.5fr_0.95fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Clinical Operations</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Vaccination management with live scheduling, filtering, and boosters.</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Track every dose, keep follow-ups visible, and schedule batches for new intake animals without leaving the admin dashboard.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={openCreateModal} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                New vaccination
              </button>
              <button type="button" onClick={openBulkModal} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Bulk schedule
              </button>
              <button type="button" onClick={exportCurrentCsv} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur">
            <article className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Total</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCount}</p>
              <p className="mt-2 text-sm text-slate-400">Vaccination records</p>
            </article>
            <article className="rounded-3xl bg-rose-500/15 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-rose-200">Overdue</p>
              <p className="mt-3 text-3xl font-semibold text-white">{overdueCount}</p>
              <p className="mt-2 text-sm text-rose-100/75">Need attention now</p>
            </article>
            <article className="rounded-3xl bg-amber-500/15 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-200">Today</p>
              <p className="mt-3 text-3xl font-semibold text-white">{todayCount}</p>
              <p className="mt-2 text-sm text-amber-100/75">Due for release today</p>
            </article>
            <article className="rounded-3xl bg-emerald-500/15 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">Upcoming</p>
              <p className="mt-3 text-3xl font-semibold text-white">{upcomingCount}</p>
              <p className="mt-2 text-sm text-emerald-100/75">Booked for later</p>
            </article>
          </div>
        </section>

        <section className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Animal filter</span>
            <select
              value={animalFilter}
              onChange={(event) => setAnimalFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="">All animals</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} #{animal.id}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | VaccinationStatus)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="all">All statuses</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "nextDueDate" | "animalName" | "newest")}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="nextDueDate">Next due date</option>
              <option value="animalName">Animal name</option>
              <option value="newest">Newest first</option>
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button type="button" onClick={toggleAllVisible} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">
              {selectedIds.length > 0 ? "Clear selection" : "Select visible"}
            </button>
          </div>
        </section>

        {queryAnimalId ? (
          <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
            Filtering vaccination records for animal ID {queryAnimalId}.{" "}
            <Link href="/admin/vaccinations" className="font-semibold underline decoration-cyan-400 decoration-2 underline-offset-4">
              Clear filter
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="vaccination-layout mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">Schedule</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Live vaccination registry</h2>
              </div>
              <p className="text-sm text-slate-500">{records.length} visible records</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.3em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={records.length > 0 && records.every((record) => selectedIds.includes(record.id))}
                        onChange={toggleAllVisible}
                        aria-label="Select all visible records"
                      />
                    </th>
                    <th className="px-6 py-4">Animal</th>
                    <th className="px-6 py-4">Vaccine</th>
                    <th className="px-6 py-4">Next Due</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                        Loading vaccination records...
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((record) => (
                      <tr key={record.id} className="align-top transition hover:bg-cyan-50/60">
                        <td className="px-6 py-4 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(record.id)}
                            onChange={() => toggleSelection(record.id)}
                            aria-label={`Select ${record.animalName}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={record.photoUrl}
                              alt={record.animalName}
                              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-950">{record.animalName}</p>
                              <p className="text-sm text-slate-500">ID {record.animalId} • {record.species}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{record.vaccineName}</p>
                          <p className="text-sm text-slate-500">{record.dose}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-950">{formatDate(record.nextDueDate)}</p>
                          <p className="text-sm text-slate-500">Given {formatDate(record.dateGiven)}</p>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <VaccinationBadge vaccinationStatus={record.status === "overdue" ? "overdue" : record.status === "today" ? "due_soon" : "up_to_date"} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => openEditModal(record)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">
                              Edit
                            </button>
                            <Link href={`/admin/animals/${record.animalId}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">
                              Animal record
                            </Link>
                            <button type="button" onClick={() => setDeleteTarget(record)} className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                        No vaccination records match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-6">
            <VaccinationCalendar records={records} />

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">Quick Actions</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Bulk schedule assigns the same vaccine cycle to multiple animals at once.</p>
                <p>CSV export downloads the currently filtered registry for reports and handoff notes.</p>
                <p>The status badge updates from the next due date, so the page stays read-only for status logic.</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      {mode ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-4 sm:items-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-[0_28px_100px_rgba(15,23,42,0.3)]">
            {mode === "create" ? (
              <FormModalShell
                title="New vaccination"
                description="Create a single vaccination record for one animal."
                onClose={() => setMode(null)}
                footer={
                  <>
                    <button type="button" onClick={() => setMode(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      Cancel
                    </button>
                    <button type="button" disabled={isSaving} onClick={submitCreate} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {isSaving ? "Saving..." : "Create record"}
                    </button>
                  </>
                }
              >
                <VaccinationForm form={createForm} setForm={setCreateForm} animals={animals} />
              </FormModalShell>
            ) : null}

            {mode === "bulk" ? (
              <FormModalShell
                title="Bulk schedule"
                description="Assign the same vaccination to multiple animals."
                onClose={() => setMode(null)}
                footer={
                  <>
                    <button type="button" onClick={() => setMode(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      Cancel
                    </button>
                    <button type="button" disabled={isSaving} onClick={submitBulk} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {isSaving ? "Scheduling..." : "Schedule batch"}
                    </button>
                  </>
                }
              >
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="max-h-[440px] overflow-auto rounded-3xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Selected animals</p>
                    <div className="mt-3 space-y-2">
                      {animals.map((animal) => (
                        <label key={animal.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2 transition hover:border-cyan-200">
                          <input
                            type="checkbox"
                            checked={bulkForm.animalIds.includes(String(animal.id))}
                            onChange={() =>
                              setBulkForm((current) => ({
                                ...current,
                                animalIds: current.animalIds.includes(String(animal.id))
                                  ? current.animalIds.filter((id) => id !== String(animal.id))
                                  : [...current.animalIds, String(animal.id)],
                              }))
                            }
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{animal.name}</p>
                            <p className="text-xs text-slate-500">ID {animal.id} • {animal.species}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <VaccinationForm form={bulkForm} setForm={setBulkForm} animals={animals} hideAnimalSelector />
                </div>
              </FormModalShell>
            ) : null}

            {mode === "edit" && editingRecord ? (
              <FormModalShell
                title={`Edit ${editingRecord.animalName}`}
                description="Only the due date and notes are editable from this dashboard."
                onClose={() => setMode(null)}
                footer={
                  <>
                    <button type="button" onClick={() => setMode(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      Cancel
                    </button>
                    <button type="button" disabled={isSaving} onClick={submitEdit} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                  </>
                }
              >
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Next due date</span>
                    <input
                      type="date"
                      value={editForm.nextDueDate}
                      onChange={(event) => setEditForm((current) => ({ ...current, nextDueDate: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Notes</span>
                    <textarea
                      value={editForm.notes}
                      onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                      rows={5}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                </div>
              </FormModalShell>
            ) : null}
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_28px_100px_rgba(15,23,42,0.3)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">Delete record</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Remove vaccination record?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This will delete the record for {deleteTarget.animalName} and update the linked animal status summary.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Cancel
              </button>
              <button type="button" disabled={isSaving} onClick={confirmDelete} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? "Deleting..." : "Delete record"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FormModalShell({
  title,
  description,
  onClose,
  footer,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Close
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">{footer}</div>
    </div>
  );
}

function VaccinationForm({
  form,
  setForm,
  animals,
  hideAnimalSelector = false,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  animals: AnimalOption[];
  hideAnimalSelector?: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 p-4">
      {hideAnimalSelector ? null : (
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Animal</span>
          <select
            value={form.animalId}
            onChange={(event) => setForm((current) => ({ ...current, animalId: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="">Select an animal</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} #{animal.id}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Vaccine name</span>
        <input
          type="text"
          value={form.vaccineName}
          onChange={(event) => setForm((current) => ({ ...current, vaccineName: event.target.value }))}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          placeholder="Rabies Booster"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Dose</span>
        <input
          type="text"
          value={form.dose}
          onChange={(event) => setForm((current) => ({ ...current, dose: event.target.value }))}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          placeholder="Primary Course"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Date given</span>
          <input
            type="date"
            value={form.dateGiven}
            onChange={(event) => setForm((current) => ({ ...current, dateGiven: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Next due date</span>
          <input
            type="date"
            value={form.nextDueDate}
            onChange={(event) => setForm((current) => ({ ...current, nextDueDate: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={4}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          placeholder="Side effects, manufacturer, follow-up, or internal notes"
        />
      </label>
    </div>
  );
}
