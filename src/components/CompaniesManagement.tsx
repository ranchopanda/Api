import React, { useState, useEffect } from 'react';
import { Plus, Copy, Edit, Trash2, Building2, Shield, ShieldOff, Calendar, Clock, RefreshCw, Key } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  api_key_hash: string;
  api_key?: string;
  daily_limit: number;
  current_usage: number;
  status: 'active' | 'suspended' | 'expired';
  created_at: string;
  expiry_date?: string;
  api_key_revoked: boolean;
  cost_per_extra_call: number;
  rate_limit_per_minute: number;
}

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gemini_key: '',
    daily_limit: 100,
    cost_per_extra_call: 0.10,
    rate_limit_per_minute: 60,
    expiry_date: '' as string | undefined
  });

  const fetchCompanies = async () => {
    try {
      // Use the Render backend URL directly since environment variable might not be set
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      console.log('Fetching companies from:', apiBaseUrl);
      
      const response = await fetch(`${apiBaseUrl}/companies`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      alert('Company name and email are required');
      return;
    }
    
    if (!editingCompany && !formData.gemini_key) {
      alert('Gemini API key is required for new companies');
      return;
    }

    try {
      // Use the Render backend URL directly
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      const url = editingCompany 
        ? `${apiBaseUrl}/companies/${editingCompany.id}`
        : `${apiBaseUrl}/companies`;
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      // Clean up the data before sending
      const cleanData = { ...formData };
      if (!cleanData.expiry_date || cleanData.expiry_date.trim() === '') {
        cleanData.expiry_date = undefined;
      }
      
      const body = editingCompany 
        ? { ...cleanData, id: editingCompany.id }
        : cleanData;

      console.log('Submitting company data:', body);
      console.log('Using URL:', url);
      console.log('Using method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Company saved successfully:', result);

      await fetchCompanies();
      setShowForm(false);
      setEditingCompany(null);
      setFormData({ 
        name: '', 
        email: '', 
        gemini_key: '', 
        daily_limit: 100,
        cost_per_extra_call: 0.10,
        rate_limit_per_minute: 60,
        expiry_date: ''
      });
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company: ' + (error as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company: ' + (error as Error).message);
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      const newStatus = company.status === 'active' ? 'suspended' : 'active';
      
      const response = await fetch(`${apiBaseUrl}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...company, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company status');
      }

      await fetchCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      alert('Error updating company status: ' + (error as Error).message);
    }
  };

  const handleRegenerateApiKey = async (company: Company) => {
    if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/companies/${company.id}/regenerate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }

      await fetchCompanies();
      alert('API key regenerated successfully');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Error regenerating API key: ' + (error as Error).message);
    }
  };

  const handleViewApiKey = async (company: Company) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
      const response = await fetch(`${apiBaseUrl}/companies/${company.id}/api-key`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API key');
      }

      const data = await response.json();
      alert(`API Key: ${data.api_key}`);
    } catch (error) {
      console.error('Error fetching API key:', error);
      alert('Error fetching API key: ' + (error as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const startEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      gemini_key: '', // Clear gemini_key for editing
      daily_limit: company.daily_limit,
      cost_per_extra_call: company.cost_per_extra_call,
      rate_limit_per_minute: company.rate_limit_per_minute,
      expiry_date: company.expiry_date ? company.expiry_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const getStatusColor = (company: Company) => {
    if (company.api_key_revoked) return 'bg-red-100 text-red-800';
    if (company.expiry_date && new Date(company.expiry_date) < new Date()) return 'bg-orange-100 text-orange-800';
    if (company.status === 'active') return 'bg-green-100 text-green-800';
    if (company.status === 'suspended') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (company: Company) => {
    if (company.api_key_revoked) return 'Revoked';
    if (company.expiry_date && new Date(company.expiry_date) < new Date()) return 'Expired';
    return company.status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={formData.gemini_key}
                  onChange={(e) => setFormData({ ...formData, gemini_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingCompany}
                  placeholder={editingCompany ? "Leave empty to keep current key" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Limit
                  </label>
                  <input
                    type="number"
                    value={formData.daily_limit}
                    onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit/Min
                  </label>
                  <input
                    type="number"
                    value={formData.rate_limit_per_minute}
                    onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Extra Call ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_extra_call}
                    onChange={(e) => setFormData({ ...formData, cost_per_extra_call: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingCompany ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                    setFormData({ 
                      name: '', 
                      email: '', 
                      gemini_key: '', 
                      daily_limit: 100,
                      cost_per_extra_call: 0.10,
                      rate_limit_per_minute: 60,
                      expiry_date: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage & Limits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {company.api_key_hash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(company.api_key_hash)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy API key"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Daily: {company.current_usage} / {company.daily_limit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rate: {company.rate_limit_per_minute}/min
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((company.current_usage / company.daily_limit) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${company.cost_per_extra_call}/extra
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company)}`}>
                        {getStatusText(company)}
                      </span>
                      {company.expiry_date && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(company.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(company)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewApiKey(company)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View API Key"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerateApiKey(company)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Regenerate API Key"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(company)}
                        className={`${company.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={company.status === 'active' ? 'Suspend Company' : 'Activate Company'}
                      >
                        {company.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new company.</p>
          </div>
        )}
      </div>
    </div>
  );
}