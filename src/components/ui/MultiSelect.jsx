import React from 'react';

export const MultiSelect = ({ label, options, selected, onChange, className = '' }) => {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
        {options.length === 0 ? (
          <p className="text-gray-400 text-sm p-1">No options available</p>
        ) : (
          options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{selected.length} selected</p>
      )}
    </div>
  );
};
