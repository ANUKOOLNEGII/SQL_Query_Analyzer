import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateUser, clearCredentials } from '../../store/authSlice';
import { authService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, ShieldAlert, Cpu, Database, Save, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { queryHistory } = useAppSelector((state) => state.history);
  const { datasets } = useAppSelector((state) => state.dataset);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('Name and email are required', 'warning');
      return;
    }
    setUpdatingProfile(true);
    try {
      await authService.updateProfile(name, email);
      dispatch(updateUser({ ...user!, name, email }));
      addToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      addToast('Password is required', 'warning');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }
    setUpdatingPassword(true);
    try {
      await authService.changePassword(password);
      addToast('Password changed successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
          My Account Profile
        </h1>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
          Manage user profiles, secure account credentials, and inspect workspace stats.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card hoverable={false} className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/10 text-primary-light rounded-xl">
            <Cpu size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">
              {queryHistory.length}
            </div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Queries Generated</div>
          </div>
        </Card>

        <Card hoverable={false} className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 text-secondary-light rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">
              {datasets.length}
            </div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Uploaded Datasets</div>
          </div>
        </Card>

        <Card hoverable={false} className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 text-accent-light rounded-xl">
            <Save size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Registration Date</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Update Profile Form */}
        <Card className="p-8">
          <div className="flex items-center space-x-2.5 pb-4 mb-6 border-b border-border-light dark:border-border-dark">
            <User size={20} className="text-primary-light" />
            <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">
              Update Profile details
            </h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4.5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={updatingProfile}
            >
              Save Profile Details
            </Button>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="p-8">
          <div className="flex items-center space-x-2.5 pb-4 mb-6 border-b border-border-light dark:border-border-dark">
            <ShieldAlert size={20} className="text-primary-light" />
            <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">
              Change Account Password
            </h3>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4.5">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={updatingPassword}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {/* Log out section */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between border-red-200/50 bg-red-50/5 text-left">
        <div>
          <h4 className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">
            Sign out of your session
          </h4>
          <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
            Log out from this web browser. You will need to log in again with credentials.
          </p>
        </div>
        <Button variant="danger" className="h-11 shadow-sm mt-4 sm:mt-0" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" />
          <span>Sign Out</span>
        </Button>
      </Card>
    </div>
  );
};
export default Profile;
