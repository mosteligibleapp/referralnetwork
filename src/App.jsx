import React, { useState } from 'react';
import { usePartners, useLeads, useProducts, usePartnerProducts } from './hooks';
import { LoginScreen } from './components/auth';
import { PartnerView, AdminView } from './components/views';

export default function App() {
  const [userType, setUserType] = useState(null);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminId, setAdminId] = useState(null);

  const { partners, getPartnerByEmail, getPartnerById } = usePartners();
  const { leads, addLead, updateLead, deleteLead, getLeadsByPartner } = useLeads();
  const { getProductsByPartner, getDocumentsByProduct } = useProducts();
  const { getPartnerProduct, savePartnerProduct } = usePartnerProducts();

  const handleLogout = () => {
    setUserType(null);
    setCurrentPartner(null);
  };

  const handlePartnerLogin = (email) => {
    const partner = getPartnerByEmail(email);
    if (partner) {
      setCurrentPartner(partner);
      setUserType('partner');
    } else {
      alert('No partner found with that email. Please contact the administrator.');
    }
  };

  const handleSuperadminLogin = (name, id) => {
    setAdminName(name);
    setAdminId(id);
    setUserType('superadmin');
  };

  // Login Screen
  if (!userType) {
    return (
      <LoginScreen
        onSuperadminLogin={handleSuperadminLogin}
        onPartnerLogin={handlePartnerLogin}
        hasPartners={partners.length > 0}
      />
    );
  }

  // Partner View
  if (userType === 'partner' && currentPartner) {
    return (
      <PartnerView
        partner={currentPartner}
        leads={getLeadsByPartner(currentPartner.id)}
        products={getProductsByPartner(currentPartner.id)}
        getDocumentsByProduct={getDocumentsByProduct}
        adminName={adminName}
        getPartnerById={getPartnerById}
        partnerProduct={getPartnerProduct(currentPartner.id)}
        onSavePartnerProduct={(productData) => savePartnerProduct(currentPartner.id, productData)}
        onLogout={handleLogout}
        onAddLead={(leadData) => addLead(currentPartner.id, leadData, 'partner', currentPartner.id)}
        onEditLead={(leadId, leadData) => updateLead(currentPartner.id, leadId, leadData)}
        onDeleteLead={(leadId) => deleteLead(currentPartner.id, leadId)}
      />
    );
  }

  // Admin View
  if (userType === 'superadmin') {
    return <AdminView adminName={adminName} adminId={adminId} onLogout={handleLogout} />;
  }

  return null;
}
