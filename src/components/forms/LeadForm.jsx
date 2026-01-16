import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Input, Select, SelectWithOptGroups, TextArea, Modal } from '../ui';
import { INITIAL_LEAD_FORM, STATUS_OPTIONS, INDUSTRY_OPTIONS, HEADCOUNT_OPTIONS } from '../../constants';

export const LeadForm = ({ lead, onSave, onClose, selectedProduct }) => {
  const [formData, setFormData] = useState(lead || INITIAL_LEAD_FORM);
  const [showOtherIndustry, setShowOtherIndustry] = useState(lead?.industry === 'Other' || false);
  const [otherIndustry, setOtherIndustry] = useState('');

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Handle "Other" industry selection
    if (field === 'industry') {
      setShowOtherIndustry(value === 'Other');
      if (value !== 'Other') {
        setOtherIndustry('');
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Name, Email, and Company are required');
      return;
    }

    // Use otherIndustry if "Other" was selected
    const finalIndustry = formData.industry === 'Other' && otherIndustry.trim()
      ? otherIndustry.trim()
      : formData.industry?.trim() || '';

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      company: formData.company.trim(),
      title: formData.title?.trim() || '',
      company_url: formData.company_url?.trim() || '',
      industry: finalIndustry,
      headcount: formData.headcount || '',
      status: formData.status,
      notes: formData.notes?.trim() || '',
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={lead ? 'Edit Lead' : 'Add Lead'} size="lg">
      <div className="space-y-4">
        {/* ICP Reminder Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Best leads: HR/payroll decision-makers at mid-size companies</p>
              <p className="text-xs text-blue-600 mt-1">Target companies with 50-1,000 employees in Technology, Construction, Finance, Manufacturing, or Healthcare</p>
            </div>
          </div>
        </div>

        <Input label="Name" required value={formData.name} onChange={handleChange('name')} placeholder="Contact name" />
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="contact@company.com" />
        <Input label="Phone" type="tel" value={formData.phone || ''} onChange={handleChange('phone')} placeholder="(555) 123-4567" />
        <Input label="Company" required value={formData.company} onChange={handleChange('company')} placeholder="Company name" />

        {/* Title field with updated placeholder and hint */}
        <div>
          <Input
            label="Title"
            value={formData.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. HR Director, Benefits Manager, Payroll Admin"
          />
          <p className="text-xs text-green-600 mt-1">Decision-makers convert best</p>
        </div>

        <Input label="Company URL" type="url" value={formData.company_url || ''} onChange={handleChange('company_url')} placeholder="https://company.com" />

        {/* Industry dropdown with optgroups */}
        <SelectWithOptGroups
          label="Industry"
          value={formData.industry || ''}
          onChange={handleChange('industry')}
          options={INDUSTRY_OPTIONS}
        />

        {/* Show text input if "Other" is selected */}
        {showOtherIndustry && (
          <Input
            label="Specify Industry"
            value={otherIndustry}
            onChange={(e) => setOtherIndustry(e.target.value)}
            placeholder="Enter the industry"
          />
        )}

        {/* Headcount dropdown */}
        <Select
          label="Headcount"
          value={formData.headcount || ''}
          onChange={handleChange('headcount')}
          options={HEADCOUNT_OPTIONS}
        />

        <Select label="Status" required value={formData.status} onChange={handleChange('status')} options={STATUS_OPTIONS} />
        <TextArea label="Notes" value={formData.notes || ''} onChange={handleChange('notes')} rows={3} placeholder="Additional notes..." />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1"><Save className="w-4 h-4" />Save</Button>
        </div>
      </div>
    </Modal>
  );
};
