import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  
  const handleSettingsClick = () => {
    const settingsButton = document.querySelector('button[aria-label="הגדרות"]');
    if (settingsButton instanceof HTMLElement) {
      settingsButton.click();
    }
  };
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        {children}
      </div>
      
      <div className="text-lg font-bold">ניהול פיננסי משפחתי</div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">
          שלום, {user?.name}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleSettingsClick}
            aria-label="הגדרות"
          >
            <Settings size={20} />
          </button>
          
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 text-error"
            onClick={() => signOut()}
            aria-label="התנתק"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;