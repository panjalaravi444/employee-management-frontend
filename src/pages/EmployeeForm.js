import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { employeeAPI, departmentAPI } from '../services/api';
import '../styles/Form.css';

const validationSchema = Yup.object({
  firstName: Yup.string().min(2).max(50).required('First name is required'),
  lastName: Yup.string().min(2).max(50).required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  position: Yup.string().required('Position is required'),
  departmentId: Yup.number().required('Department is required'),
  salary: Yup.number().positive().required('Salary is required'),
  hireDate: Yup.date().required('Hire date is required'),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data);
    } catch (err) {
      setError('Failed to load departments');
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id);
      const emp = response.data.data;
      formik.setValues({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        dateOfBirth: emp.dateOfBirth,
        position: emp.position,
        departmentId: emp.departmentId,
        salary: emp.salary,
        hireDate: emp.hireDate,
      });
    } catch (err) {
      setError('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      position: '',
      departmentId: '',
      salary: '',
      hireDate: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          await employeeAPI.update(id, values);
        } else {
          await employeeAPI.create(values);
        }
        navigate('/employees');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to save employee');
      }
    },
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={formik.handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              {...formik.getFieldProps('firstName')}
              className={formik.touched.firstName && formik.errors.firstName ? 'error' : ''}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <span className="error-text">{formik.errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              {...formik.getFieldProps('lastName')}
              className={formik.touched.lastName && formik.errors.lastName ? 'error' : ''}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <span className="error-text">{formik.errors.lastName}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              {...formik.getFieldProps('email')}
              className={formik.touched.email && formik.errors.email ? 'error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="error-text">{formik.errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              {...formik.getFieldProps('phone')}
              className={formik.touched.phone && formik.errors.phone ? 'error' : ''}
            />
            {formik.touched.phone && formik.errors.phone && (
              <span className="error-text">{formik.errors.phone}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              {...formik.getFieldProps('dateOfBirth')}
              className={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'error' : ''}
            />
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
              <span className="error-text">{formik.errors.dateOfBirth}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hireDate">Hire Date</label>
            <input
              id="hireDate"
              name="hireDate"
              type="date"
              {...formik.getFieldProps('hireDate')}
              className={formik.touched.hireDate && formik.errors.hireDate ? 'error' : ''}
            />
            {formik.touched.hireDate && formik.errors.hireDate && (
              <span className="error-text">{formik.errors.hireDate}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              id="position"
              name="position"
              type="text"
              {...formik.getFieldProps('position')}
              className={formik.touched.position && formik.errors.position ? 'error' : ''}
            />
            {formik.touched.position && formik.errors.position && (
              <span className="error-text">{formik.errors.position}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              {...formik.getFieldProps('departmentId')}
              className={formik.touched.departmentId && formik.errors.departmentId ? 'error' : ''}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {formik.touched.departmentId && formik.errors.departmentId && (
              <span className="error-text">{formik.errors.departmentId}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              id="salary"
              name="salary"
              type="number"
              step="0.01"
              {...formik.getFieldProps('salary')}
              className={formik.touched.salary && formik.errors.salary ? 'error' : ''}
            />
            {formik.touched.salary && formik.errors.salary && (
              <span className="error-text">{formik.errors.salary}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {id ? 'Update Employee' : 'Add Employee'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/employees')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
