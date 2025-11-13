import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyEmail from "./components/auth/VerifyEmail";
import HostDashboard from "./components/host/HostDashboard";
import GuestDashboard from "./components/guest/GuestDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyListings from "./components/host/tabs/MyListings";
import EditListing from "./components/host/tabs/EditListing";
import CalendarView from "./components/host/tabs/CalendarView";
import PublicLayout from "./components/layouts/PublicLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import BecomeHost from "./components/guest/BecomeHost";

function App() {
  return (
    <Routes>
      {/* Public marketing pages with shared header/footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/guest/become-host" element={<BecomeHost />} />
      </Route>

      {/* Authentication pages without header/footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Role-protected routes */}
      <Route
        path="/guest/dashboard"
        element={
          <ProtectedRoute allowedRoles={["guest", "host", "admin"]}>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/dashboard"
        element={
          <ProtectedRoute allowedRoles={["host", "admin"]}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Host routes */}
      <Route
        path="/host/my-listings"
        element={
          <ProtectedRoute allowedRoles={["host", "admin"]}>
            <MyListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/edit-listing/:id"
        element={
          <ProtectedRoute allowedRoles={["host", "admin"]}>
            <EditListing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/calendar"
        element={
          <ProtectedRoute allowedRoles={["host", "admin"]}>
            <CalendarView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
