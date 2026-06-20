import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { clearCredentials } from '../../store/authSlice';
import { useToast } from '../../contexts/ToastContext';
import { 
  LayoutDashboard, 
  Upload, 
  Terminal, 
  History, 
  User, 
  Settings, 
  LogOut, 
  HardDriveDownload,
  Link2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const handleLogout = () => {
    dispatch(clearCredentials());
    addToast('Logged out successfully', 'success');
    navigate('/login');
    if (onClose) onClose();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Upload Dataset', path: '/upload-csv', icon: <Upload size={20} /> },
    { name: 'Dataset Manager', path: '/datasets', icon: <HardDriveDownload size={20} /> },
    { name: 'Database Connection', path: '/database-connection', icon: <Link2 size={20} /> },
    { name: 'Query Generator', path: '/query-generator', icon: <Terminal size={20} /> },
    { name: 'Query History', path: '/query-history', icon: <History size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-[300px] border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-transform duration-300 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col justify-between p-6">
          {/* Nav Items */}
          <nav className="space-y-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center space-x-3.5 px-4.5 py-3.5 rounded-button text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-l-4 border-primary-light dark:border-primary-dark pl-3.5'
                    : 'text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-text-primaryLight dark:hover:text-text-primaryDark'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom section: Logout */}
          <div className="border-t border-border-light dark:border-border-dark pt-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3.5 px-4.5 py-3.5 rounded-button text-sm font-semibold text-error hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
