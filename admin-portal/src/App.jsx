import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './modules/dashboard/Dashboard';
import Login from './modules/auth/Login';

import CollegesManager from './modules/colleges/CollegesManager';
import StudentsManager from './modules/students/StudentsManager';
import ApplicationsManager from './modules/applications/ApplicationsManager';
import BrochuresManager from './modules/brochures/BrochuresManager';
import Settings from './modules/settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="colleges" element={<CollegesManager />} />
          <Route path="students" element={<StudentsManager />} />
          <Route path="applications" element={<ApplicationsManager />} />
          <Route path="brochures" element={<BrochuresManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect root to admin (which redirects to login if needed) */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
