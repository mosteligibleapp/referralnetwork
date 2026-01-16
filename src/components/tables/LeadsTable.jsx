import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button, StatusBadge } from '../ui';

export const LeadsTable = ({ leads, onEdit, onDelete, getOwnerName, showPartnerColumn = false, getPartnerName, showProductColumn = false, getProductName }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
    <table className="w-full min-w-[1100px]">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
          {showPartnerColumn && (
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Partner</th>
          )}
          {showProductColumn && (
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
          )}
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Industry</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Headcount</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Commission</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
          <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {leads.map(lead => (
          <tr key={lead.id} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600 font-medium">
              {getOwnerName ? getOwnerName(lead) : '-'}
            </td>
            <td className="px-4 py-4 text-sm text-gray-900">{lead.name}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.email}</td>
            <td className="px-4 py-4 text-sm text-gray-500">
              {lead.company_url ? (
                <a href={lead.company_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {lead.company}
                </a>
              ) : lead.company}
            </td>
            {showPartnerColumn && (
              <td className="px-4 py-4 text-sm text-gray-500">
                {getPartnerName ? getPartnerName(lead.partner_id) : '-'}
              </td>
            )}
            {showProductColumn && (
              <td className="px-4 py-4 text-sm text-gray-500">
                {getProductName ? getProductName(lead) : '-'}
              </td>
            )}
            <td className="px-4 py-4 text-sm text-gray-500">{lead.title || '-'}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.industry || '-'}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.headcount || '-'}</td>
            <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
            <td className="px-4 py-4 text-sm">
              {lead.status === 'won' ? (
                <span className="text-green-600 font-medium">$500</span>
              ) : (
                <span className="text-gray-400">none</span>
              )}
            </td>
            <td className="px-4 py-4 text-sm text-gray-500">
              {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-4 text-right">
              <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(lead.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
