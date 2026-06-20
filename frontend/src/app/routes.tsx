import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

// Lazy load pages for optimized loading
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UploadDataset = lazy(() => import('../pages/UploadDataset'));
const DatasetManager = lazy(() => import('../pages/DatasetManager'));
const DatabaseConnection = lazy(() => import('../pages/DatabaseConnection'));
const QueryGenerator = lazy(() => import('../pages/QueryGenerator'));
const QueryExecution = lazy(() => import('../pages/QueryExecution'));
const QueryHistory = lazy(() => import('../pages/QueryHistory'));
const QueryDetails = lazy(() => import('../pages/QueryDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader fullScreen text="Loading workspace modules..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-csv" element={<UploadDataset />} />
          <Route path="/datasets" element={<DatasetManager />} />
          <Route path="/database-connection" element={<DatabaseConnection />} />
          <Route path="/query-generator" element={<QueryGenerator />} />
          <Route path="/query-execution" element={<QueryExecution />} />
          <Route path="/query-history" element={<QueryHistory />} />
          <Route path="/query-history/:id" element={<QueryDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;
