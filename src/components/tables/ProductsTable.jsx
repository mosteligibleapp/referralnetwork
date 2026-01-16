import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui';

export const ProductsTable = ({ products, productPartners, partners, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Partners</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products.map(product => {
          const partnerIds = productPartners[product.id] || [];
          const partnerNames = partnerIds
            .map(id => partners.find(p => p.id === id)?.name)
            .filter(Boolean);

          return (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{product.description || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                {product.url ? (
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {product.url}
                  </a>
                ) : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {partnerNames.length > 0 ? (
                  <span title={partnerNames.join(', ')}>
                    {partnerNames.length} partner{partnerNames.length !== 1 ? 's' : ''}
                  </span>
                ) : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
