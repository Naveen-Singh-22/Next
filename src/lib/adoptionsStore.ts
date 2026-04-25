import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";

type AdoptionStore = {
  applications: AdoptionApplication[];
  nextId: number;
};

declare global {
  var __ADOPTIONS_STORE__: AdoptionStore | undefined;
}

function getStore() {
  if (!globalThis.__ADOPTIONS_STORE__) {
    globalThis.__ADOPTIONS_STORE__ = {
      applications: [],
      nextId: 1,
    };
  }

  return globalThis.__ADOPTIONS_STORE__;
}

export function listAdoptions() {
  return [...getStore().applications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function findAdoptionById(id: number) {
  return getStore().applications.find((application) => application.id === id) ?? null;
}

export function createAdoption(input: Omit<AdoptionApplication, "id" | "createdAt" | "timeline" | "status">) {
  const store = getStore();
  const nowIso = new Date().toISOString();

  const application: AdoptionApplication = {
    ...input,
    id: store.nextId++,
    createdAt: nowIso,
    status: "applied",
    timeline: [
      {
        type: "Application submitted",
        time: nowIso,
      },
    ],
  };

  store.applications.unshift(application);
  return application;
}

export function updateAdoption(id: number, updates: Partial<Omit<AdoptionApplication, "id" | "createdAt">>) {
  const store = getStore();
  const index = store.applications.findIndex((application) => application.id === id);

  if (index < 0) {
    return null;
  }

  const existing = store.applications[index];
  const next: AdoptionApplication = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    timeline: Array.isArray(updates.timeline) ? updates.timeline : existing.timeline,
  };

  store.applications[index] = next;
  return next;
}

function statusEventLabel(status: AdoptionStatus) {
  switch (status) {
    case "shortlisted":
      return "Application shortlisted";
    case "home_visit":
      return "Home visit scheduled";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "adopted":
      return "Adopted";
    default:
      return "Status updated";
  }
}

export function updateAdoptionStatus(id: number, status: AdoptionStatus) {
  const store = getStore();
  const index = store.applications.findIndex((application) => application.id === id);

  if (index < 0) {
    return null;
  }

  const existing = store.applications[index];
  const next: AdoptionApplication = {
    ...existing,
    status,
    timeline: [
      ...existing.timeline,
      {
        type: statusEventLabel(status),
        time: new Date().toISOString(),
      },
    ],
  };

  store.applications[index] = next;
  return next;
}
