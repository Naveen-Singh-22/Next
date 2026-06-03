import { prisma } from "@/lib/prisma";
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

export async function getProfileSnapshot(email: string): Promise<ProfileSnapshot> {
  const normalizedEmail = email.trim().toLowerCase();
  const userRow = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const user = userRow
    ? {
        id: String(userRow.id),
        name: userRow.fullName,
        email: userRow.email,
        role: userRow.role,
        createdAt: userRow.createdAt.toISOString(),
      }
    : null;

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