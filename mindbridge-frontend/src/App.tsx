// MindBridge — Root Router
// Navigation flow per UX Navigation Flow Document

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SideNav from '@/components/SideNav';
import AdminSideNav from '@/components/AdminSideNav';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Splash from './pages/Splash';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Student Pages
import Dashboard from './pages/Dashboard';
import MoodHistory from './pages/MoodHistory';
import JournalList from './pages/JournalList';
import NewJournalEntry from './pages/NewJournalEntry';
import JournalEntryDetail from './pages/JournalEntryDetail';
import EditJournalEntry from './pages/EditJournalEntry';
import Forum from './pages/Forum';
import NewForumPost from './pages/NewForumPost';
import ForumPostDetail from './pages/ForumPostDetail';
import CrisisSupport from './pages/CrisisSupport';
import CrisisConfirmation from './pages/CrisisConfirmation';
import MindBot from './pages/MindBot';
import ResourceLibrary from './pages/ResourceLibrary';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCrisisAlerts from './pages/AdminCrisisAlerts';
import AdminManageResources from './pages/AdminManageResources';
import AdminForumModeration from './pages/AdminForumModeration';

// About Us
import AboutUs from './pages/AboutUs';

// Global States
import NotFound from './pages/NotFound';

// Route Guards
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Entry — redirect based on auth state */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? isAdmin
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/dashboard" replace />
            : <Splash />
        }
      />

      {/* Auth Routes */}
      <Route path="/splash" element={<Splash />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<RequireStudent><Dashboard /></RequireStudent>} />
      <Route path="/mood/history" element={<RequireStudent><MoodHistory /></RequireStudent>} />
      <Route path="/journal" element={<RequireStudent><JournalList /></RequireStudent>} />
      <Route path="/journal/new" element={<RequireStudent><NewJournalEntry /></RequireStudent>} />
      <Route path="/journal/:id" element={<RequireStudent><JournalEntryDetail /></RequireStudent>} />
      <Route path="/journal/:id/edit" element={<RequireStudent><EditJournalEntry /></RequireStudent>} />
      <Route path="/forum" element={<RequireAuth><Forum /></RequireAuth>} />
      <Route path="/forum/new" element={<RequireStudent><NewForumPost /></RequireStudent>} />
      <Route path="/forum/:id" element={<RequireAuth><ForumPostDetail /></RequireAuth>} />
      <Route path="/crisis" element={<RequireStudent><CrisisSupport /></RequireStudent>} />
      <Route path="/crisis/confirmation" element={<RequireStudent><CrisisConfirmation /></RequireStudent>} />
      <Route path="/mindbot" element={<RequireStudent><MindBot /></RequireStudent>} />
      <Route path="/resources" element={<RequireAuth><ResourceLibrary /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/crisis" element={<RequireAdmin><AdminCrisisAlerts /></RequireAdmin>} />
      <Route path="/admin/resources" element={<RequireAdmin><AdminManageResources /></RequireAdmin>} />
      <Route path="/admin/forum" element={<RequireAdmin><AdminForumModeration /></RequireAdmin>} />

      {/* About Us — public */}
      <Route path="/about" element={<AboutUs />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppShell() {
  const { isAuthenticated, isAdmin } = useAuth();
  return (
    <>
      {isAuthenticated && (isAdmin ? <AdminSideNav /> : <SideNav />)}
      <div className={isAuthenticated ? 'md:pl-[240px]' : ''}>
        <AppRoutes />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
