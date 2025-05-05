import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg lg:relative lg:inset-auto lg:translate-x-0 lg:w-72 transition-transform ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <button
            type="button"
            className="p-2 rounded-md lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
            <span className="sr-only">פתח תפריט</span>
          </button>
        </Header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;