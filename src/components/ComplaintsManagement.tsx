import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '../utils/config';

interface Complaint {
  id: string;
  issue_type: 'api_failure' | 'billing' | 'rate_limit' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: string;
  resolved_at?: string;
  companies: {
    name: string;
    email: string;
  };
}

const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchComplaints = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const url = statusFilter === 'all' 
        ? `${apiBaseUrl}/complaints`
        : `${apiBaseUrl}/complaints?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      
      const data = await response.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleUpdateComplaint = async (complaintId: string, updates: Partial<Complaint>) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint');
      }

      await fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Error updating complaint: ' + (error as Error).message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'api_failure':
        return 'text-red-600 bg-red-100';
      case 'billing':
        return 'text-purple-600 bg-purple-100';
      case 'rate_limit':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Complaints</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['open', 'in_progress', 'resolved', 'closed'].map((status) => {
          const count = complaints.filter(c => c.status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getStatusIcon(status)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{complaint.companies.name}</div>
                      <div className="text-sm text-gray-500">{complaint.companies.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIssueTypeColor(complaint.issue_type)}`}>
                      {complaint.issue_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {complaint.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Company</h3>
                  <p className="text-sm text-gray-900">{selectedComplaint.companies.name}</p>
                  <p className="text-sm text-gray-500">{selectedComplaint.companies.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Issue Type</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIssueTypeColor(selectedComplaint.issue_type)}`}>
                    {selectedComplaint.issue_type.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="text-sm text-gray-900">{selectedComplaint.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Current Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>

                {selectedComplaint.admin_response && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Admin Response</h3>
                    <p className="text-sm text-gray-900">{selectedComplaint.admin_response}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add Response</h3>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response to the customer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateComplaint(selectedComplaint.id, {
                      status: 'in_progress',
                      admin_response: responseText
                    })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateComplaint(selectedComplaint.id, {
                      status: 'resolved',
                      admin_response: responseText
                    })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateComplaint(selectedComplaint.id, {
                      status: 'closed',
                      admin_response: responseText
                    })}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;