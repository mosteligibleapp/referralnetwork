import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAdminAuth = () => {
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
