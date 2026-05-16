import { apiClient } from "../../../api/client";
import type { Lead, LeadStatus } from "../types";

// --- Configuration & Constants ---
const BASE_UUID_PREFIX = "11111111-1111-1111-1111-";
const ENDPOINT = "/leads";

/**
 * PRIVATE HELPER: Generates the next sequential ID in the 
 * 11111111-1111-1111-1111-0000000000XX format.
 */
const generateNextId = (currentLeads: Lead[]): string => {
  if (currentLeads.length === 0) return `${BASE_UUID_PREFIX}000000000001`;

  // Extract the numeric part of all IDs and find the maximum
  const idNumbers = currentLeads.map(lead => {
    const parts = lead.id.split("-");
    return parseInt(parts[parts.length - 1], 10);
  });

  const nextNumber = Math.max(...idNumbers) + 1;
  
  // Pad with zeros to keep the 12-digit suffix consistent
  const suffix = nextNumber.toString().padStart(12, "0");
  return `${BASE_UUID_PREFIX}${suffix}`;
};

/**
 * Lead Service Layer
 * Encapsulates all Business Logic and API interactions for Leads.
 */
export const LeadService = {
  /**
   * Fetch all leads
   */
  getAll: async (): Promise<Lead[]> => {
    const { data } = await apiClient.get<Lead[]>(ENDPOINT);
    return data;
  },

  /**
   * Create a lead with sequential ID generation
   */
  create: async (leadData: Partial<Lead>): Promise<Lead> => {
    // 1. Get current leads to calculate the next ID
    const currentLeads = await LeadService.getAll();
    const nextId = generateNextId(currentLeads);

    // 2. Prepare the payload
    const payload: Lead = {
      ...(leadData as Lead),
      id: nextId,
      status: "NEW" as LeadStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data } = await apiClient.post<Lead>(ENDPOINT, payload);
    return data;
  },

  /**
   * Update any field of a lead
   */
  update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    const { data } = await apiClient.patch<Lead>(`${ENDPOINT}/${id}`, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return data;
  },

  /**
   * Specialized Status Update
   * (Syntactic sugar for the Table/Board view)
   */
  updateStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
    return LeadService.update(id, { status });
  },

  /**
   * Remove a lead
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

// --- Backwards Compatibility Exports ---
// This prevents breaking existing code while migrating to LeadService.
export const getLeads = LeadService.getAll;
export const createLead = LeadService.create;
export const updateLead = LeadService.update;
export const updateLeadStatus = LeadService.updateStatus;
export const deleteLead = LeadService.delete;