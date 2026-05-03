import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listAdoptionRequests, type StoredAdoptionRequest } from "@/lib/adoptionRequestsDb";
import { listDonations, type StoredDonation } from "@/lib/donationsStore";
import { listVolunteerApplications, type StoredVolunteerApplication } from "@/lib/volunteerApplicationsStore";

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type ProfileSnapshot = {
  user: ProfileUser | null;
  donations: StoredDonation[];
  adoptionRequests: StoredAdoptionRequest[];
  volunteerApplications: StoredVolunteerApplication[];
};

const USERS_FILE = join(process.cwd(), "data", "users.json");

function readUsers(): ProfileUser[] {
  try {
    const contents = readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(contents) as { users: ProfileUser[] };
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

export async function getProfileSnapshot(email: string): Promise<ProfileSnapshot> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail) ?? null;

  const [donations, adoptionRequests, volunteerApplications] = await Promise.all([
    listDonations(),
    listAdoptionRequests(),
    listVolunteerApplications(),
  ]);

  return {
    user,
    donations: donations.filter((entry) => entry.email.trim().toLowerCase() === normalizedEmail),
    adoptionRequests: adoptionRequests.filter((entry) => entry.applicantEmail.trim().toLowerCase() === normalizedEmail),
    volunteerApplications: volunteerApplications.filter((entry) => entry.email.trim().toLowerCase() === normalizedEmail),
  };
}