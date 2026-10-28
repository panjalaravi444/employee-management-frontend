import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import DepartmentList from './pages/DepartmentList';
import DepartmentForm from './pages/DepartmentForm';
import './styles/App.css';

const ProtectedLayout = () => {
  const { permissionDenied, dismissPermissionDenied } = useAuth();

  return (
    <ProtectedRoute>
      <div className="App">
        <Navigation />
        <div className="container">
          {permissionDenied && (
            <div className="error-message">
              You don't have permission to perform this action.{' '}
              <button type="button" onClick={dismissPermissionDenied}>
                Dismiss
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<EmployeeList />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/add" element={<EmployeeForm />} />
            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/departments/add" element={<DepartmentForm />} />
            <Route path="/departments/edit/:id" element={<DepartmentForm />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
