import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📊</span>
          Employee Management
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/employees" className="nav-link">
              <FaUsers /> Employees
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/departments" className="nav-link">
              <FaBuilding /> Departments
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/employees/add" className="nav-link btn-add">
              + Add Employee
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/departments/add" className="nav-link btn-add">
              + Add Department
            </Link>
          </li>
          <li className="nav-item user-info">
            <FaUserCircle /> {user}
          </li>
          <li className="nav-item">
            <button type="button" className="nav-link btn-logout" onClick={logout}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
