import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Plus, Edit2, Trash2, Users, FileSpreadsheet,
  ArrowLeft, Save, X, ChevronRight, LogOut, Shield, UserCircle,
  Package, Download, Upload, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import { supabase } from './lib/supabase';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: 'identified', label: 'Identified' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'won', label: 'Closed Won' },
  { value: 'lost', label: 'Closed Lost' },
];

const STATUS_COLORS = {
  identified: 'bg-gray-100 text-gray-700',
  introduced: 'bg-blue-100 text-blue-700',
  won: 'bg-green-700 text-white',
  lost: 'bg-red-100 text-red-700',
};

const INITIAL_LEAD_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  title: '',
  company_url: '',
  industry: '',
  headcount: '',
  status: 'identified',
  notes: '',
  partner_id: '',
  product_id: '',
  product_type: '', // 'assigned' or 'own'
};

const OWNER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Leads' },
  { value: 'superadmin', label: 'Created by me' },
  { value: 'partner', label: 'Created by partners' },
];

const INITIAL_PARTNER_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
};

const INITIAL_PRODUCT_FORM = {
  name: '',
  description: '',
  ideal_leads: '',
  url: '',
};

const INITIAL_PARTNER_PRODUCT_FORM = {
  name: '',
  description: '',
  ideal_leads: '',
  url: '',
};

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select industry...' },
  // Best Fit industries (starred)
  { value: 'Technology', label: '⭐ Technology', group: 'best' },
  { value: 'Construction', label: '⭐ Construction', group: 'best' },
  { value: 'Finance', label: '⭐ Finance', group: 'best' },
  { value: 'Manufacturing', label: '⭐ Manufacturing', group: 'best' },
  { value: 'Healthcare', label: '⭐ Healthcare', group: 'best' },
  // Other industries
  { value: 'Retail', label: 'Retail', group: 'other' },
  { value: 'Education', label: 'Education', group: 'other' },
  { value: 'Real Estate', label: 'Real Estate', group: 'other' },
  { value: 'Transportation', label: 'Transportation', group: 'other' },
  { value: 'Hospitality', label: 'Hospitality', group: 'other' },
  { value: 'Energy', label: 'Energy', group: 'other' },
  { value: 'Agriculture', label: 'Agriculture', group: 'other' },
  { value: 'Media', label: 'Media', group: 'other' },
  { value: 'Other', label: 'Other (specify below)', group: 'other' },
];

const HEADCOUNT_OPTIONS = [
  { value: '', label: 'Select headcount...' },
  { value: '50-99', label: '50-99' },
  { value: '100-249', label: '100-249' },
  { value: '250-499', label: '250-499' },
  { value: '500-1000', label: '500-1,000' },
  { value: '1000+', label: '1,000+' },
];

// ============================================================================
// CUSTOM HOOKS - SUPABASE
// ============================================================================

/**
 * Hook for managing partners data with Supabase
 */
const usePartners = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPartner = useCallback(async (partner) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert([partner])
        .select()
        .single();

      if (error) throw error;
      setPartners(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding partner:', error);
      alert('Error adding partner');
      return null;
    }
  }, []);

  const updatePartner = useCallback(async (partnerId, updates) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', partnerId)
        .select()
        .single();

      if (error) throw error;
      setPartners(prev => prev.map(p => p.id === partnerId ? data : p));
    } catch (error) {
      console.error('Error updating partner:', error);
      alert('Error updating partner');
    }
  }, []);

  const deletePartner = useCallback(async (partnerId) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;
      setPartners(prev => prev.filter(p => p.id !== partnerId));
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Error deleting partner');
    }
  }, []);

  const getPartnerById = useCallback((partnerId) => {
    return partners.find(p => p.id === partnerId);
  }, [partners]);

  const getPartnerByEmail = useCallback((email) => {
    return partners.find(p => p.email.toLowerCase() === email.toLowerCase());
  }, [partners]);

  return {
    partners,
    isLoading,
    addPartner,
    updatePartner,
    deletePartner,
    getPartnerById,
    getPartnerByEmail,
    refetch: fetchPartners,
  };
};

/**
 * Hook for managing leads data with Supabase
 */
const useLeads = () => {
  const [leads, setLeads] = useState({});
  const [allLeads, setAllLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllLeads(data || []);

      const groupedLeads = (data || []).reduce((acc, lead) => {
        const partnerId = lead.partner_id;
        if (!acc[partnerId]) acc[partnerId] = [];
        acc[partnerId].push(lead);
        return acc;
      }, {});

      setLeads(groupedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLead = useCallback(async (partnerId, lead, ownerType, ownerId) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...lead,
          partner_id: partnerId,
          owner_type: ownerType,
          owner_id: ownerId,
        }])
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => ({
        ...prev,
        [partnerId]: [data, ...(prev[partnerId] || [])],
      }));
      setAllLeads(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead');
      return null;
    }
  }, []);

  const updateLead = useCallback(async (partnerId, leadId, updates) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => ({
        ...prev,
        [partnerId]: (prev[partnerId] || []).map(l => l.id === leadId ? data : l),
      }));
      setAllLeads(prev => prev.map(l => l.id === leadId ? data : l));
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead');
    }
  }, []);

  const deleteLead = useCallback(async (partnerId, leadId) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => ({
        ...prev,
        [partnerId]: (prev[partnerId] || []).filter(l => l.id !== leadId),
      }));
      setAllLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead');
    }
  }, []);

  const getLeadsByPartner = useCallback((partnerId) => {
    return leads[partnerId] || [];
  }, [leads]);

  const getLeadsByOwnerFilter = useCallback((filter, adminId) => {
    if (filter === 'all') return allLeads;
    if (filter === 'superadmin') return allLeads.filter(l => l.owner_type === 'superadmin' && l.owner_id === adminId);
    if (filter === 'partner') return allLeads.filter(l => l.owner_type === 'partner');
    return allLeads;
  }, [allLeads]);

  const removePartnerLeads = useCallback(async (partnerId) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('partner_id', partnerId);

      if (error) throw error;

      setLeads(prev => {
        const newLeads = { ...prev };
        delete newLeads[partnerId];
        return newLeads;
      });
      setAllLeads(prev => prev.filter(l => l.partner_id !== partnerId));
    } catch (error) {
      console.error('Error removing partner leads:', error);
    }
  }, []);

  return {
    leads,
    allLeads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByPartner,
    getLeadsByOwnerFilter,
    removePartnerLeads,
    refetch: fetchAllLeads,
  };
};

/**
 * Hook for managing partner-submitted products (products partners want promoted)
 * Now supports multiple products per partner with document uploads
 */
const usePartnerProducts = () => {
  const [partnerProducts, setPartnerProducts] = useState([]);
  const [partnerProductDocuments, setPartnerProductDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch partner products
      const { data: productsData, error: productsError } = await supabase
        .from('partner_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setPartnerProducts(productsData || []);

      // Fetch partner product documents
      const { data: docsData, error: docsError } = await supabase
        .from('partner_product_documents')
        .select('*')
        .order('created_at', { ascending: true });

      if (!docsError && docsData) {
        const groupedDocs = docsData.reduce((acc, doc) => {
          if (!acc[doc.partner_product_id]) acc[doc.partner_product_id] = [];
          acc[doc.partner_product_id].push(doc);
          return acc;
        }, {});
        setPartnerProductDocuments(groupedDocs);
      }
    } catch (error) {
      console.error('Error fetching partner products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all products for a specific partner (returns array)
  const getPartnerProducts = useCallback((partnerId) => {
    return partnerProducts.filter(p => p.partner_id === partnerId);
  }, [partnerProducts]);

  // Legacy: get single partner product (for backwards compatibility)
  const getPartnerProduct = useCallback((partnerId) => {
    return partnerProducts.find(p => p.partner_id === partnerId) || null;
  }, [partnerProducts]);

  // Get documents for a partner product
  const getPartnerProductDocuments = useCallback((productId) => {
    return partnerProductDocuments[productId] || [];
  }, [partnerProductDocuments]);

  // Add a new partner product with optional files
  const addPartnerProduct = useCallback(async (partnerId, productData, files = []) => {
    try {
      // Create product
      const { data: productResult, error: productError } = await supabase
        .from('partner_products')
        .insert([{ ...productData, partner_id: partnerId }])
        .select()
        .single();

      if (productError) throw productError;

      // Upload documents
      const uploadedDocs = [];
      for (const file of files) {
        const fileName = `partner-products/${productResult.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-documents')
          .getPublicUrl(fileName);

        const { data: docData, error: docError } = await supabase
          .from('partner_product_documents')
          .insert([{
            partner_product_id: productResult.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (docError) throw docError;
        uploadedDocs.push(docData);
      }

      // Update local state
      setPartnerProducts(prev => [productResult, ...prev]);
      if (uploadedDocs.length > 0) {
        setPartnerProductDocuments(prev => ({ ...prev, [productResult.id]: uploadedDocs }));
      }

      return productResult;
    } catch (error) {
      console.error('Error adding partner product:', error);
      alert('Error adding product: ' + error.message);
      return null;
    }
  }, []);

  // Update an existing partner product
  const updatePartnerProduct = useCallback(async (productId, productData, newFiles = [], removedDocIds = []) => {
    try {
      // Update product
      const { data: productResult, error: productError } = await supabase
        .from('partner_products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (productError) throw productError;

      // Remove documents
      for (const docId of removedDocIds) {
        const doc = (partnerProductDocuments[productId] || []).find(d => d.id === docId);
        if (doc) {
          const filePath = doc.file_url.split('/product-documents/')[1];
          if (filePath) {
            await supabase.storage.from('product-documents').remove([filePath]);
          }
          await supabase.from('partner_product_documents').delete().eq('id', docId);
        }
      }

      // Upload new documents
      const uploadedDocs = [];
      for (const file of newFiles) {
        const fileName = `partner-products/${productId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-documents')
          .getPublicUrl(fileName);

        const { data: docData, error: docError } = await supabase
          .from('partner_product_documents')
          .insert([{
            partner_product_id: productId,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (docError) throw docError;
        uploadedDocs.push(docData);
      }

      // Update local state
      setPartnerProducts(prev => prev.map(p => p.id === productId ? productResult : p));
      setPartnerProductDocuments(prev => ({
        ...prev,
        [productId]: [
          ...(prev[productId] || []).filter(d => !removedDocIds.includes(d.id)),
          ...uploadedDocs,
        ],
      }));

      return productResult;
    } catch (error) {
      console.error('Error updating partner product:', error);
      alert('Error updating product: ' + error.message);
      return null;
    }
  }, [partnerProductDocuments]);

  // Delete a partner product by ID
  const deletePartnerProduct = useCallback(async (productId) => {
    try {
      // Delete documents from storage
      const docs = partnerProductDocuments[productId] || [];
      for (const doc of docs) {
        const filePath = doc.file_url.split('/product-documents/')[1];
        if (filePath) {
          await supabase.storage.from('product-documents').remove([filePath]);
        }
      }

      // Delete product (cascades to documents)
      const { error } = await supabase
        .from('partner_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setPartnerProducts(prev => prev.filter(p => p.id !== productId));
      setPartnerProductDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[productId];
        return newDocs;
      });
    } catch (error) {
      console.error('Error deleting partner product:', error);
      alert('Error deleting product');
    }
  }, [partnerProductDocuments]);

  // Legacy: save partner product (for backwards compatibility, creates or updates)
  const savePartnerProduct = useCallback(async (partnerId, productData) => {
    const existing = partnerProducts.find(p => p.partner_id === partnerId);
    if (existing) {
      return updatePartnerProduct(existing.id, productData, [], []);
    } else {
      return addPartnerProduct(partnerId, productData, []);
    }
  }, [partnerProducts, addPartnerProduct, updatePartnerProduct]);

  return {
    partnerProducts,
    partnerProductDocuments,
    isLoading,
    getPartnerProduct,
    getPartnerProducts,
    getPartnerProductDocuments,
    addPartnerProduct,
    updatePartnerProduct,
    deletePartnerProduct,
    savePartnerProduct,
    refetch: fetchAll,
  };
};

/**
 * Hook for managing products with Supabase
 */
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [productPartners, setProductPartners] = useState({});
  const [productDocuments, setProductDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch product-partner assignments
      const { data: ppData, error: ppError } = await supabase
        .from('product_partners')
        .select('*');

      if (ppError) throw ppError;

      const groupedPP = (ppData || []).reduce((acc, pp) => {
        if (!acc[pp.product_id]) acc[pp.product_id] = [];
        acc[pp.product_id].push(pp.partner_id);
        return acc;
      }, {});
      setProductPartners(groupedPP);

      // Fetch product documents
      const { data: docsData, error: docsError } = await supabase
        .from('product_documents')
        .select('*')
        .order('created_at', { ascending: true });

      if (docsError) throw docsError;

      const groupedDocs = (docsData || []).reduce((acc, doc) => {
        if (!acc[doc.product_id]) acc[doc.product_id] = [];
        acc[doc.product_id].push(doc);
        return acc;
      }, {});
      setProductDocuments(groupedDocs);

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = useCallback(async (product, partnerIds, files) => {
    try {
      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (productError) throw productError;

      // Assign partners
      if (partnerIds.length > 0) {
        const ppInserts = partnerIds.map(partnerId => ({
          product_id: productData.id,
          partner_id: partnerId,
        }));
        const { error: ppError } = await supabase
          .from('product_partners')
          .insert(ppInserts);
        if (ppError) throw ppError;
      }

      // Upload documents
      const uploadedDocs = [];
      for (const file of files) {
        const fileName = `${productData.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-documents')
          .getPublicUrl(fileName);

        const { data: docData, error: docError } = await supabase
          .from('product_documents')
          .insert([{
            product_id: productData.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (docError) throw docError;
        uploadedDocs.push(docData);
      }

      // Update local state
      setProducts(prev => [productData, ...prev]);
      setProductPartners(prev => ({ ...prev, [productData.id]: partnerIds }));
      setProductDocuments(prev => ({ ...prev, [productData.id]: uploadedDocs }));

      return productData;
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
      return null;
    }
  }, []);

  const updateProduct = useCallback(async (productId, product, partnerIds, newFiles, removedDocIds) => {
    try {
      // Update product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .update(product)
        .eq('id', productId)
        .select()
        .single();

      if (productError) throw productError;

      // Update partner assignments - delete all and re-insert
      await supabase
        .from('product_partners')
        .delete()
        .eq('product_id', productId);

      if (partnerIds.length > 0) {
        const ppInserts = partnerIds.map(partnerId => ({
          product_id: productId,
          partner_id: partnerId,
        }));
        await supabase.from('product_partners').insert(ppInserts);
      }

      // Remove documents
      for (const docId of removedDocIds) {
        const doc = (productDocuments[productId] || []).find(d => d.id === docId);
        if (doc) {
          const filePath = doc.file_url.split('/product-documents/')[1];
          if (filePath) {
            await supabase.storage.from('product-documents').remove([filePath]);
          }
          await supabase.from('product_documents').delete().eq('id', docId);
        }
      }

      // Upload new documents
      const uploadedDocs = [];
      for (const file of newFiles) {
        const fileName = `${productId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-documents')
          .getPublicUrl(fileName);

        const { data: docData, error: docError } = await supabase
          .from('product_documents')
          .insert([{
            product_id: productId,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (docError) throw docError;
        uploadedDocs.push(docData);
      }

      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? productData : p));
      setProductPartners(prev => ({ ...prev, [productId]: partnerIds }));
      setProductDocuments(prev => ({
        ...prev,
        [productId]: [
          ...(prev[productId] || []).filter(d => !removedDocIds.includes(d.id)),
          ...uploadedDocs,
        ],
      }));

      return productData;
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.message);
      return null;
    }
  }, [productDocuments]);

  const deleteProduct = useCallback(async (productId) => {
    try {
      // Delete documents from storage
      const docs = productDocuments[productId] || [];
      for (const doc of docs) {
        const filePath = doc.file_url.split('/product-documents/')[1];
        if (filePath) {
          await supabase.storage.from('product-documents').remove([filePath]);
        }
      }

      // Delete product (cascades to product_partners and product_documents)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      setProductPartners(prev => {
        const newPP = { ...prev };
        delete newPP[productId];
        return newPP;
      });
      setProductDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[productId];
        return newDocs;
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  }, [productDocuments]);

  const getProductsByPartner = useCallback((partnerId) => {
    return products.filter(product =>
      (productPartners[product.id] || []).includes(partnerId)
    );
  }, [products, productPartners]);

  const getDocumentsByProduct = useCallback((productId) => {
    return productDocuments[productId] || [];
  }, [productDocuments]);

  const getPartnersByProduct = useCallback((productId) => {
    return productPartners[productId] || [];
  }, [productPartners]);

  return {
    products,
    productPartners,
    productDocuments,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByPartner,
    getDocumentsByProduct,
    getPartnersByProduct,
    refetch: fetchAll,
  };
};

/**
 * Hook for admin authentication with Supabase
 */
const useAdminAuth = () => {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAdminData(data);
    } catch (error) {
      console.error('Error fetching admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = useCallback(async (name, email, password) => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .insert([{
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }])
        .select()
        .single();

      if (error) throw error;
      setAdminData(data);
      return data;
    } catch (error) {
      console.error('Error registering admin:', error);
      alert('Error creating account');
      return null;
    }
  }, []);

  const validateLogin = useCallback((password) => {
    return adminData && adminData.password === password;
  }, [adminData]);

  const changePassword = useCallback(async (email, oldPassword, newPassword) => {
    if (!adminData) return false;
    if (email.trim().toLowerCase() !== adminData.email) return false;
    if (oldPassword !== adminData.password) return false;

    try {
      const { error } = await supabase
        .from('admin')
        .update({ password: newPassword })
        .eq('id', adminData.id);

      if (error) throw error;
      setAdminData(prev => ({ ...prev, password: newPassword }));
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }, [adminData]);

  return {
    adminData,
    isLoading,
    isRegistered: !!adminData,
    register,
    validateLogin,
    changePassword,
  };
};

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'text-gray-500 hover:text-gray-700',
    danger: 'text-gray-400 hover:text-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, required, error, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <input
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, required, options, className = '', ...props }) => (
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

const SelectWithOptGroups = ({ label, required, options, className = '', hint, ...props }) => {
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

const TextArea = ({ label, required, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
    )}
    <textarea
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

const MultiSelect = ({ label, options, selected, onChange, className = '' }) => {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
        {options.length === 0 ? (
          <p className="text-gray-400 text-sm p-1">No options available</p>
        ) : (
          options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{selected.length} selected</p>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className={`bg-white rounded-lg w-full ${sizes[size]} my-8`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
  const label = statusOption?.label || status || 'Identified';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.identified}`}>
      {label}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
  </div>
);

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true, count, actionButton }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-150 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-gray-500">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actionButton && isOpen && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionButton}
            </div>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
};

const Header = ({ title, subtitle, onLogout }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {onLogout && (
      <Button variant="ghost" onClick={onLogout}>
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    )}
  </header>
);

const TabNav = ({ tabs, activeTab, onTabChange }) => (
  <div className="bg-white border-b border-gray-200">
    <nav className="flex px-6 gap-8">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <tab.icon className="w-4 h-4 inline mr-2" />
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

// ============================================================================
// FORM COMPONENTS
// ============================================================================

const PartnerForm = ({ partner, onSave, onClose }) => {
  const [formData, setFormData] = useState(partner || INITIAL_PARTNER_FORM);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and Email are required');
      return;
    }
    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      company: formData.company?.trim() || '',
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={partner ? 'Edit Partner' : 'Add Partner'}>
      <div className="space-y-4">
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Partner name"
        />
        <div>
          <Input
            label="Email"
            required
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="partner@example.com"
          />
          <p className="text-xs text-gray-400 mt-1">Partners will use this email to log in</p>
        </div>
        <Input
          label="Phone"
          type="tel"
          value={formData.phone || ''}
          onChange={handleChange('phone')}
          placeholder="(555) 123-4567"
        />
        <Input
          label="Company"
          value={formData.company || ''}
          onChange={handleChange('company')}
          placeholder="Company name"
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const LeadForm = ({ lead, onSave, onClose, assignedProducts = [], ownProducts = [] }) => {
  const [formData, setFormData] = useState(lead || INITIAL_LEAD_FORM);
  const [showOtherIndustry, setShowOtherIndustry] = useState(lead?.industry === 'Other' || false);
  const [otherIndustry, setOtherIndustry] = useState('');
  const [selectedProductKey, setSelectedProductKey] = useState(
    lead?.product_id ? `${lead.product_type}:${lead.product_id}` : ''
  );

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Handle "Other" industry selection
    if (field === 'industry') {
      setShowOtherIndustry(value === 'Other');
      if (value !== 'Other') {
        setOtherIndustry('');
      }
    }
  };

  const handleProductChange = (e) => {
    setSelectedProductKey(e.target.value);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Name, Email, and Company are required');
      return;
    }

    // Parse product selection
    let product_id = null;
    let product_type = null;
    if (selectedProductKey) {
      const [type, id] = selectedProductKey.split(':');
      product_type = type;
      product_id = id;
    }

    // Use otherIndustry if "Other" was selected
    const finalIndustry = formData.industry === 'Other' && otherIndustry.trim()
      ? otherIndustry.trim()
      : formData.industry?.trim() || '';

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      company: formData.company.trim(),
      title: formData.title?.trim() || '',
      company_url: formData.company_url?.trim() || '',
      industry: finalIndustry,
      headcount: formData.headcount || '',
      status: formData.status,
      notes: formData.notes?.trim() || '',
      product_id,
      product_type,
    });
  };

  // Build product options with optgroups
  const hasProducts = assignedProducts.length > 0 || ownProducts.length > 0;

  return (
    <Modal isOpen onClose={onClose} title={lead ? 'Edit Lead' : 'Add Lead'} size="lg">
      <div className="space-y-4">
        {/* ICP Reminder Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Best leads: HR/payroll decision-makers at mid-size companies</p>
              <p className="text-xs text-blue-600 mt-1">Target companies with 50-1,000 employees in Technology, Construction, Finance, Manufacturing, or Healthcare</p>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        {hasProducts && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product (for this lead)
            </label>
            <select
              value={selectedProductKey}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product...</option>
              {assignedProducts.length > 0 && (
                <optgroup label="Products to Promote">
                  {assignedProducts.map(p => (
                    <option key={`assigned:${p.id}`} value={`assigned:${p.id}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
              {ownProducts.length > 0 && (
                <optgroup label="My Products">
                  {ownProducts.map(p => (
                    <option key={`own:${p.id}`} value={`own:${p.id}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        <Input label="Name" required value={formData.name} onChange={handleChange('name')} placeholder="Contact name" />
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="contact@company.com" />
        <Input label="Phone" type="tel" value={formData.phone || ''} onChange={handleChange('phone')} placeholder="(555) 123-4567" />
        <Input label="Company" required value={formData.company} onChange={handleChange('company')} placeholder="Company name" />

        {/* Title field with updated placeholder and hint */}
        <div>
          <Input
            label="Title"
            value={formData.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. HR Director, Benefits Manager, Payroll Admin"
          />
          <p className="text-xs text-green-600 mt-1">Decision-makers convert best</p>
        </div>

        <Input label="Company URL" type="url" value={formData.company_url || ''} onChange={handleChange('company_url')} placeholder="https://company.com" />

        {/* Industry dropdown with optgroups */}
        <SelectWithOptGroups
          label="Industry"
          value={formData.industry || ''}
          onChange={handleChange('industry')}
          options={INDUSTRY_OPTIONS}
        />

        {/* Show text input if "Other" is selected */}
        {showOtherIndustry && (
          <Input
            label="Specify Industry"
            value={otherIndustry}
            onChange={(e) => setOtherIndustry(e.target.value)}
            placeholder="Enter the industry"
          />
        )}

        {/* Headcount dropdown */}
        <Select
          label="Headcount"
          value={formData.headcount || ''}
          onChange={handleChange('headcount')}
          options={HEADCOUNT_OPTIONS}
        />

        <Select label="Status" required value={formData.status} onChange={handleChange('status')} options={STATUS_OPTIONS} />
        <TextArea label="Notes" value={formData.notes || ''} onChange={handleChange('notes')} rows={3} placeholder="Additional notes..." />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1"><Save className="w-4 h-4" />Save</Button>
        </div>
      </div>
    </Modal>
  );
};

const AdminLeadForm = ({ lead, partners, onSave, onClose }) => {
  const [formData, setFormData] = useState(lead || INITIAL_LEAD_FORM);
  const [selectedPartnerId, setSelectedPartnerId] = useState(lead?.partner_id || '');
  const [showOtherIndustry, setShowOtherIndustry] = useState(lead?.industry === 'Other' || false);
  const [otherIndustry, setOtherIndustry] = useState('');

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Handle "Other" industry selection
    if (field === 'industry') {
      setShowOtherIndustry(value === 'Other');
      if (value !== 'Other') {
        setOtherIndustry('');
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedPartnerId) {
      alert('Please select a partner for this lead');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Name, Email, and Company are required');
      return;
    }

    // Use otherIndustry if "Other" was selected
    const finalIndustry = formData.industry === 'Other' && otherIndustry.trim()
      ? otherIndustry.trim()
      : formData.industry?.trim() || '';

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      company: formData.company.trim(),
      title: formData.title?.trim() || '',
      company_url: formData.company_url?.trim() || '',
      industry: finalIndustry,
      headcount: formData.headcount || '',
      status: formData.status,
      notes: formData.notes?.trim() || '',
    }, selectedPartnerId);
  };

  const partnerOptions = [
    { value: '', label: 'Select a partner...' },
    ...partners.map(p => ({ value: p.id, label: `${p.name} (${p.company || p.email})` })),
  ];

  return (
    <Modal isOpen onClose={onClose} title={lead ? 'Edit Lead' : 'Create Lead for Partner'} size="lg">
      <div className="space-y-4">
        {/* ICP Reminder Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Best leads: HR/payroll decision-makers at mid-size companies</p>
              <p className="text-xs text-blue-600 mt-1">Target companies with 50-1,000 employees in Technology, Construction, Finance, Manufacturing, or Healthcare</p>
            </div>
          </div>
        </div>

        <Select
          label="Assign to Partner"
          required
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
          options={partnerOptions}
        />
        <Input label="Name" required value={formData.name} onChange={handleChange('name')} placeholder="Contact name" />
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="contact@company.com" />
        <Input label="Phone" type="tel" value={formData.phone || ''} onChange={handleChange('phone')} placeholder="(555) 123-4567" />
        <Input label="Company" required value={formData.company} onChange={handleChange('company')} placeholder="Company name" />

        {/* Title field with updated placeholder and hint */}
        <div>
          <Input
            label="Title"
            value={formData.title || ''}
            onChange={handleChange('title')}
            placeholder="e.g. HR Director, Benefits Manager, Payroll Admin"
          />
          <p className="text-xs text-green-600 mt-1">Decision-makers convert best</p>
        </div>

        <Input label="Company URL" type="url" value={formData.company_url || ''} onChange={handleChange('company_url')} placeholder="https://company.com" />

        {/* Industry dropdown with optgroups */}
        <SelectWithOptGroups
          label="Industry"
          value={formData.industry || ''}
          onChange={handleChange('industry')}
          options={INDUSTRY_OPTIONS}
        />

        {/* Show text input if "Other" is selected */}
        {showOtherIndustry && (
          <Input
            label="Specify Industry"
            value={otherIndustry}
            onChange={(e) => setOtherIndustry(e.target.value)}
            placeholder="Enter the industry"
          />
        )}

        {/* Headcount dropdown */}
        <Select
          label="Headcount"
          value={formData.headcount || ''}
          onChange={handleChange('headcount')}
          options={HEADCOUNT_OPTIONS}
        />

        <Select label="Status" required value={formData.status} onChange={handleChange('status')} options={STATUS_OPTIONS} />
        <TextArea label="Notes" value={formData.notes || ''} onChange={handleChange('notes')} rows={3} placeholder="Additional notes..." />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1"><Save className="w-4 h-4" />Save</Button>
        </div>
      </div>
    </Modal>
  );
};

const ProductForm = ({ product, partners, existingPartnerIds, existingDocuments, onSave, onClose }) => {
  const [formData, setFormData] = useState(product || INITIAL_PRODUCT_FORM);
  const [selectedPartners, setSelectedPartners] = useState(existingPartnerIds || []);
  const [files, setFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState(existingDocuments || []);
  const [removedDocIds, setRemovedDocIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalDocs = existingDocs.length - removedDocIds.length + files.length + newFiles.length;
    if (totalDocs > 5) {
      alert('Maximum 5 documents allowed');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (docId) => {
    setRemovedDocIds(prev => [...prev, docId]);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          ideal_leads: formData.ideal_leads?.trim() || '',
          url: formData.url?.trim() || '',
        },
        selectedPartners,
        files,
        removedDocIds
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerOptions = partners.map(p => ({
    value: p.id,
    label: `${p.name} (${p.email})`,
  }));

  const currentDocsCount = existingDocs.length - removedDocIds.length + files.length;

  return (
    <Modal isOpen onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} size="lg">
      <div className="space-y-4">
        <Input
          label="Product Name"
          required
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Enter product name"
        />
        <TextArea
          label="Description"
          value={formData.description || ''}
          onChange={handleChange('description')}
          rows={3}
          placeholder="Describe the product..."
        />
        <TextArea
          label="Ideal Leads"
          value={formData.ideal_leads || ''}
          onChange={handleChange('ideal_leads')}
          rows={3}
          placeholder="Describe ideal lead characteristics..."
        />
        <Input
          label="Product URL"
          type="url"
          value={formData.url || ''}
          onChange={handleChange('url')}
          placeholder="https://example.com/product-info"
        />

        <MultiSelect
          label="Assign Partners"
          options={partnerOptions}
          selected={selectedPartners}
          onChange={setSelectedPartners}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documents ({currentDocsCount}/5)
          </label>

          {/* Existing documents */}
          {existingDocs.filter(d => !removedDocIds.includes(d.id)).map(doc => (
            <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1 truncate">{doc.file_name}</span>
              <button
                type="button"
                onClick={() => removeExistingDoc(doc.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* New files to upload */}
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded mb-2">
              <Upload className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {currentDocsCount < 5 && (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload documents</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4" />Save</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Partner Product Form - full featured form for partners to create/edit their products
const PartnerProductForm = ({ product, existingDocuments, onSave, onClose }) => {
  const [formData, setFormData] = useState(product || INITIAL_PARTNER_PRODUCT_FORM);
  const [files, setFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState(existingDocuments || []);
  const [removedDocIds, setRemovedDocIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalDocs = existingDocs.length - removedDocIds.length + files.length + newFiles.length;
    if (totalDocs > 5) {
      alert('Maximum 5 documents allowed');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (docId) => {
    setRemovedDocIds(prev => [...prev, docId]);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          ideal_leads: formData.ideal_leads?.trim() || '',
          url: formData.url?.trim() || '',
        },
        files,
        removedDocIds
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDocsCount = existingDocs.length - removedDocIds.length + files.length;

  return (
    <Modal isOpen onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} size="lg">
      <div className="space-y-4">
        <Input
          label="Product Name"
          required
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Enter your product name"
        />
        <TextArea
          label="Description"
          value={formData.description || ''}
          onChange={handleChange('description')}
          rows={3}
          placeholder="Describe your product..."
        />
        <TextArea
          label="Ideal Leads / Target Customers"
          value={formData.ideal_leads || ''}
          onChange={handleChange('ideal_leads')}
          rows={3}
          placeholder="Describe your ideal customer profile..."
        />
        <Input
          label="Product URL"
          type="url"
          value={formData.url || ''}
          onChange={handleChange('url')}
          placeholder="https://your-product-website.com"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documents ({currentDocsCount}/5)
          </label>

          {/* Existing documents */}
          {existingDocs.filter(d => !removedDocIds.includes(d.id)).map(doc => (
            <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1 truncate">{doc.file_name}</span>
              <button
                type="button"
                onClick={() => removeExistingDoc(doc.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* New files to upload */}
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded mb-2">
              <Upload className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {currentDocsCount < 5 && (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload documents</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4" />Save</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// TABLE COMPONENTS
// ============================================================================

const PartnersTable = ({ partners, leads, onEdit, onDelete }) => (
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

const LeadsTable = ({ leads, onEdit, onDelete, getOwnerName, showPartnerColumn = false, getPartnerName, showProductColumn = false, getProductName }) => (
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

const ProductsTable = ({ products, productPartners, partners, onEdit, onDelete }) => (
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

// ============================================================================
// PRODUCT INFO COMPONENT (FOR PARTNER VIEW)
// ============================================================================

// ICP Card component for displaying Ideal Customer Profile info
const ICPCard = ({ icon, title, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium text-gray-500 uppercase">{title}</span>
    </div>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

// Qualifying Checklist component
const QualifyingChecklist = () => (
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

const ProductInfoSection = ({ products, getDocumentsByProduct }) => {
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
                    <div className="grid grid-cols-2 gap-3">
                      <ICPCard
                        icon="🏢"
                        title="Company Type"
                        value="Mid-size businesses"
                      />
                      <ICPCard
                        icon="💰"
                        title="Commission"
                        value="$500 per closed deal"
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

// ============================================================================
// AUTH COMPONENTS
// ============================================================================

const RegistrationForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) return alert('Please enter your full name');
    if (!email.trim()) return alert('Please enter your email');
    if (!password.trim()) return alert('Please enter a password');
    if (password.length < 4) return alert('Password must be at least 4 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');

    await onRegister(name, email, password);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">Create Admin Account</h2>
      <p className="text-sm text-gray-500 mb-4">Set up your super admin account to get started.</p>
      <div className="space-y-4">
        <Input label="Full Name" required value={formData.name} onChange={handleChange('name')} placeholder="Enter your full name" />
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="Enter your email" />
        <Input label="Password" required type="password" value={formData.password} onChange={handleChange('password')} placeholder="Create a password" />
        <Input label="Confirm Password" required type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Confirm your password" />
        <Button onClick={handleSubmit} className="w-full">Create Account</Button>
      </div>
    </div>
  );
};

const LoginForm = ({ adminName, onLogin, onChangePassword }) => {
  const [password, setPassword] = useState('');

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome back, {adminName.split(' ')[0]}!</h2>
      <div className="space-y-4">
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <Button onClick={() => onLogin(password)} className="w-full">Login</Button>
        <button onClick={onChangePassword} className="w-full text-sm text-gray-500 hover:text-gray-700">
          Change Password
        </button>
      </div>
    </div>
  );
};

const ChangePasswordForm = ({ adminEmail, onChangePassword, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { email, oldPassword, newPassword, confirmNewPassword } = formData;

    if (!email.trim()) return alert('Please enter your email');
    if (email.trim().toLowerCase() !== adminEmail) return alert('Email does not match');
    if (!oldPassword.trim()) return alert('Please enter your current password');
    if (!newPassword.trim()) return alert('Please enter a new password');
    if (newPassword.length < 4) return alert('New password must be at least 4 characters');
    if (newPassword !== confirmNewPassword) return alert('New passwords do not match');

    const success = await onChangePassword(email, oldPassword, newPassword);
    if (!success) {
      alert('Current password is incorrect');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
      <div className="space-y-4">
        <Input label="Email" required type="email" value={formData.email} onChange={handleChange('email')} placeholder="Enter your email" />
        <Input label="Current Password" required type="password" value={formData.oldPassword} onChange={handleChange('oldPassword')} placeholder="Enter current password" />
        <Input label="New Password" required type="password" value={formData.newPassword} onChange={handleChange('newPassword')} placeholder="Enter new password" />
        <Input label="Confirm New Password" required type="password" value={formData.confirmNewPassword} onChange={handleChange('confirmNewPassword')} placeholder="Confirm new password" />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1">Update Password</Button>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onSuperadminLogin, onPartnerLogin, hasPartners }) => {
  const [mode, setMode] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { adminData, isLoading, isRegistered, register, validateLogin, changePassword } = useAdminAuth();

  const handlePartnerSubmit = () => {
    if (!partnerEmail.trim()) {
      alert('Please enter your email');
      return;
    }
    onPartnerLogin(partnerEmail.trim());
  };

  const handleAdminLogin = (password) => {
    if (validateLogin(password)) {
      onSuperadminLogin(adminData.name, adminData.id);
    } else {
      alert('Invalid password');
    }
  };

  const handleRegister = async (name, email, password) => {
    const result = await register(name, email, password);
    if (result) {
      alert('Account created successfully! You can now log in.');
    }
  };

  const handlePasswordChange = async (email, oldPassword, newPassword) => {
    const success = await changePassword(email, oldPassword, newPassword);
    if (success) {
      setIsChangingPassword(false);
      alert('Password changed successfully!');
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Referral Partner Portal</h1>
          <p className="text-gray-500 mt-2">Select how you want to sign in</p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('superadmin')}
              className="w-full bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{isRegistered ? adminData.name : 'Super Admin'}</h3>
                <p className="text-sm text-gray-500">{isRegistered ? 'Super Admin' : 'Set up your account'}</p>
              </div>
            </button>

            <button
              onClick={() => setMode('partner')}
              className="w-full bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Referral Partner</h3>
                <p className="text-sm text-gray-500">Access your leads</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'superadmin' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={() => { setMode(null); setIsChangingPassword(false); }}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {!isRegistered && <RegistrationForm onRegister={handleRegister} />}

            {isRegistered && !isChangingPassword && (
              <LoginForm
                adminName={adminData.name}
                onLogin={handleAdminLogin}
                onChangePassword={() => setIsChangingPassword(true)}
              />
            )}

            {isRegistered && isChangingPassword && (
              <ChangePasswordForm
                adminEmail={adminData.email}
                onChangePassword={handlePasswordChange}
                onCancel={() => setIsChangingPassword(false)}
              />
            )}
          </div>
        )}

        {mode === 'partner' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button onClick={() => setMode(null)} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Partner Login</h2>
            {!hasPartners ? (
              <p className="text-gray-500 text-sm">No partners have been added yet. Please contact the administrator.</p>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Your Email"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                />
                <Button variant="success" onClick={handlePartnerSubmit} className="w-full">
                  Access My Leads
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// VIEW COMPONENTS
// ============================================================================

const PartnerView = ({
  partner,
  leads,
  products, // assigned products from admin
  getDocumentsByProduct,
  adminName,
  getPartnerById,
  partnerProducts, // partner's own products
  getPartnerProductDocuments,
  onAddPartnerProduct,
  onUpdatePartnerProduct,
  onDeletePartnerProduct,
  onLogout,
  onAddLead,
  onEditLead,
  onDeleteLead,
}) => {
  const [activeTab, setActiveTab] = useState('products');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showPartnerProductForm, setShowPartnerProductForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [editingPartnerProduct, setEditingPartnerProduct] = useState(null);

  // Filter leads by product type
  const leadsForAssignedProducts = leads.filter(l => l.product_type === 'assigned' || (!l.product_type && !l.product_id));
  const leadsForOwnProducts = leads.filter(l => l.product_type === 'own');

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

  const handleSavePartnerProduct = async (productData, files, removedDocIds) => {
    if (editingPartnerProduct) {
      await onUpdatePartnerProduct(editingPartnerProduct.id, productData, files, removedDocIds);
    } else {
      await onAddPartnerProduct(productData, files);
    }
    setShowPartnerProductForm(false);
    setEditingPartnerProduct(null);
  };

  const handleEditPartnerProduct = (product) => {
    setEditingPartnerProduct(product);
    setShowPartnerProductForm(true);
  };

  const handleDeletePartnerProduct = async (productId) => {
    if (confirm('Delete this product and all its documents?')) {
      await onDeletePartnerProduct(productId);
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
  const getProductName = (lead) => {
    if (!lead.product_id) return '-';
    if (lead.product_type === 'assigned') {
      const product = products.find(p => p.id === lead.product_id);
      return product?.name || '-';
    }
    if (lead.product_type === 'own') {
      const product = partnerProducts.find(p => p.id === lead.product_id);
      return product?.name || '-';
    }
    return '-';
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'leads', label: 'Leads', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Partner Portal" subtitle={`Welcome, ${partner.name}`} onLogout={onLogout} />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-6">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Products to Promote Section */}
            <CollapsibleSection
              title="Products to Promote"
              icon={Package}
              count={products.length}
              defaultOpen={true}
            >
              {products.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products assigned yet</p>
                  <p className="text-sm text-gray-400 mt-1">Products will appear here when assigned by the admin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(product => {
                    const documents = getDocumentsByProduct(product.id);
                    return (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            {product.ideal_leads && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-gray-500">Ideal Leads: </span>
                                <span className="text-xs text-gray-600">{product.ideal_leads}</span>
                              </div>
                            )}
                            {product.url && (
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                View Product
                              </a>
                            )}
                            {documents.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {documents.map(doc => (
                                  <a
                                    key={doc.id}
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200"
                                  >
                                    <Download className="w-3 h-3" />
                                    {doc.file_name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>

            {/* My Products Section */}
            <CollapsibleSection
              title="My Products"
              icon={Package}
              count={partnerProducts.length}
              defaultOpen={true}
              actionButton={
                <Button size="sm" onClick={() => { setEditingPartnerProduct(null); setShowPartnerProductForm(true); }}>
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              }
            >
              {partnerProducts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products created yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your own products to promote</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {partnerProducts.map(product => {
                    const documents = getPartnerProductDocuments(product.id);
                    return (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            {product.ideal_leads && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-gray-500">Ideal Leads: </span>
                                <span className="text-xs text-gray-600">{product.ideal_leads}</span>
                              </div>
                            )}
                            {product.url && (
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                View Product
                              </a>
                            )}
                            {documents.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {documents.map(doc => (
                                  <a
                                    key={doc.id}
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200"
                                  >
                                    <Download className="w-3 h-3" />
                                    {doc.file_name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPartnerProduct(product)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeletePartnerProduct(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>
          </>
        )}

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

            {/* Leads for Assigned Products Section */}
            <CollapsibleSection
              title="Leads for Assigned Products"
              icon={FileSpreadsheet}
              count={leadsForAssignedProducts.length}
              defaultOpen={true}
              actionButton={
                <Button size="sm" onClick={() => { setEditingLead(null); setShowLeadForm(true); }}>
                  <Plus className="w-4 h-4" />
                  Add Lead
                </Button>
              }
            >
              {leadsForAssignedProducts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No leads for assigned products yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add leads for products assigned to you by the admin</p>
                </div>
              ) : (
                <LeadsTable
                  leads={leadsForAssignedProducts}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  getOwnerName={getOwnerName}
                  showProductColumn={true}
                  getProductName={getProductName}
                />
              )}
            </CollapsibleSection>

            {/* Leads for My Products Section */}
            <CollapsibleSection
              title="Leads for My Products"
              icon={FileSpreadsheet}
              count={leadsForOwnProducts.length}
              defaultOpen={true}
              actionButton={
                <Button size="sm" onClick={() => { setEditingLead(null); setShowLeadForm(true); }}>
                  <Plus className="w-4 h-4" />
                  Add Lead
                </Button>
              }
            >
              {leadsForOwnProducts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No leads for your products yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add leads for products you've created</p>
                </div>
              ) : (
                <LeadsTable
                  leads={leadsForOwnProducts}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  getOwnerName={getOwnerName}
                  showProductColumn={true}
                  getProductName={getProductName}
                />
              )}
            </CollapsibleSection>
          </>
        )}
      </main>

      {showLeadForm && (
        <LeadForm
          lead={editingLead}
          assignedProducts={products}
          ownProducts={partnerProducts}
          onSave={handleSaveLead}
          onClose={() => { setShowLeadForm(false); setEditingLead(null); }}
        />
      )}

      {showPartnerProductForm && (
        <PartnerProductForm
          product={editingPartnerProduct}
          existingDocuments={editingPartnerProduct ? getPartnerProductDocuments(editingPartnerProduct.id) : []}
          onSave={handleSavePartnerProduct}
          onClose={() => { setShowPartnerProductForm(false); setEditingPartnerProduct(null); }}
        />
      )}
    </div>
  );
};

const AdminView = ({ adminName, adminId, onLogout }) => {
  const { partners, addPartner, updatePartner, deletePartner, getPartnerById } = usePartners();
  const { leads, allLeads, addLead, updateLead, deleteLead, removePartnerLeads, getLeadsByOwnerFilter } = useLeads();
  const { products, productPartners, addProduct, updateProduct, deleteProduct, getDocumentsByProduct, getPartnersByProduct } = useProducts();
  const { partnerProducts, getPartnerProductDocuments } = usePartnerProducts();

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
              <div className="space-y-4">
                {partnerProducts.map(pp => {
                  const partnerInfo = getPartnerById(pp.partner_id);
                  const documents = getPartnerProductDocuments(pp.id);
                  return (
                    <div key={pp.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{pp.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              by {partnerInfo?.name || 'Unknown Partner'}
                              {partnerInfo?.company && ` (${partnerInfo.company})`}
                            </span>
                          </div>
                          {pp.description && (
                            <p className="text-sm text-gray-600 mt-1">{pp.description}</p>
                          )}
                          {pp.ideal_leads && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-500">Ideal Leads: </span>
                              <span className="text-xs text-gray-600">{pp.ideal_leads}</span>
                            </div>
                          )}
                          {pp.url && (
                            <a href={pp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                              View Product
                            </a>
                          )}
                          {documents.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {documents.map(doc => (
                                <a
                                  key={doc.id}
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200"
                                >
                                  <Download className="w-3 h-3" />
                                  {doc.file_name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {pp.created_at ? new Date(pp.created_at).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [userType, setUserType] = useState(null);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminId, setAdminId] = useState(null);

  const { partners, getPartnerByEmail, getPartnerById } = usePartners();
  const { leads, addLead, updateLead, deleteLead, getLeadsByPartner } = useLeads();
  const { getProductsByPartner, getDocumentsByProduct } = useProducts();
  const {
    getPartnerProducts,
    getPartnerProductDocuments,
    addPartnerProduct,
    updatePartnerProduct,
    deletePartnerProduct,
  } = usePartnerProducts();

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
        partnerProducts={getPartnerProducts(currentPartner.id)}
        getPartnerProductDocuments={getPartnerProductDocuments}
        onAddPartnerProduct={(productData, files) => addPartnerProduct(currentPartner.id, productData, files)}
        onUpdatePartnerProduct={(productId, productData, files, removedDocIds) => updatePartnerProduct(productId, productData, files, removedDocIds)}
        onDeletePartnerProduct={(productId) => deletePartnerProduct(productId)}
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
