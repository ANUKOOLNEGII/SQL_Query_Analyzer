import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { clearCredentials } from '../../store/authSlice';
import { Sun, Moon, LogOut, User, Settings, Database, Menu, Terminal } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedDataset } = useAppSelector((state) => state.dataset);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearCredentials());
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  // Redux hooks types helper will be written next, let's write standard selector/dispatch imports
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle sidebar"
              >
                <Menu size={22} />
              </button>
            )}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light dark:bg-primary-dark text-white shadow-md">
                <Terminal size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
                SQL<span className="text-primary-light dark:text-primary-dark">Genius</span>
              </span>
            </Link>

            {/* Selected Dataset Indicator for Auth users */}
            {isAuthenticated && selectedDataset && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-900/10 text-primary-light dark:text-primary-dark rounded-full text-xs font-semibold border border-teal-150 dark:border-teal-900/40">
                <Database size={13} />
                <span>Active: {selectedDataset.name}</span>
              </div>
            )}
          </div>

          {/* Right section: Links & Profile Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                {/* Profile Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 hover:border-primary-light dark:hover:border-primary-dark transition-all">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline font-semibold text-text-primaryLight dark:text-text-primaryDark text-sm">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Click-away overlay */}
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    
                    <div className="absolute right-0 z-40 mt-3 w-56 origin-top-right divide-y divide-border-light dark:divide-border-dark rounded-xl bg-surface-light dark:bg-surface-dark shadow-modal border border-border-light dark:border-border-dark py-1 ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-in">
                      <div className="px-4 py-3 text-left">
                        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark">Signed in as</p>
                        <p className="truncate text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="group flex items-center px-4 py-2 text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-primary-light" />
                          My Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="group flex items-center px-4 py-2 text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-primary-light" />
                          Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="group flex w-full items-center px-4 py-2 text-left text-sm text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-primary-light dark:bg-primary-dark hover:bg-teal-800 dark:hover:bg-teal-500 transition-all px-4.5 py-2.5 rounded-button shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
