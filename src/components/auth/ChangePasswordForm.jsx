import React, { useState } from 'react';
import { Button, Input } from '../ui';

export const ChangePasswordForm = ({ adminEmail, onChangePassword, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { email, oldPassword, newPassword, confirmNewPassword } = formData;

    if (!email.trim()) return alert('Please enter your email');
    if (email.trim().toLowerCase() !== adminEmail) return alert('Email does not match');
    if (!oldPassword.trim()) return alert('Please enter your current password');
    if (!newPassword.trim()) return alert('Please enter a new password');
    if (newPassword.length < 4) return alert('New password must be at least 4 characters');
    if (newPassword !== confirmNewPassword) return alert('New passwords do not match');

    const success = await onChangePassword(email, oldPassword, newPassword);
    if (!success) {
      alert('Current password is incorrect');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
      <div className="space-y-4">
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="Enter your email" />
        <Input label="Current Password" required type="password" value={formData.oldPassword} onChange={handleChange('oldPassword')} placeholder="Enter current password" />
        <Input label="New Password" required type="password" value={formData.newPassword} onChange={handleChange('newPassword')} placeholder="Enter new password" />
        <Input label="Confirm New Password" required type="password" value={formData.confirmNewPassword} onChange={handleChange('confirmNewPassword')} placeholder="Confirm new password" />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1">Update Password</Button>
        </div>
      </div>
    </div>
  );
};
