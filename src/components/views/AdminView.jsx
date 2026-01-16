import React, { useState, useCallback } from 'react';
import { Plus, Users, FileSpreadsheet, Package, UserCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button, Header, TabNav, EmptyState, Select } from '../ui';
import { PartnerForm, LeadForm, AdminLeadForm, ProductForm } from '../forms';
import { PartnersTable, LeadsTable, ProductsTable } from '../tables';
import { usePartners, useLeads, useProducts, usePartnerProducts } from '../../hooks';
import { OWNER_FILTER_OPTIONS } from '../../constants';

export const AdminView = ({ adminName, adminId, onLogout }) => {
  const { partners, addPartner, updatePartner, deletePartner, getPartnerById } = usePartners();
  const { leads, allLeads, addLead, updateLead, deleteLead, removePartnerLeads, getLeadsByOwnerFilter } = useLeads();
  const { products, productPartners, addProduct, updateProduct, deleteProduct, getDocumentsByProduct, getPartnersByProduct } = useProducts();
  const { partnerProducts } = usePartnerProducts();

  const [activeTab, setActiveTab] = useState('partners');
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [leadsViewMode, setLeadsViewMode] = useState('all'); // 'all' or 'byPartner'
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showAdminLeadForm, setShowAdminLeadForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const tabs = [
    { id: 'partners', label: 'Referral Partners', icon: Users },
    { id: 'leads', label: 'Leads', icon: FileSpreadsheet },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'partnerProducts', label: 'Partner Products', icon: UserCircle },
  ];

  const selectedPartner = getPartnerById(selectedPartnerId);

  // Helper to get owner name for a lead
  const getOwnerName = useCallback((lead) => {
    if (lead.owner_type === 'superadmin') {
      return adminName;
    }
    const partner = getPartnerById(lead.owner_id);
    return partner?.name || 'Unknown';
  }, [adminName, getPartnerById]);

  // Helper to get partner name by ID
  const getPartnerName = useCallback((partnerId) => {
    const partner = getPartnerById(partnerId);
    return partner?.name || 'Unknown';
  }, [getPartnerById]);

  // Get filtered leads for "All Leads" view
  const filteredLeads = getLeadsByOwnerFilter(ownerFilter, adminId);

  const handleAddPartner = async (partnerData) => {
    await addPartner(partnerData);
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleUpdatePartner = async (partnerData) => {
    await updatePartner(editingPartner.id, partnerData);
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleDeletePartner = async (partnerId) => {
    if (confirm('Delete this referral partner and all their leads?')) {
      await removePartnerLeads(partnerId);
      await deletePartner(partnerId);
    }
  };

  const handleSaveLead = async (leadData) => {
    if (editingLead) {
      await updateLead(selectedPartnerId, editingLead.id, leadData);
    } else {
      // Admin creating lead for specific partner (from partner view)
      await addLead(selectedPartnerId, leadData, 'superadmin', adminId);
    }
    setShowLeadForm(false);
    setEditingLead(null);
  };

  // Handle admin creating lead with partner selection
  const handleAdminSaveLead = async (leadData, partnerId) => {
    await addLead(partnerId, leadData, 'superadmin', adminId);
    setShowAdminLeadForm(false);
    setEditingLead(null);
  };

  const handleDeleteLead = async (leadId) => {
    if (confirm('Delete this lead?')) {
      await deleteLead(selectedPartnerId, leadId);
    }
  };

  // Delete lead from all leads view
  const handleDeleteLeadFromAll = async (lead) => {
    if (confirm('Delete this lead?')) {
      await deleteLead(lead.partner_id, lead.id);
    }
  };

  // Edit lead from all leads view
  const handleEditLeadFromAll = (lead) => {
    setSelectedPartnerId(lead.partner_id);
    setEditingLead(lead);
    setShowLeadForm(true);
    setLeadsViewMode('byPartner');
  };

  const handleSaveProduct = async (productData, partnerIds, files, removedDocIds) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData, partnerIds, files, removedDocIds);
    } else {
      await addProduct(productData, partnerIds, files);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Delete this product and all its documents?')) {
      await deleteProduct(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Referral Partner Management" subtitle={`${adminName} • Super Admin`} onLogout={onLogout} />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedPartnerId(null); }} />

      <main className="p-6">
        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Referral Partners Directory</h2>
              <Button onClick={() => { setEditingPartner(null); setShowPartnerForm(true); }}>
                <Plus className="w-4 h-4" />
                Add Partner
              </Button>
            </div>

            {partners.length === 0 ? (
              <EmptyState icon={Users} title="No referral partners yet" description="Add your first partner to get started" />
            ) : (
              <PartnersTable
                partners={partners}
                leads={leads}
                onEdit={(partner) => { setEditingPartner(partner); setShowPartnerForm(true); }}
                onDelete={handleDeletePartner}
              />
            )}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setLeadsViewMode('all'); setSelectedPartnerId(null); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    leadsViewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Leads
                </button>
                <button
                  onClick={() => setLeadsViewMode('byPartner')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    leadsViewMode === 'byPartner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  By Partner
                </button>
              </div>
            </div>

            {/* All Leads View */}
            {leadsViewMode === 'all' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-medium text-gray-900">All Leads</h2>
                    <select
                      value={ownerFilter}
                      onChange={(e) => setOwnerFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {OWNER_FILTER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-500">{filteredLeads.length} leads</span>
                  </div>
                  <Button onClick={() => { setEditingLead(null); setShowAdminLeadForm(true); }}>
                    <Plus className="w-4 h-4" />
                    Create Lead
                  </Button>
                </div>

                {filteredLeads.length === 0 ? (
                  <EmptyState icon={FileSpreadsheet} title="No leads found" description="Create a lead or adjust your filter" />
                ) : (
                  <LeadsTable
                    leads={filteredLeads}
                    onEdit={handleEditLeadFromAll}
                    onDelete={(leadId) => {
                      const lead = filteredLeads.find(l => l.id === leadId);
                      if (lead) handleDeleteLeadFromAll(lead);
                    }}
                    getOwnerName={getOwnerName}
                    showPartnerColumn={true}
                    getPartnerName={getPartnerName}
                  />
                )}
              </div>
            )}

            {/* By Partner View - Partner Selection */}
            {leadsViewMode === 'byPartner' && !selectedPartnerId && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Select a Referral Partner</h2>
                {partners.length === 0 ? (
                  <EmptyState icon={FileSpreadsheet} title="No referral partners yet" description="Add partners in the Referral Partners tab first" />
                ) : (
                  <div className="grid gap-4">
                    {partners.map(partner => (
                      <button
                        key={partner.id}
                        onClick={() => setSelectedPartnerId(partner.id)}
                        className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{partner.name}</h3>
                          <p className="text-sm text-gray-500">{partner.company || partner.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{(leads[partner.id] || []).length} leads</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* By Partner View - Partner Leads */}
            {leadsViewMode === 'byPartner' && selectedPartnerId && selectedPartner && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" onClick={() => setSelectedPartnerId(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900">{selectedPartner.name}'s Leads</h2>
                    <p className="text-sm text-gray-500">{selectedPartner.company || selectedPartner.email}</p>
                  </div>
                  <Button onClick={() => { setEditingLead(null); setShowLeadForm(true); }}>
                    <Plus className="w-4 h-4" />
                    Add Lead
                  </Button>
                </div>

                {(leads[selectedPartnerId] || []).length === 0 ? (
                  <EmptyState icon={FileSpreadsheet} title="No leads yet for this partner" description="Add leads to start tracking" />
                ) : (
                  <LeadsTable
                    leads={leads[selectedPartnerId] || []}
                    onEdit={(lead) => { setEditingLead(lead); setShowLeadForm(true); }}
                    onDelete={handleDeleteLead}
                    getOwnerName={getOwnerName}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Products</h2>
              <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <EmptyState icon={Package} title="No products yet" description="Add your first product to get started" />
            ) : (
              <ProductsTable
                products={products}
                productPartners={productPartners}
                partners={partners}
                onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>
        )}

        {/* Partner Products Tab */}
        {activeTab === 'partnerProducts' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Partner-Submitted Products</h2>
            <p className="text-sm text-gray-500 mb-6">
              Products that referral partners want you to promote.
            </p>

            {partnerProducts.length === 0 ? (
              <EmptyState icon={Package} title="No partner products yet" description="Partners can submit products they'd like promoted" />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Partner</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {partnerProducts.map(pp => {
                      const partnerInfo = getPartnerById(pp.partner_id);
                      return (
                        <tr key={pp.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {partnerInfo?.name || 'Unknown Partner'}
                            {partnerInfo?.company && (
                              <span className="text-gray-500 font-normal"> ({partnerInfo.company})</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pp.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{pp.description || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            {pp.url ? (
                              <a href={pp.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[200px]">
                                {pp.url}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {pp.created_at ? new Date(pp.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {showPartnerForm && (
        <PartnerForm
          partner={editingPartner}
          onSave={editingPartner ? handleUpdatePartner : handleAddPartner}
          onClose={() => { setShowPartnerForm(false); setEditingPartner(null); }}
        />
      )}

      {showLeadForm && selectedPartnerId && (
        <LeadForm
          lead={editingLead}
          onSave={handleSaveLead}
          onClose={() => { setShowLeadForm(false); setEditingLead(null); }}
        />
      )}

      {showAdminLeadForm && (
        <AdminLeadForm
          lead={null}
          partners={partners}
          onSave={handleAdminSaveLead}
          onClose={() => { setShowAdminLeadForm(false); setEditingLead(null); }}
        />
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          partners={partners}
          existingPartnerIds={editingProduct ? getPartnersByProduct(editingProduct.id) : []}
          existingDocuments={editingProduct ? getDocumentsByProduct(editingProduct.id) : []}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
};
