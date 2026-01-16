import React from 'react';

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
  </div>
);
