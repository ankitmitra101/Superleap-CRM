// src/features/leads/services/bulkMutationService.ts
import { type LeadStatus } from '../types';
import { LeadService } from '../api/leads'; // <-- The correct, staff-level relative path
import { toast } from 'sonner';

export const executeBulkStatusChange = async (
  ids: Set<string>,
  targetStatus: LeadStatus
) => {
  const idArray = Array.from(ids);
  
  // Execute all concurrently, regardless of individual failures
  const results = await Promise.allSettled(
    idArray.map((id) => LeadService.updateStatus(id, targetStatus))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  // Result Summary UX Generation
  if (failed.length === 0) {
    toast.success(`Successfully updated ${succeeded.length} leads.`);
  } else {
    toast.error(`Partial Success: ${succeeded.length} updated, ${failed.length} failed.`, {
      description: 'Check the error logs for per-lead rejection reasons.',
      duration: 8000,
      action: {
        label: 'View Errors',
        onClick: () => console.table(failed) // In prod, open an error modal here
      }
    });
  }

  return { successCount: succeeded.length, errorCount: failed.length };
};
// Add this below your existing executeBulkStatusChange function

export const executeBulkDelete = async (ids: Set<string>) => {
  const idArray = Array.from(ids);
  
  // Execute all deletions concurrently
  const results = await Promise.allSettled(
    idArray.map((id) => LeadService.delete(id))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  // Result Summary UX
  if (failed.length === 0) {
    toast.success(`Successfully deleted ${succeeded.length} leads.`);
  } else {
    toast.error(`Partial Success: ${succeeded.length} deleted, ${failed.length} failed.`, {
      description: 'Check the error logs for per-lead rejection reasons.',
      duration: 8000,
    });
    console.table(failed);
  }

  return { successCount: succeeded.length, errorCount: failed.length };
};