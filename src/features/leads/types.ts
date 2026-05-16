
import { z } from "zod";

// 1. Define the exact allowed strings for our board as a constant array
// We use 'as const' so TypeScript knows these are exact literal strings.
export const LEAD_STATUSES = [
  "NEW", 
  "CONTACTED", 
  "QUALIFIED", 
  "CONVERTED", 
  "LOST"
] as const;

export const LeadStatusSchema = z.enum(LEAD_STATUSES);

// 2. The Core Lead Model (represents what the server returns)
export const LeadSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().nullable().optional(),
  status: LeadStatusSchema,
  source: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 3. Form Schemas 
// When creating a lead, the user doesn't provide an ID, status, or timestamps.
export const CreateLeadSchema = LeadSchema.pick({
  name: true,
  email: true,
  phone: true,
  source: true,
});

// 4. Infer TypeScript types automatically! 
// This prevents us from maintaining separate TS interfaces and Zod schemas.
export type Lead = z.infer<typeof LeadSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;