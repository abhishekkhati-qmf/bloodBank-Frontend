import './App.css';
import {Routes, Route, useNavigate} from 'react-router-dom' 
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from './redux/features/auth/authActions';
import API_CONFIG from './config/api.js';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import {Toaster} from 'react-hot-toast'
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import Donor from './pages/Dashboard/Donor';
import Hospital from './pages/Dashboard/Hospital';
import Inventory from './pages/Dashboard/Inventory';
import OrganisationPage from './pages/Dashboard/OrganisationPage';
import CampManagement from './pages/Dashboard/CampManagement';
// removed Consumer page per requirements
import Donation from './pages/Donation';
import Analytics from './pages/Dashboard/Analytics';
import DonorList from './pages/admin/DonorList';
import HospitalList from './pages/admin/HospitalList';
import OrgList from './pages/admin/OrgList';
import AdminHome from './pages/admin/AdminHome';
import CampApproval from './pages/admin/CampApproval';
import EmergencyRequest from './pages/Dashboard/EmergencyRequest';
import EmergencyManagement from './pages/admin/EmergencyManagement';
import CampsHistory from './pages/admin/CampsHistory';
import Organisations from './pages/Dashboard/Organisations';
import OrganisationDashboard from './pages/Dashboard/OrganisationDashboard';
import DonorsList from './pages/Dashboard/DonorsList';
import EmailVerification from './pages/auth/EmailVerification';
import PasswordReset from './pages/auth/PasswordReset';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Check authentication status on app initialization
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  // Periodic check for blocked users
  useEffect(() => {
    if (user) {
      const checkUserStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await fetch(`${import.meta.env.VITE_BASEURL || API_CONFIG.BASE_URL}/auth/current-user`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.status === 403) {
              const data = await response.json();
              if (data.accountBlocked) {
                // User is blocked, show toast and logout
                const { toast } = await import('react-hot-toast');
                toast.error("Your account has been blocked by the administrator. You are being logged out.");
                setTimeout(() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }, 2000);
              }
            }
          }
        } catch (error) {
          // Error checking user status - user will be redirected to login
        }
      };

      // Check every 30 seconds
      const interval = setInterval(checkUserStatus, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle role-based navigation after authentication
  useEffect(() => {
    if (user && user.role) {
      const currentPath = window.location.pathname;
      
      if (currentPath === '/') {
        // Only redirect if we're on the root path
        switch (user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "donor":
            navigate("/donor");
            break;
          case "hospital":
            navigate("/hospital");
            break;
          case "organisation":
            navigate("/organisation");
            break;
          default:
            break;
        }
      }
    }
  }, [user, navigate]);

  return (
    <>
    <div><Toaster position="top-left" /></div>
      <Routes>

        <Route path="/" element={
            <ProtectedRoute>
              <HomePage/>
            </ProtectedRoute>
        } />

        {/* Public Auth Routes */}
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute roles={["organisation"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/camps"
          element={
            <ProtectedRoute roles={["organisation"]}>
              <CampManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency"
          element={
            <ProtectedRoute roles={["organisation"]}>
              <EmergencyRequest />
            </ProtectedRoute>
          }
        />

          <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/camp-approval"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CampApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency-management"
          element={
            <ProtectedRoute roles={["admin"]}>
              <EmergencyManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/camps-history"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CampsHistory />
            </ProtectedRoute>
          }
        />  


        <Route
          path="/donor-list"
          element={
            <ProtectedRoute>
              <DonorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-list"
          element={
            <ProtectedRoute>
              <HospitalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org-list"
          element={
            <ProtectedRoute>
              <OrgList />
            </ProtectedRoute>
          }/>

         <Route
          path="/donor"
          element={
            <ProtectedRoute roles={["donor"]}>
              <Donor />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/donors-list"
          element={
            <ProtectedRoute roles={["organisation"]}>
              <DonorsList />
            </ProtectedRoute>
          }
        />

       <Route
  path="/hospital"
  element={
    <ProtectedRoute roles={["hospital","organisation"]}>
      <Hospital />
    </ProtectedRoute>
  }
/>

        <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics/>
            </ProtectedRoute>
        } />

        {false && <Route path="/consumer" element={<div/>} />} 

        <Route path="/donation" element={
            <ProtectedRoute>
              <Donation/>
            </ProtectedRoute>
        } />

           <Route
          path="/organisation"
          element={
            <ProtectedRoute>
              <OrganisationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organisation-dashboard"
          element={
            <ProtectedRoute roles={["organisation"]}>
              <OrganisationDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organisations"
          element={
            <ProtectedRoute roles={["donor", "hospital"]}>
              <Organisations />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={
          <PublicRoute>
            <Login/>
          </PublicRoute>
        } />

        <Route path="/register" element={
            <PublicRoute>
              <Register/>
            </PublicRoute>
        } />

      </Routes>
    </>
  );
}

export default App;