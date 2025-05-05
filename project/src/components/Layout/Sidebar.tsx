import React from 'react';
import { 
  Home,
  PieChart,
  Receipt,
  Tag,
  FilePlus,
  XCircle,
  Wallet,
  TrendingUp,
  Landmark
} from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-4 w-full rounded-lg transition-colors ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'hover:bg-gray-100'
      }`}
      aria-label={text}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const activeItem = 'dashboard';
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">ניהול פיננסי</h1>
        <button 
          className="lg:hidden p-1 rounded-full hover:bg-gray-100"
          onClick={closeSidebar}
        >
          <XCircle size={20} />
        </button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          <SidebarItem 
            icon={<Home size={20} />} 
            text="דף הבית" 
            active={activeItem === 'dashboard'}
          />
          <SidebarItem 
            icon={<Receipt size={20} />} 
            text="הוצאות" 
            active={activeItem === 'expenses'}
          />
          <SidebarItem 
            icon={<FilePlus size={20} />} 
            text="הוספת הוצאה" 
            active={activeItem === 'add-transaction'}
          />
          <SidebarItem 
            icon={<PieChart size={20} />} 
            text="ניתוח הוצאות" 
            active={activeItem === 'analytics'}
          />
          <SidebarItem 
            icon={<Tag size={20} />} 
            text="קטגוריות" 
            active={activeItem === 'categories'}
          />
          <SidebarItem 
            icon={<Wallet size={20} />} 
            text="תקציב" 
            active={activeItem === 'budget'}
          />
          <SidebarItem 
            icon={<TrendingUp size={20} />} 
            text="השקעות" 
            active={activeItem === 'investments'}
          />
          <SidebarItem 
            icon={<Landmark size={20} />} 
            text="הלוואות" 
            active={activeItem === 'loans'}
          />
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;