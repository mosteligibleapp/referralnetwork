import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useLeads = () => {
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
