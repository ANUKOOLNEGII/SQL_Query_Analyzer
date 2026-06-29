import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/authSlice';
import { authService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { Eye, EyeOff } from 'lucide-react';

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

const GoogleIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      
      // Update global auth state
      dispatch(setCredentials({ user: data.user, token: data.token }));
      addToast('Logged in successfully!', 'success');
      
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const data = await authService.googleLogin(tokenResponse.access_token);
        dispatch(setCredentials({ user: data.user, token: data.token }));
        addToast('Logged in successfully with Google!', 'success');
        navigate('/');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Google login failed.';
        addToast(msg, 'error');
        setIsLoading(false);
      }
    },
    onError: () => {
      addToast('Google login failed', 'error');
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <div className="flex flex-col w-full text-left">
        <label
          htmlFor="login-password"
          className="text-sm font-semibold mb-2 text-text-primaryLight dark:text-text-primaryDark"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`h-[52px] w-full rounded-input border bg-surface-light dark:bg-surface-dark transition-all duration-200 outline-none px-[18px] pr-12 ${errors.password ? 'border-error focus:ring-1 focus:ring-error' : 'border-border-light dark:border-border-dark focus:border-primary-light dark:focus:border-primary-dark focus:ring-1 focus:ring-primary-light'} text-text-primaryLight dark:text-text-primaryDark text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-full w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password ? (
          <span className="text-xs text-error mt-1.5 font-medium">{errors.password}</span>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2 cursor-pointer select-none text-text-primaryLight dark:text-text-primaryDark font-medium">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-border-light dark:border-border-dark text-primary-light focus:ring-primary-light h-4 w-4"
          />
          <span>Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="font-bold text-primary-light dark:text-primary-dark hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border-light dark:border-border-dark" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-light px-2 text-text-secondaryLight dark:bg-surface-dark dark:text-text-secondaryDark">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => loginWithGoogle()}
        aria-label="Continue with Google"
        className="w-full h-11 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-3 rounded-lg font-medium text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
      >
        <GoogleIcon />
        <span>Sign in with Google</span>
      </button>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-4"
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
};
export default LoginForm;
