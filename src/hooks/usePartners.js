import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const usePartners = () => {
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
