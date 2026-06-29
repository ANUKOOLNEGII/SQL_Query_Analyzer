import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import RegisterForm from '../../components/auth/RegisterForm';
import { Terminal, Check } from 'lucide-react';

export const Register: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const benefits = [
    { title: 'Learn SQL Structure', desc: 'Accelerate your learning curve with side-by-side explanations.' },
    { title: 'Safe Sandbox', desc: 'Secure database parameters shield real databases from harm.' },
    { title: 'Unlimited CSV Analysis', desc: 'Upload spreadsheet tables and query with plain English.' },
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
              Create Your Free Account Today
            </h2>
            <p className="text-sm text-teal-50 max-w-sm leading-relaxed">
              Join thousands of students and analysts querying databases without manual code.
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

      {/* Right panel: Register form (60%) */}
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
              Get Started
            </h2>
            <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1.5">
              Sign up to translate text into query outputs.
            </p>
          </div>

          <RegisterForm />

          <div className="text-center mt-7 text-sm font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-light dark:text-primary-dark hover:underline font-bold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
