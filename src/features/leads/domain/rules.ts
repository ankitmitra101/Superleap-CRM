// src/features/leads/domain/rules.ts
import type { LeadStatus } from '../types';

/**
 * Defines the strict business rules for Kanban board transitions.
 * This is the SINGLE SOURCE OF TRUTH for movement on the board.
 */
export const isValidTransition = (
  currentStatus: LeadStatus | string,
  targetStatus: LeadStatus | string
): boolean => {
  // If dropping in the same column, it's just a reorder (always valid)
  if (currentStatus === targetStatus) return true;

  switch (currentStatus) {
    case 'NEW':
      return targetStatus === 'CONTACTED' || targetStatus === 'LOST';
    
    case 'CONTACTED':
      return targetStatus === 'QUALIFIED' || targetStatus === 'LOST';
    
    case 'QUALIFIED':
      return targetStatus === 'CONVERTED' || targetStatus === 'LOST';
    
    case 'CONVERTED':
    case 'LOST':
      // Terminal states. Cards cannot be moved out of these columns.
      return false;
      
    default:
      return false;
  }
};