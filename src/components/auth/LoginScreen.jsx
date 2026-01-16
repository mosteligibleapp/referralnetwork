import React, { useState } from 'react';
import { ArrowLeft, Shield, UserCircle } from 'lucide-react';
import { Button, Input } from '../ui';
import { useAdminAuth } from '../../hooks';
import { RegistrationForm } from './RegistrationForm';
import { LoginForm } from './LoginForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export const LoginScreen = ({ onSuperadminLogin, onPartnerLogin, hasPartners }) => {
  const [mode, setMode] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { adminData, isLoading, isRegistered, register, validateLogin, changePassword } = useAdminAuth();

  const handlePartnerSubmit = () => {
    if (!partnerEmail.trim()) {
      alert('Please enter your email');
      return;
    }
    onPartnerLogin(partnerEmail.trim());
  };

  const handleAdminLogin = (password) => {
    if (validateLogin(password)) {
      onSuperadminLogin(adminData.name, adminData.id);
    } else {
      alert('Invalid password');
    }
  };

  const handleRegister = async (name, email, password) => {
    const result = await register(name, email, password);
    if (result) {
      alert('Account created successfully! You can now log in.');
    }
  };

  const handlePasswordChange = async (email, oldPassword, newPassword) => {
    const success = await changePassword(email, oldPassword, newPassword);
    if (success) {
      setIsChangingPassword(false);
      alert('Password changed successfully!');
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Referral Partner Portal</h1>
          <p className="text-gray-500 mt-2">Select how you want to sign in</p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('superadmin')}
              className="w-full bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{isRegistered ? adminData.name : 'Super Admin'}</h3>
                <p className="text-sm text-gray-500">{isRegistered ? 'Super Admin' : 'Set up your account'}</p>
              </div>
            </button>

            <button
              onClick={() => setMode('partner')}
              className="w-full bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Referral Partner</h3>
                <p className="text-sm text-gray-500">Access your leads</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'superadmin' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={() => { setMode(null); setIsChangingPassword(false); }}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {!isRegistered && <RegistrationForm onRegister={handleRegister} />}

            {isRegistered && !isChangingPassword && (
              <LoginForm
                adminName={adminData.name}
                onLogin={handleAdminLogin}
                onChangePassword={() => setIsChangingPassword(true)}
              />
            )}

            {isRegistered && isChangingPassword && (
              <ChangePasswordForm
                adminEmail={adminData.email}
                onChangePassword={handlePasswordChange}
                onCancel={() => setIsChangingPassword(false)}
              />
            )}
          </div>
        )}

        {mode === 'partner' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button onClick={() => setMode(null)} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Partner Login</h2>
            {!hasPartners ? (
              <p className="text-gray-500 text-sm">No partners have been added yet. Please contact the administrator.</p>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Your Email"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                />
                <Button variant="success" onClick={handlePartnerSubmit} className="w-full">
                  Access My Leads
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
