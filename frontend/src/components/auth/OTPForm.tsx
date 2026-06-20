import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';
import Button from '../common/Button';

interface OTPFormProps {
  email: string;
}

export const OTPForm: React.FC<OTPFormProps> = ({ email }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 5 && element.value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      // Auto-focus previous input
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    try {
      await authService.forgotPassword(email); // Simulates resending OTP via mail reset API in mock
      addToast('Verification code resent!', 'success');
      setTimer(60);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to resend code', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      addToast('Please enter all 6 digits', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otpCode);
      addToast('Email verified successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-center">
      <div className="flex justify-between space-x-2.5 max-w-sm mx-auto">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-14 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-center text-xl font-bold rounded-xl focus:border-primary-light dark:focus:border-primary-dark focus:ring-1 focus:ring-primary-light outline-none transition-all duration-200 text-text-primaryLight dark:text-text-primaryDark"
          />
        ))}
      </div>

      <div className="text-sm font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
        {timer > 0 ? (
          <span>Resend code in <span className="text-primary-light dark:text-primary-dark">{timer}s</span></span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-primary-light dark:text-primary-dark hover:underline font-bold"
          >
            Resend Code
          </button>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Verify Code
      </Button>
    </form>
  );
};
export default OTPForm;
