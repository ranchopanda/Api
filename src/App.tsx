import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import CompaniesManagement from './components/CompaniesManagement';
import UsageAnalytics from './components/UsageAnalytics';
import ComplaintsManagement from './components/ComplaintsManagement';
import APITester from './components/APITester';

function App() {
  const [activeTab, setActiveTab] = useState<string>('companies');

  // Mock admin user for direct access
  const currentUser = {
    id: 'admin-1',
    email: 'admin@plantdisease.com',
    name: 'System Administrator',
    role: 'super_admin'
  };

  const handleLogout = () => {
    // For direct access, logout just reloads the page
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'companies':
        return <CompaniesManagement />;
      case 'usage':
        return <UsageAnalytics />;
      case 'complaints':
        return <ComplaintsManagement />;
      case 'api-tester':
        return <APITester apiKey="75ac51703064e7ef1e31609d6e585306a397eb528b5950f4377c16ebd1d1bfa8" />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <CompaniesManagement />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      adminName={currentUser.name}
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default App;