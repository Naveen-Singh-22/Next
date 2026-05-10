import { z } from "zod";

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "donor", "volunteer"]).optional().default("donor"),
  rememberMe: z.boolean().optional().default(false),
});

export const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Animal Schemas
export const AnimalCreateSchema = z.object({
  name: z.string().min(1, "Animal name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.number().min(0, "Age must be positive"),
  gender: z.enum(["male", "female", "unknown"]),
  healthStatus: z.enum(["healthy", "injured", "sick", "recovery"]),
  vaccinationStatus: z.enum(["up_to_date", "pending", "overdue"]),
  code: z.string().optional(),
});

export const AnimalUpdateSchema = AnimalCreateSchema.partial();

// Adoption Schemas
export const AdoptionRequestSchema = z.object({
  animalId: z.string().min(1, "Animal ID is required"),
  applicantName: z.string().min(2, "Full name is required"),
  applicantEmail: z.string().email("Invalid email"),
  housing: z.string().min(10, "Housing information is required"),
  experience: z.string().optional(),
  family: z.string().optional(),
  timeline: z.string().optional(),
});

export const AdoptionUpdateSchema = z.object({
  status: z.enum(["applied", "shortlisted", "home_visit", "approved", "rejected"]),
  adminNotes: z.string().optional(),
});

// Rescue Schemas
export const RescueReportSchema = z.object({
  species: z.string().min(1, "Species is required"),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  urgency: z.enum(["critical", "high", "medium", "low"]),
  image: z.string().optional(), // base64
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
});

export const RescueUpdateSchema = z.object({
  caseStatus: z.enum(["reported", "in_progress", "monitored", "rescued", "closed"]).optional(),
  adminNotes: z.string().optional(),
  checklist: z.object({
    rescued: z.boolean().optional(),
    monitored: z.boolean().optional(),
    medicalCompleted: z.boolean().optional(),
    shelterAssigned: z.boolean().optional(),
    reporterNotified: z.boolean().optional(),
  }).optional(),
});

// Volunteer Schemas
export const VolunteerApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  interestArea: z.enum(["rescue", "shelter_care", "adoption_support", "fundraising", "other"]),
  experience: z.string().optional(),
  availability: z.string().optional(),
});

export const VolunteerUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  role: z.enum(["rescue_dispatcher", "shelter_assistant", "event_support"]).optional(),
  adminNotes: z.string().optional(),
});

// Donation Schemas
export const DonationSchema = z.object({
  donorName: z.string().min(2, "Donor name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  coverFees: z.boolean().optional().default(false),
  message: z.string().optional(),
  paymentMethod: z.string().optional(),
});

// Vaccination Schemas
export const VaccinationSchema = z.object({
  animalId: z.string().min(1, "Animal ID is required"),
  vaccineName: z.string().min(1, "Vaccine name is required"),
  dose: z.string().optional(),
  dateGiven: z.string().datetime("Invalid date"),
  nextDueDate: z.string().datetime("Invalid date"),
  veterinarian: z.string().optional(),
  notes: z.string().optional(),
});

export const VaccinationUpdateSchema = VaccinationSchema.partial();

// User Management Schemas
export const UserUpdateSchema = z.object({
  role: z.enum(["admin", "staff", "donor", "volunteer", "adopter"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).optional(),
});

// Newsletter Schemas
export const NewsletterSignupSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
});

// Inquiry Schemas
export const InquiryUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

// Type exports for convenience
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type AnimalCreate = z.infer<typeof AnimalCreateSchema>;
export type AnimalUpdate = z.infer<typeof AnimalUpdateSchema>;
export type AdoptionRequest = z.infer<typeof AdoptionRequestSchema>;
export type AdoptionUpdate = z.infer<typeof AdoptionUpdateSchema>;
export type RescueReport = z.infer<typeof RescueReportSchema>;
export type RescueUpdate = z.infer<typeof RescueUpdateSchema>;
export type VolunteerApplication = z.infer<typeof VolunteerApplicationSchema>;
export type VolunteerUpdate = z.infer<typeof VolunteerUpdateSchema>;
export type Donation = z.infer<typeof DonationSchema>;
export type Vaccination = z.infer<typeof VaccinationSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type NewsletterSignup = z.infer<typeof NewsletterSignupSchema>;
export type InquiryUpdate = z.infer<typeof InquiryUpdateSchema>;
