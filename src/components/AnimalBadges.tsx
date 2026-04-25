import type {
  AnimalHealthStatus,
  AnimalStatus,
  AnimalVaccinationStatus,
} from "@/lib/animalInventoryTypes";

const badgeBase = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide";

export const ANIMAL_SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
] as const;

export const ANIMAL_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const ANIMAL_HEALTH_OPTIONS = [
  { value: "healthy", label: "Healthy" },
  { value: "injured", label: "Injured" },
  { value: "recovering", label: "Recovering" },
  { value: "critical", label: "Critical" },
] as const;

export const ANIMAL_STATUS_OPTIONS = [
  { value: "rescued", label: "Rescued" },
  { value: "admitted", label: "Admitted" },
  { value: "available", label: "Available" },
  { value: "adopted", label: "Adopted" },
] as const;

export const ANIMAL_VACCINATION_OPTIONS = [
  { value: "up_to_date", label: "Up to date" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
] as const;

export function formatEnumLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const healthClasses: Record<AnimalHealthStatus, string> = {
  healthy: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  injured: "bg-red-100 text-red-800 ring-1 ring-red-200",
  recovering: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  critical: "bg-rose-200 text-rose-950 ring-1 ring-rose-300",
};

const statusClasses: Record<AnimalStatus, string> = {
  rescued: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  admitted: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  available: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  adopted: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
};

const vaccinationClasses: Record<AnimalVaccinationStatus, string> = {
  up_to_date: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  due_soon: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  overdue: "bg-red-100 text-red-800 ring-1 ring-red-200",
};

export function HealthBadge({ healthStatus }: { healthStatus: AnimalHealthStatus }) {
  return <span className={`${badgeBase} ${healthClasses[healthStatus]}`}>{formatEnumLabel(healthStatus)}</span>;
}

export function StatusBadge({ status }: { status: AnimalStatus }) {
  return <span className={`${badgeBase} ${statusClasses[status]}`}>{formatEnumLabel(status)}</span>;
}

export function VaccinationBadge({ vaccinationStatus }: { vaccinationStatus: AnimalVaccinationStatus }) {
  return (
    <span className={`${badgeBase} ${vaccinationClasses[vaccinationStatus]}`}>
      {formatEnumLabel(vaccinationStatus)}
    </span>
  );
}
