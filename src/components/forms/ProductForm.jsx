import React, { useState } from 'react';
import { Save, X, Upload, FileText } from 'lucide-react';
import { Button, Input, TextArea, MultiSelect, Modal } from '../ui';
import { INITIAL_PRODUCT_FORM } from '../../constants';

export const ProductForm = ({ product, partners, existingPartnerIds, existingDocuments, onSave, onClose }) => {
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
