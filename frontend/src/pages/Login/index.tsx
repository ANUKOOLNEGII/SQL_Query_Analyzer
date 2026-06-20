import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import LoginForm from '../../components/auth/LoginForm';
import { Terminal, Check } from 'lucide-react';

export const Login: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const benefits = [
    { title: 'Instant AI Translations', desc: 'No SQL expertise required to extract data insights.' },
    { title: 'Safe DB Connections', desc: 'Encrypted connection parameters protect database hosts.' },
    { title: 'Client-Side Exports', desc: 'Directly download reports to Excel, CSV, or PDFs.' },
  ];

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      {/* Left panel: Branding & Benefits (40%) */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-white p-12 flex-col justify-between text-left relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.15),transparent_60%)] pointer-events-none" />
        
        {/* Brand header */}
        <Link to="/" className="flex items-center space-x-2.5 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary-light shadow-md">
            <Terminal size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SQLGenius
          </span>
        </Link>

        {/* Benefits center */}
        <div className="my-auto space-y-10 z-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Unlock Your Database Insights Instantly
            </h2>
            <p className="text-sm text-teal-50 max-w-sm leading-relaxed">
              Experience the power of translating english instructions into syntax-validated database queries.
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white mt-0.5 flex-shrink-0">
                  <Check size={14} />
                </div>
                <div className="ml-3.5">
                  <h4 className="text-sm font-bold text-white">{b.title}</h4>
                  <p className="text-xs text-teal-50 mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left footer */}
        <div className="text-xs text-teal-100 z-10">
          &copy; {new Date().getFullYear()} SQLGenius. Trusted by data analysts.
        </div>
      </div>

      {/* Right panel: Login form (60%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <Link to="/" className="lg:hidden flex items-center space-x-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light dark:bg-primary-dark text-white shadow-md">
            <Terminal size={18} />
          </div>
          <span className="text-xl font-bold text-text-primaryLight dark:text-text-primaryDark">
            SQLGenius
          </span>
        </Link>

        <div className="w-full max-w-[460px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-card p-8 md:p-10 transition-all duration-300">
          <div className="text-center mb-7">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primaryLight dark:text-text-primaryDark">
              Welcome Back
            </h2>
            <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1.5">
              Enter your credentials to access the query workspace.
            </p>
          </div>

          <LoginForm />

          <div className="text-center mt-7 text-sm font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-light dark:text-primary-dark hover:underline font-bold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
