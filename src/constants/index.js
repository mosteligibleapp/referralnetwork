export const STATUS_OPTIONS = [
  { value: 'identified', label: 'Identified' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'won', label: 'Closed Won' },
  { value: 'lost', label: 'Closed Lost' },
];

export const STATUS_COLORS = {
  identified: 'bg-gray-100 text-gray-700',
  introduced: 'bg-blue-100 text-blue-700',
  won: 'bg-green-700 text-white',
  lost: 'bg-red-100 text-red-700',
};

export const INITIAL_LEAD_FORM = {
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
};

export const OWNER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Leads' },
  { value: 'superadmin', label: 'Created by me' },
  { value: 'partner', label: 'Created by partners' },
];

export const INITIAL_PARTNER_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
};

export const INITIAL_PRODUCT_FORM = {
  name: '',
  description: '',
  ideal_leads: '',
  url: '',
};

export const INITIAL_PARTNER_PRODUCT_FORM = {
  name: '',
  description: '',
  url: '',
};

export const INDUSTRY_OPTIONS = [
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

export const HEADCOUNT_OPTIONS = [
  { value: '', label: 'Select headcount...' },
  { value: '50-99', label: '50-99' },
  { value: '100-249', label: '100-249' },
  { value: '250-499', label: '250-499' },
  { value: '500-1000', label: '500-1,000' },
  { value: '1000+', label: '1,000+' },
];
