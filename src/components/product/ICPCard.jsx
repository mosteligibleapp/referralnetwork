import React from 'react';

export const ICPCard = ({ icon, title, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium text-gray-500 uppercase">{title}</span>
    </div>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);
