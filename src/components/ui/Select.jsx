import React from 'react';

export const Select = ({ label, required, options, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <select
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const SelectWithOptGroups = ({ label, required, options, className = '', hint, ...props }) => {
  const bestFitOptions = options.filter(opt => opt.group === 'best');
  const otherOptions = options.filter(opt => opt.group === 'other');
  const defaultOption = options.find(opt => !opt.group);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      >
        {defaultOption && <option value={defaultOption.value}>{defaultOption.label}</option>}
        {bestFitOptions.length > 0 && (
          <optgroup label="⭐ Best Fit">
            {bestFitOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label.replace('⭐ ', '')}</option>
            ))}
          </optgroup>
        )}
        {otherOptions.length > 0 && (
          <optgroup label="Other Industries">
            {otherOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </optgroup>
        )}
      </select>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
};
