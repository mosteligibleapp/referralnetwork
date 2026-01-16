import React from 'react';
import { STATUS_OPTIONS, STATUS_COLORS } from '../../constants';

export const StatusBadge = ({ status }) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
  const label = statusOption?.label || status || 'Identified';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.identified}`}>
      {label}
    </span>
  );
};
