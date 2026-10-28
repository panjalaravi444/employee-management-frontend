import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { departmentAPI } from '../services/api';
import '../styles/Form.css';

const validationSchema = Yup.object({
  name: Yup.string().min(2).max(100).required('Department name is required'),
  description: Yup.string().max(500),
});

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const response = await departmentAPI.getById(id);
      const dept = response.data.data;
      formik.setValues({
        name: dept.name,
        description: dept.description || '',
      });
    } catch (err) {
      setError('Failed to load department');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          await departmentAPI.update(id, values);
        } else {
          await departmentAPI.create(values);
        }
        navigate('/departments');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to save department');
      }
    },
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Department' : 'Add New Department'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={formik.handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Department Name</label>
          <input
            id="name"
            name="name"
            type="text"
            {...formik.getFieldProps('name')}
            className={formik.touched.name && formik.errors.name ? 'error' : ''}
          />
          {formik.touched.name && formik.errors.name && (
            <span className="error-text">{formik.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            {...formik.getFieldProps('description')}
            className={formik.touched.description && formik.errors.description ? 'error' : ''}
          />
          {formik.touched.description && formik.errors.description && (
            <span className="error-text">{formik.errors.description}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {id ? 'Update Department' : 'Add Department'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/departments')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
