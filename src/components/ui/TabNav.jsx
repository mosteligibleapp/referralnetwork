import React from 'react';

export const TabNav = ({ tabs, activeTab, onTabChange }) => (
  <div className="bg-white border-b border-gray-200">
    <nav className="flex px-6 gap-8">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <tab.icon className="w-4 h-4 inline mr-2" />
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);
