import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected route guard: Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Wrapper */}
      <div className="flex pt-16">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right workspace panels */}
        <main className="flex-1 px-6 py-8 md:pl-[324px] max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
