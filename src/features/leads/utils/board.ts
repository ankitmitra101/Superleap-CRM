// src/features/leads/utils/board.ts
import type { Lead, LeadStatus } from '../types';

export type BoardData = Record<string, Lead[]>;

// Define the strict order of columns on the board
export const BOARD_COLUMNS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'LOST'
];

/**
 * Transforms a flat array of Leads into a column-mapped dictionary.
 * O(n) complexity to ensure high performance even with thousands of leads.
 */
export const groupLeadsByStatus = (leads: Lead[]): BoardData => {
  // Initialize empty arrays for every possible column to prevent undefined errors
  const grouped: BoardData = BOARD_COLUMNS.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as BoardData);

  // Distribute leads into their respective columns
  leads.forEach((lead) => {
    if (grouped[lead.status]) {
      grouped[lead.status].push(lead);
    }
  });

  // Sort each column by newest first to ensure a predictable UI
  Object.keys(grouped).forEach((status) => {
    grouped[status].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  return grouped;
};