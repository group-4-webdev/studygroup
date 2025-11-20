import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/auth/LoginPage.jsx";
import CreateAccount from "./pages/auth/CreateAccount.jsx";
import VerificationPage from "./pages/auth/VerificationPage.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import Dashboard from "./pages/users/UserDashboard.jsx";
import InboxPage from "./pages/users/InboxPage.jsx";
import GroupChatPage from "./pages/users/GroupChatPage.jsx";
import CreateGroupPage from "./pages/users/CreateGroupPage.jsx";
import GroupCreator from "./pages/users/GroupCreator.jsx";
import SchedulesPage from "./pages/users/SchedulesPage.jsx";
import MyStudyGroupsPage from "./pages/users/MyStudyGroupsPage.jsx";
import ProfilePage from "./pages/users/ProfilePage.jsx";
import AboutPage from "./pages/users/AboutPage.jsx";
import ContactsPage from "./pages/users/ContactsPage.jsx";
import TermsPage from "./pages/users/TermsPage.jsx";
import PoliciesPage from "./pages/users/PoliciesPage.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageGroups from "./pages/admin/ManageGroups.jsx";
import Reports from "./pages/admin/Reports.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import PageLayout from "./layouts/PageLayout.jsx";

import AdminPrivateRoute from "./routes/AdminPrivateRoute.jsx";

function App() {
  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />

    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<CreateAccount />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* USER LAYOUT */}
        <Route element={<PageLayout />}>
          <Route path="/user-dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/group-chat" element={<GroupChatPage />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/group-creator" element={<GroupCreator />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/my-study-groups" element={<MyStudyGroupsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
        </Route>

        {/* ADMIN LOGIN (PUBLIC) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN ROUTES — FIXED */}
        <Route
          path="/admin"
          element={
            <AdminPrivateRoute>
              <AdminLayout />
            </AdminPrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-groups" element={<ManageGroups />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
