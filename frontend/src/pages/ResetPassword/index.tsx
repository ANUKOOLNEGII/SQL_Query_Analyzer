import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Terminal, KeyRound } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { addToast } = useToast();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!otp) {
      tempErrors.otp = 'Reset code is required';
    }
    if (!password) {
      tempErrors.password = 'New password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, password);
      addToast('Password reset successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return <Link to="/forgot-password" />;
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
          Reset Password
        </h2>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mb-8 max-w-sm mx-auto leading-relaxed">
          Enter the code sent to your email along with your new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <Input
            label="Verification Code (OTP)"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={errors.otp}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
