// src/domain/leads/transitionEngine.ts
import { type LeadStatus } from '../../features/leads/types';
// Immutable transition rules matrix
export const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
  CONVERTED: [], // Terminal
  LOST: [],      // Terminal
};

export interface BulkTransitionResult {
  validTransitions: LeadStatus[];
  isDisabled: boolean;
  reason?: string;
}

/**
 * Calculates available transitions for a bulk selection.
 * Enforces that all selected leads must support the target transition.
 */
export const getBulkTransitionOptions = (
  selectedStatuses: LeadStatus[]
): BulkTransitionResult => {
  if (selectedStatuses.length === 0) {
    return { validTransitions: [], isDisabled: true, reason: 'No leads selected' };
  }

  const hasTerminal = selectedStatuses.some((s) => s === 'CONVERTED' || s === 'LOST');
  if (hasTerminal) {
    return {
      validTransitions: [],
      isDisabled: true,
      reason: 'Selection contains terminal leads (Converted/Lost).',
    };
  }

  // Find the intersection of valid transitions
  const commonTransitions = selectedStatuses.reduce((common, status) => {
    const validForCurrent = VALID_TRANSITIONS[status];
    return common.filter((s) => validForCurrent.includes(s));
  }, VALID_TRANSITIONS[selectedStatuses[0]]);

  if (commonTransitions.length === 0) {
    return {
      validTransitions: [],
      isDisabled: true,
      reason: 'No common transitions available for this mixed selection.',
    };
  }

  return { validTransitions: commonTransitions, isDisabled: false };
};