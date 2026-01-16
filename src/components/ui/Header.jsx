import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './Button';

export const Header = ({ title, subtitle, onLogout }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {onLogout && (
      <Button variant="ghost" onClick={onLogout}>
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    )}
  </header>
);
