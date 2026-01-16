import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Input, Modal } from '../ui';
import { INITIAL_PARTNER_FORM } from '../../constants';

export const PartnerForm = ({ partner, onSave, onClose }) => {
  const [formData, setFormData] = useState(partner || INITIAL_PARTNER_FORM);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and Email are required');
      return;
    }
    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      company: formData.company?.trim() || '',
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={partner ? 'Edit Partner' : 'Add Partner'}>
      <div className="space-y-4">
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Partner name"
        />
        <div>
          <Input
            label="Email"
            required
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="partner@example.com"
          />
          <p className="text-xs text-gray-400 mt-1">Partners will use this email to log in</p>
        </div>
        <Input
          label="Phone"
          type="tel"
          value={formData.phone || ''}
          onChange={handleChange('phone')}
          placeholder="(555) 123-4567"
        />
        <Input
          label="Company"
          value={formData.company || ''}
          onChange={handleChange('company')}
          placeholder="Company name"
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
