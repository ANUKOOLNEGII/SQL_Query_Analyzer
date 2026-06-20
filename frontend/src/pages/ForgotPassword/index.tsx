import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Terminal, KeyRound } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      addToast('Reset code sent to your email!', 'success');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to send reset code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
          Forgot Password?
        </h2>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mb-8 max-w-sm mx-auto leading-relaxed">
          No worries! Enter your account email and we'll send a code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Send Reset Code
          </Button>
        </form>

        <div className="text-center mt-7 text-sm font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-primary-light dark:text-primary-dark hover:underline font-bold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
