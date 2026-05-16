import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLead, updateLead } from '../api/leads';
import { X, Loader2 } from 'lucide-react';
import type { Lead } from '../types';

// 1. Define the Zod Schema (Strict Validation Rules)
const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().optional(),
  source: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
  mode?: 'create' | 'edit' | 'view'; // Determines form behavior
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ 
  isOpen, 
  onClose, 
  leadToEdit, 
  mode = 'create' 
}) => {
  const queryClient = useQueryClient();
  const isEditing = mode === 'edit';
  const isViewOnly = mode === 'view';

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      source: 'website',
    },
  });

  // Reset form when modal opens/closes or when leadToEdit changes
  useEffect(() => {
    if (isOpen) {
      reset(leadToEdit ? {
        name: leadToEdit.name,
        email: leadToEdit.email,
        phone: leadToEdit.phone || '',
        source: leadToEdit.source || 'website',
      } : {
        name: '', email: '', phone: '', source: 'website'
      });
    }
  }, [isOpen, leadToEdit, reset]);

  // 3. Setup Mutations for Async handling
  const mutation = useMutation({
    mutationFn: (data: LeadFormData) => 
      isEditing ? updateLead(leadToEdit!.id, data) : createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    },
  });

  const onSubmit = (data: LeadFormData) => {
    // Prevent accidental submission in view mode
    if (isViewOnly) return; 
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isViewOnly ? 'Lead Details' : isEditing ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              {...register('name')}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="e.g. Jane Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              {...register('email')}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Grid for Phone & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('phone')}
                disabled={isViewOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                {...register('source')}
                disabled={isViewOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none disabled:appearance-none"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="campaign">Campaign</option>
                <option value="cold-outreach">Cold Outreach</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>

          {/* Error State from API */}
          {mutation.isError && !isViewOnly && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Something went wrong. Please try again.
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            
            {/* ONLY show the submit button if we are NOT in view mode */}
            {!isViewOnly && (
              <button
                type="submit"
                disabled={!isValid || mutation.isPending || (!isDirty && !isEditing)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {mutation.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
                {isEditing ? 'Save Changes' : 'Create Lead'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};