import React, { useState } from 'react';
import { Button, Input } from '../ui';

export const RegistrationForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) return alert('Please enter your full name');
    if (!email.trim()) return alert('Please enter your email');
    if (!password.trim()) return alert('Please enter a password');
    if (password.length < 4) return alert('Password must be at least 4 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');

    await onRegister(name, email, password);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">Create Admin Account</h2>
      <p className="text-sm text-gray-500 mb-4">Set up your super admin account to get started.</p>
      <div className="space-y-4">
        <Input label="Full Name" required value={formData.name} onChange={handleChange('name')} placeholder="Enter your full name" />
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="Enter your email" />
        <Input label="Password" required type="password" value={formData.password} onChange={handleChange('password')} placeholder="Create a password" />
        <Input label="Confirm Password" required type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Confirm your password" />
        <Button onClick={handleSubmit} className="w-full">Create Account</Button>
      </div>
    </div>
  );
};
