import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import '../styles/Form.css';
import '../styles/Login.css';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const getLoginErrorMessage = (err) => {
  if (!err.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (err.response.status === 401 || err.response.status === 403) {
    return 'Invalid username or password.';
  }
  return 'Login failed. Please try again.';
};

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/employees';

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await login(values.username, values.password);
      } catch (err) {
        setError(getLoginErrorMessage(err));
      }
    },
  });

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const submitting = formik.isSubmitting;

  return (
    <div className="login-container">
      <div className="form-container login-card">
        <div className="form-header">
          <h1>Sign In</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={formik.handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              disabled={submitting}
              {...formik.getFieldProps('username')}
              className={formik.touched.username && formik.errors.username ? 'error' : ''}
            />
            {formik.touched.username && formik.errors.username && (
              <span className="error-text">{formik.errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={submitting}
              {...formik.getFieldProps('password')}
              className={formik.touched.password && formik.errors.password ? 'error' : ''}
            />
            {formik.touched.password && formik.errors.password && (
              <span className="error-text">{formik.errors.password}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
