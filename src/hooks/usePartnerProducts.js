import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const usePartnerProducts = () => {
  const [partnerProducts, setPartnerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartnerProducts();
  }, []);

  const fetchPartnerProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartnerProducts(data || []);
    } catch (error) {
      console.error('Error fetching partner products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPartnerProduct = useCallback((partnerId) => {
    return partnerProducts.find(p => p.partner_id === partnerId) || null;
  }, [partnerProducts]);

  const savePartnerProduct = useCallback(async (partnerId, productData) => {
    try {
      const existing = partnerProducts.find(p => p.partner_id === partnerId);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('partner_products')
          .update(productData)
          .eq('partner_id', partnerId)
          .select()
          .single();

        if (error) throw error;
        setPartnerProducts(prev => prev.map(p => p.partner_id === partnerId ? data : p));
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('partner_products')
          .insert([{ ...productData, partner_id: partnerId }])
          .select()
          .single();

        if (error) throw error;
        setPartnerProducts(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error saving partner product:', error);
      alert('Error saving product');
      return null;
    }
  }, [partnerProducts]);

  const deletePartnerProduct = useCallback(async (partnerId) => {
    try {
      const { error } = await supabase
        .from('partner_products')
        .delete()
        .eq('partner_id', partnerId);

      if (error) throw error;
      setPartnerProducts(prev => prev.filter(p => p.partner_id !== partnerId));
    } catch (error) {
      console.error('Error deleting partner product:', error);
      alert('Error deleting product');
    }
  }, []);

  return {
    partnerProducts,
    isLoading,
    getPartnerProduct,
    savePartnerProduct,
    deletePartnerProduct,
    refetch: fetchPartnerProducts,
  };
};
