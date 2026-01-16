import React, { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Users, Package, Save } from 'lucide-react';
import { Button, Input, TextArea, Header, TabNav, EmptyState } from '../ui';
import { LeadForm } from '../forms';
import { LeadsTable } from '../tables';
import { ProductInfoSection } from '../product';
import { INITIAL_PARTNER_PRODUCT_FORM } from '../../constants';

export const PartnerView = ({ partner, leads, products, getDocumentsByProduct, adminName, getPartnerById, partnerProduct, onSavePartnerProduct, onLogout, onAddLead, onEditLead, onDeleteLead }) => {
  const [activeTab, setActiveTab] = useState('leads');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [productForm, setProductForm] = useState(partnerProduct || INITIAL_PARTNER_PRODUCT_FORM);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Update product form when partnerProduct changes
  useEffect(() => {
    if (partnerProduct) {
      setProductForm(partnerProduct);
    }
  }, [partnerProduct]);

  const handleSaveLead = async (leadData) => {
    if (editingLead) {
      await onEditLead(editingLead.id, leadData);
    } else {
      await onAddLead(leadData);
    }
    setShowLeadForm(false);
    setEditingLead(null);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (confirm('Delete this lead?')) {
      await onDeleteLead(leadId);
    }
  };

  const handleProductChange = (field) => (e) => {
    setProductForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name?.trim()) {
      alert('Product name is required');
      return;
    }
    setIsSavingProduct(true);
    try {
      await onSavePartnerProduct({
        name: productForm.name.trim(),
        description: productForm.description?.trim() || '',
        url: productForm.url?.trim() || '',
      });
      alert('Product saved successfully!');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Helper to get owner name
  const getOwnerName = (lead) => {
    if (lead.owner_type === 'superadmin') {
      return adminName || 'Admin';
    }
    if (getPartnerById) {
      const ownerPartner = getPartnerById(lead.owner_id);
      return ownerPartner?.name || partner.name;
    }
    return partner.name;
  };

  // Helper to get product name for a lead
  const getProductName = () => {
    // Use first available product if there are any
    return products.length > 0 ? products[0].name : '-';
  };

  const tabs = [
    { id: 'leads', label: 'My Leads', icon: FileSpreadsheet },
    { id: 'myProduct', label: 'My Product', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Partner Portal" subtitle={`Welcome, ${partner.name}`} onLogout={onLogout} />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-6">
        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                    <p className="text-sm text-gray-500">Total Leads</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {leads.filter(l => l.status === 'introduced' || l.status === 'won').length}
                    </p>
                    <p className="text-sm text-gray-500">Total Introductions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">$</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${leads.filter(l => l.status === 'won').length * 500}
                    </p>
                    <p className="text-sm text-gray-500">Commission Earned</p>
                  </div>
                </div>
              </div>
            </div>

            <ProductInfoSection products={products} getDocumentsByProduct={getDocumentsByProduct} />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {leads.length} Lead{leads.length !== 1 ? 's' : ''}
              </h2>
              <Button onClick={() => { setEditingLead(null); setShowLeadForm(true); }}>
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>

            {leads.length === 0 ? (
              <EmptyState icon={FileSpreadsheet} title="No leads yet" description="Add your first lead to get started" />
            ) : (
              <LeadsTable
                leads={leads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                getOwnerName={getOwnerName}
                showProductColumn={true}
                getProductName={getProductName}
              />
            )}
          </>
        )}

        {/* My Product Tab */}
        {activeTab === 'myProduct' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Submit Your Product</h2>
            <p className="text-sm text-gray-500 mb-6">
              Share a product you'd like us to promote to our network. You can submit one product.
            </p>

            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  required
                  value={productForm.name || ''}
                  onChange={handleProductChange('name')}
                  placeholder="Enter your product name"
                />
                <TextArea
                  label="Description"
                  value={productForm.description || ''}
                  onChange={handleProductChange('description')}
                  rows={4}
                  placeholder="Describe your product and why it would be valuable to our network..."
                />
                <Input
                  label="Product URL"
                  type="url"
                  value={productForm.url || ''}
                  onChange={handleProductChange('url')}
                  placeholder="https://your-product-website.com"
                />
                <div className="pt-2">
                  <Button onClick={handleSaveProduct} disabled={isSavingProduct}>
                    <Save className="w-4 h-4" />
                    {isSavingProduct ? 'Saving...' : (partnerProduct ? 'Update Product' : 'Submit Product')}
                  </Button>
                </div>
              </div>

              {partnerProduct && (
                <p className="text-xs text-gray-400 mt-4">
                  Last updated: {new Date(partnerProduct.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {showLeadForm && (
        <LeadForm
          lead={editingLead}
          onSave={handleSaveLead}
          onClose={() => { setShowLeadForm(false); setEditingLead(null); }}
        />
      )}
    </div>
  );
};
