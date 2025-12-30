import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Plus, Edit2, Trash2, Users, FileSpreadsheet,
  ArrowLeft, Save, X, ChevronRight, LogOut, Shield, UserCircle
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  PARTNERS: 'partners',
  LEADS: 'leads',
  ADMIN_DATA: 'adminData',
};

const STATUS_OPTIONS = [
  { value: 'identified', label: 'Identified' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_COLORS = {
  identified: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-blue-100 text-blue-700',
  introduced: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const INITIAL_LEAD_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  title: '',
  companyUrl: '',
  industry: '',
  headcount: '',
  status: 'identified',
  notes: '',
};

const INITIAL_PARTNER_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook for persistent storage operations
 */
const useStorage = (key, initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get(key);
        if (result?.value) {
          setData(JSON.parse(result.value));
        }
      } catch (e) {
        console.log(`No data for key: ${key}`);
      }
      setIsLoading(false);
    };
    loadData();
  }, [key]);

  const saveData = useCallback(async (newData) => {
    setData(newData);
    try {
      await window.storage.set(key, JSON.stringify(newData));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }, [key]);

  return { data, setData: saveData, isLoading };
};

/**
 * Hook for managing partners data
 */
const usePartners = () => {
  const { data: partners, setData: setPartners, isLoading } = useStorage(STORAGE_KEYS.PARTNERS, []);

  const addPartner = useCallback((partner) => {
    const newPartner = {
      id: Date.now().toString(),
      ...partner,
      createdAt: new Date().toISOString(),
    };
    setPartners([...partners, newPartner]);
    return newPartner;
  }, [partners, setPartners]);

  const updatePartner = useCallback((partnerId, updates) => {
    setPartners(partners.map(p => p.id === partnerId ? { ...p, ...updates } : p));
  }, [partners, setPartners]);

  const deletePartner = useCallback((partnerId) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  }, [partners, setPartners]);

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
  };
};

/**
 * Hook for managing leads data
 */
const useLeads = () => {
  const { data: leads, setData: setLeads, isLoading } = useStorage(STORAGE_KEYS.LEADS, {});

  const addLead = useCallback((partnerId, lead) => {
    const newLead = {
      id: Date.now().toString(),
      ...lead,
      createdAt: new Date().toISOString(),
    };
    setLeads({ ...leads, [partnerId]: [...(leads[partnerId] || []), newLead] });
    return newLead;
  }, [leads, setLeads]);

  const updateLead = useCallback((partnerId, leadId, updates) => {
    const partnerLeads = leads[partnerId] || [];
    setLeads({
      ...leads,
      [partnerId]: partnerLeads.map(l => l.id === leadId ? { ...l, ...updates } : l),
    });
  }, [leads, setLeads]);

  const deleteLead = useCallback((partnerId, leadId) => {
    const partnerLeads = leads[partnerId] || [];
    setLeads({ ...leads, [partnerId]: partnerLeads.filter(l => l.id !== leadId) });
  }, [leads, setLeads]);

  const getLeadsByPartner = useCallback((partnerId) => {
    return leads[partnerId] || [];
  }, [leads]);

  const initializePartnerLeads = useCallback((partnerId) => {
    if (!leads[partnerId]) {
      setLeads({ ...leads, [partnerId]: [] });
    }
  }, [leads, setLeads]);

  const removePartnerLeads = useCallback((partnerId) => {
    const newLeads = { ...leads };
    delete newLeads[partnerId];
    setLeads(newLeads);
  }, [leads, setLeads]);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByPartner,
    initializePartnerLeads,
    removePartnerLeads,
  };
};

/**
 * Hook for admin authentication
 */
const useAdminAuth = () => {
  const { data: adminData, setData: setAdminData, isLoading } = useStorage(STORAGE_KEYS.ADMIN_DATA, null);

  const register = useCallback(async (name, email, password) => {
    const newAdminData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    await setAdminData(newAdminData);
    return newAdminData;
  }, [setAdminData]);

  const validateLogin = useCallback((password) => {
    return adminData && adminData.password === password;
  }, [adminData]);

  const changePassword = useCallback(async (email, oldPassword, newPassword) => {
    if (!adminData) return false;
    if (email.trim().toLowerCase() !== adminData.email) return false;
    if (oldPassword !== adminData.password) return false;

    await setAdminData({ ...adminData, password: newPassword });
    return true;
  }, [adminData, setAdminData]);

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
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors';

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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md my-8">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.identified}`}>
    {status || 'identified'}
  </span>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
  </div>
);

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
      phone: formData.phone.trim(),
      company: formData.company.trim(),
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
          value={formData.phone}
          onChange={handleChange('phone')}
          placeholder="(555) 123-4567"
        />
        <Input
          label="Company"
          value={formData.company}
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

const LeadForm = ({ lead, onSave, onClose }) => {
  const [formData, setFormData] = useState(lead || INITIAL_LEAD_FORM);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Name, Email, and Company are required');
      return;
    }
    onSave({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim(),
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={lead ? 'Edit Lead' : 'Add Lead'}>
      <div className="space-y-4">
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Contact name"
        />
        <Input
          label="Email"
          required
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="contact@company.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          placeholder="(555) 123-4567"
        />
        <Input
          label="Company"
          required
          value={formData.company}
          onChange={handleChange('company')}
          placeholder="Company name"
        />
        <Input
          label="Title"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Job title"
        />
        <Input
          label="Company URL"
          type="url"
          value={formData.companyUrl}
          onChange={handleChange('companyUrl')}
          placeholder="https://company.com"
        />
        <Input
          label="Industry"
          value={formData.industry}
          onChange={handleChange('industry')}
          placeholder="e.g. Technology, Healthcare"
        />
        <Input
          label="Headcount"
          value={formData.headcount}
          onChange={handleChange('headcount')}
          placeholder="e.g. 50, 100-500"
        />
        <Select
          label="Status"
          required
          value={formData.status}
          onChange={handleChange('status')}
          options={STATUS_OPTIONS}
        />
        <TextArea
          label="Notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          rows={3}
          placeholder="Additional notes..."
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

const LeadsTable = ({ leads, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
    <table className="w-full min-w-[900px]">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Industry</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Headcount</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
          <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {leads.map(lead => (
          <tr key={lead.id} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-900">{lead.name}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.email}</td>
            <td className="px-4 py-4 text-sm text-gray-500">
              {lead.companyUrl ? (
                <a href={lead.companyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {lead.company}
                </a>
              ) : lead.company}
            </td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.title || '-'}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.industry || '-'}</td>
            <td className="px-4 py-4 text-sm text-gray-500">{lead.headcount || '-'}</td>
            <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
            <td className="px-4 py-4 text-sm text-gray-500">
              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
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
      onSuperadminLogin(adminData.name);
    } else {
      alert('Invalid password');
    }
  };

  const handleRegister = async (name, email, password) => {
    await register(name, email, password);
    alert('Account created successfully! You can now log in.');
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

const PartnerView = ({ partner, leads, onLogout, onAddLead, onEditLead, onDeleteLead }) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const handleSaveLead = (leadData) => {
    if (editingLead) {
      onEditLead(editingLead.id, leadData);
    } else {
      onAddLead(leadData);
    }
    setShowLeadForm(false);
    setEditingLead(null);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleDeleteLead = (leadId) => {
    if (confirm('Delete this lead?')) {
      onDeleteLead(leadId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="My Leads" subtitle={`Welcome, ${partner.name}`} onLogout={onLogout} />

      <main className="p-6">
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
          <LeadsTable leads={leads} onEdit={handleEditLead} onDelete={handleDeleteLead} />
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

const AdminView = ({ adminName, onLogout }) => {
  const { partners, addPartner, updatePartner, deletePartner, getPartnerById } = usePartners();
  const { leads, addLead, updateLead, deleteLead, initializePartnerLeads, removePartnerLeads } = useLeads();

  const [activeTab, setActiveTab] = useState('partners');
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

  const tabs = [
    { id: 'partners', label: 'Referral Partners', icon: Users },
    { id: 'leads', label: 'Leads', icon: FileSpreadsheet },
  ];

  const selectedPartner = getPartnerById(selectedPartnerId);

  const handleAddPartner = (partnerData) => {
    const newPartner = addPartner(partnerData);
    initializePartnerLeads(newPartner.id);
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleUpdatePartner = (partnerData) => {
    updatePartner(editingPartner.id, partnerData);
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleDeletePartner = (partnerId) => {
    if (confirm('Delete this referral partner and all their leads?')) {
      deletePartner(partnerId);
      removePartnerLeads(partnerId);
    }
  };

  const handleSaveLead = (leadData) => {
    if (editingLead) {
      updateLead(selectedPartnerId, editingLead.id, leadData);
    } else {
      addLead(selectedPartnerId, leadData);
    }
    setShowLeadForm(false);
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId) => {
    if (confirm('Delete this lead?')) {
      deleteLead(selectedPartnerId, leadId);
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

        {/* Leads Tab - Partner Selection */}
        {activeTab === 'leads' && !selectedPartnerId && (
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

        {/* Leads Tab - Partner Leads */}
        {activeTab === 'leads' && selectedPartnerId && selectedPartner && (
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
              />
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

  const { partners, getPartnerByEmail } = usePartners();
  const { leads, addLead, updateLead, deleteLead, getLeadsByPartner } = useLeads();

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

  const handleSuperadminLogin = (name) => {
    setAdminName(name);
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
        onLogout={handleLogout}
        onAddLead={(leadData) => addLead(currentPartner.id, leadData)}
        onEditLead={(leadId, leadData) => updateLead(currentPartner.id, leadId, leadData)}
        onDeleteLead={(leadId) => deleteLead(currentPartner.id, leadId)}
      />
    );
  }

  // Admin View
  if (userType === 'superadmin') {
    return <AdminView adminName={adminName} onLogout={handleLogout} />;
  }

  return null;
}
