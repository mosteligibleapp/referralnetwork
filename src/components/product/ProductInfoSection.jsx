import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { ICPCard } from './ICPCard';
import { CommissionCard } from './CommissionCard';
import { QualifyingChecklist } from './QualifyingChecklist';

export const ProductInfoSection = ({ products, getDocumentsByProduct }) => {
  const [expandedProducts, setExpandedProducts] = useState({});

  const toggleProduct = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Products to Promote</h3>
      <div className="space-y-3">
        {products.map(product => {
          const isExpanded = expandedProducts[product.id];
          const documents = getDocumentsByProduct(product.id);

          return (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleProduct(product.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">{product.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Product Description */}
                  {product.description && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Description</h4>
                      <p className="text-sm text-gray-700">{product.description}</p>
                    </div>
                  )}

                  {/* ICP Cards Grid */}
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ideal Customer Profile</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <ICPCard
                        icon="🏢"
                        title="Company Type"
                        value="Mid-size businesses"
                      />
                      <ICPCard
                        icon="🏭"
                        title="Best Industries"
                        value="Tech, Construction, Finance, Manufacturing, Healthcare"
                      />
                      <ICPCard
                        icon="🎯"
                        title="Sweet Spot"
                        value="50-1,000 employees"
                      />
                    </div>
                  </div>

                  {/* Commission Structure */}
                  <div className="mt-4">
                    <CommissionCard />
                  </div>

                  {/* Qualifying Checklist */}
                  <QualifyingChecklist />

                  {/* Product URL */}
                  {product.url && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Product Link</h4>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {product.url}
                      </a>
                    </div>
                  )}

                  {/* Documents */}
                  {documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Documents</h4>
                      <div className="space-y-2">
                        {documents.map(doc => (
                          <a
                            key={doc.id}
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Download className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-700 flex-1 truncate">{doc.file_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
