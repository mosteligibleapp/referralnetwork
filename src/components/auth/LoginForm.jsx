import React, { useState } from 'react';
import { Button, Input } from '../ui';

export const LoginForm = ({ adminName, onLogin, onChangePassword }) => {
  const [password, setPassword] = useState('');

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome back, {adminName.split(' ')[0]}!</h2>
      <div className="space-y-4">
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <Button onClick={() => onLogin(password)} className="w-full">Login</Button>
        <button onClick={onChangePassword} className="w-full text-sm text-gray-500 hover:text-gray-700">
          Change Password
        </button>
      </div>
    </div>
  );
};
