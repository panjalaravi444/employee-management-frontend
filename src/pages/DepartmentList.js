import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentAPI } from '../services/api';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import '../styles/List.css';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await departmentAPI.search(searchTerm);
        setDepartments(response.data.data);
      } catch (err) {
        setError('Search failed');
      }
    } else {
      fetchDepartments();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentAPI.delete(id);
        fetchDepartments();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete department');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/departments/edit/${id}`);
  };

  if (loading) return <div className="loading">Loading departments...</div>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Departments</h1>
        <button className="btn btn-primary" onClick={() => navigate('/departments/add')}>
          + Add New Department
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-search">
            <FaSearch /> Search
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={() => {
              setSearchTerm('');
              fetchDepartments();
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {departments.length === 0 ? (
        <div className="no-data">No departments found</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td>{department.name}</td>
                  <td>{department.description || 'N/A'}</td>
                  <td>{new Date(department.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-action edit"
                      onClick={() => handleEdit(department.id)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDelete(department.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
