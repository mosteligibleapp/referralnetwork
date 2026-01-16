import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useProducts = () => {
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
