import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui';

export const PartnersTable = ({ partners, leads, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Leads</th>
          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {partners.map(partner => (
          <tr key={partner.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-900">{partner.name}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{partner.email}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{partner.phone || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{partner.company || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{(leads[partner.id] || []).length}</td>
            <td className="px-6 py-4 text-right">
              <Button variant="ghost" size="sm" onClick={() => onEdit(partner)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(partner.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
