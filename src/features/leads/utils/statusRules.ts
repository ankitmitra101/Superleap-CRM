import type { LeadStatus } from "../types";

// We define a map where the key is the current status, 
// and the value is an array of allowed next statuses.
export const STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["CONVERTED", "LOST"],
  CONVERTED: [], // Final state: no further transitions allowed
  LOST: [],      // Final state: no further transitions allowed
};

/**
 * Returns an array of valid statuses a lead can transition to.
 * If the array is empty, the lead is in a final state.
 */
export const getValidNextStatuses = (currentStatus: LeadStatus): LeadStatus[] => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Helper to check if a specific transition is allowed.
 * We will use this to double-check before making API calls.
 */
export const isValidTransition = (currentStatus: LeadStatus, nextStatus: LeadStatus): boolean => {
  const validNext = getValidNextStatuses(currentStatus);
  return validNext.includes(nextStatus);
};

/**
 * Helper to check if a lead is locked (cannot be edited/transitioned further)
 */
export const isLeadLocked = (currentStatus: LeadStatus): boolean => {
  return currentStatus === "CONVERTED" || currentStatus === "LOST";
};