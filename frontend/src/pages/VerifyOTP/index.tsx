import React from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import OTPForm from '../../components/auth/OTPForm';
import { Terminal, KeyRound } from 'lucide-react';

export const VerifyOTP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      <Link to="/" className="flex items-center space-x-2.5 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light dark:bg-primary-dark text-white shadow-md">
          <Terminal size={18} />
        </div>
        <span className="text-xl font-bold text-text-primaryLight dark:text-text-primaryDark">
          SQLGenius
        </span>
      </Link>

      <div className="w-full max-w-[460px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-card p-8 md:p-10 text-center transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/10 text-primary-light dark:text-primary-dark rounded-full">
            <KeyRound size={28} />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-text-primaryLight dark:text-text-primaryDark mb-2">
          Verify Email
        </h2>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mb-8 max-w-sm mx-auto leading-relaxed">
          We have sent a 6-digit verification code to <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">{email}</span>. Please enter it below.
        </p>

        <OTPForm email={email} />

        <div className="text-center mt-7 text-sm font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
          Entered the wrong email?{' '}
          <Link
            to="/register"
            className="text-primary-light dark:text-primary-dark hover:underline font-bold"
          >
            Change email
          </Link>
        </div>
      </div>
    </div>
  );
};
export default VerifyOTP;
