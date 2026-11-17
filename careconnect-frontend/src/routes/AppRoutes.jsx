import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../services/api";

// ================= PUBLIC =================
import Home from "../Pages/Home";

// ================= AUTH =================
const Login = lazy(() => import("../Pages/Auth/Login"));
const Register = lazy(() => import("../Pages/Auth/Register"));
const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));

// ================= PATIENT =================
const PatientDashboard = lazy(() => import("../Patient/Dashboard"));
const PatientAppointments = lazy(() => import("../Patient/Appointments"));
const PatientCalendar = lazy(() => import("../Patient/Calendar"));
const PatientReports = lazy(() => import("../Patient/Reports"));
const PatientPrescriptions = lazy(() => import("../Patient/Prescriptions"));
const PatientProfile = lazy(() => import("../Patient/Profile"));
const PatientSettings = lazy(() => import("../Patient/Settings"));

// ================= DOCTOR =================
const DoctorDashboard = lazy(() => import("../Doctor/Dashboard"));
const DoctorAppointments = lazy(() => import("../Doctor/Appointments"));
const DoctorPatients = lazy(() => import("../Doctor/Patients"));
const PatientDetails = lazy(() => import("../Doctor/PatientDetails"));
const DoctorReports = lazy(() => import("../Doctor/Reports"));
const DoctorSettings = lazy(() => import("../Doctor/Settings"));

// ================= ADMIN =================
const AdminDashboard = lazy(() => import("../Admin/Dashboard"));
const AdminDoctors = lazy(() => import("../Admin/Doctors"));
const AdminPatients = lazy(() => import("../Admin/Patients"));
const AdminAppointments = lazy(() => import("../Admin/Appointments"));
const AdminReports = lazy(() => import("../Admin/Reports"));
const AdminSettings = lazy(() => import("../Admin/Settings"));


const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const destination =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "doctor"
        ? "/doctor/dashboard"
        : "/patient/dashboard";

    return <Navigate to={destination} replace />;
  }

  return children;
};

// Jump back to the top of the page whenever the route changes
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

// Small placeholder shown while a page's code loads
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Home />} />
      {/* About and FAQ are sections of the Home page */}
      <Route path="/about" element={<Navigate to="/#about" replace />} />
      <Route path="/faq" element={<Navigate to="/#faq" replace />} />


      {/* ================= AUTH ================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* ================= PATIENT ================= */}

      <Route
        path="/patient/dashboard"
        element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>}
      />

      <Route
        path="/patient/appointments"
        element={<ProtectedRoute roles={["patient"]}><PatientAppointments /></ProtectedRoute>}
      />

      <Route
        path="/patient/calendar"
        element={<ProtectedRoute roles={["patient"]}><PatientCalendar /></ProtectedRoute>}
      />

      <Route
        path="/patient/reports"
        element={<ProtectedRoute roles={["patient"]}><PatientReports /></ProtectedRoute>}
      />

      <Route
        path="/patient/prescriptions"
        element={<ProtectedRoute roles={["patient"]}><PatientPrescriptions /></ProtectedRoute>}
      />

      <Route
        path="/patient/profile"
        element={<ProtectedRoute roles={["patient"]}><PatientProfile /></ProtectedRoute>}
      />

      <Route
        path="/patient/settings"
        element={<ProtectedRoute roles={["patient"]}><PatientSettings /></ProtectedRoute>}
      />


      {/* ================= DOCTOR ================= */}

      <Route
        path="/doctor/dashboard"
        element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>}
      />

      <Route
        path="/doctor/appointments"
        element={<ProtectedRoute roles={["doctor"]}><DoctorAppointments /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients"
        element={<ProtectedRoute roles={["doctor"]}><DoctorPatients /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients/:id"
        element={<ProtectedRoute roles={["doctor"]}><PatientDetails /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients/:id/reports"
        element={<ProtectedRoute roles={["doctor"]}><PatientDetails /></ProtectedRoute>}
      />

      <Route
        path="/doctor/reports"
        element={<ProtectedRoute roles={["doctor"]}><DoctorReports /></ProtectedRoute>}
      />

      <Route
        path="/doctor/reports/:id"
        element={<ProtectedRoute roles={["doctor"]}><DoctorReports /></ProtectedRoute>}
      />

      <Route
        path="/doctor/settings"
        element={<ProtectedRoute roles={["doctor"]}><DoctorSettings /></ProtectedRoute>}
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
      />

      <Route
        path="/admin/doctors"
        element={<ProtectedRoute roles={["admin"]}><AdminDoctors /></ProtectedRoute>}
      />

      <Route
        path="/admin/patients"
        element={<ProtectedRoute roles={["admin"]}><AdminPatients /></ProtectedRoute>}
      />

      <Route
        path="/admin/appointments"
        element={<ProtectedRoute roles={["admin"]}><AdminAppointments /></ProtectedRoute>}
      />

      <Route
        path="/admin/reports"
        element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>}
      />

      <Route
        path="/admin/settings"
        element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>}
      />


      {/* ================= INVALID URL ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
    </Suspense>
    </>
  );
};

export default AppRoutes;