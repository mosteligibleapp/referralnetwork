import React from 'react';

export const QualifyingChecklist = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
    <div className="flex items-center gap-2 mb-3">
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium text-amber-800">Before You Refer, Confirm:</span>
    </div>
    <ul className="space-y-2">
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 rounded border-amber-300" />
        <span className="text-sm text-amber-900">Contact is a decision-maker (HR Director, Benefits Manager, or Payroll Admin)</span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 rounded border-amber-300" />
        <span className="text-sm text-amber-900">Company has 50-1,000 employees</span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 rounded border-amber-300" />
        <span className="text-sm text-amber-900">Company is in a target industry (Tech, Construction, Finance, Manufacturing, Healthcare)</span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 rounded border-amber-300" />
        <span className="text-sm text-amber-900">Contact has expressed interest or pain point related to HR/payroll</span>
      </li>
    </ul>
  </div>
);
