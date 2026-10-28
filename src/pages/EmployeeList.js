import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import '../styles/List.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await employeeAPI.search(searchTerm);
        setEmployees(response.data.data);
      } catch (err) {
        setError('Search failed');
      }
    } else {
      fetchEmployees();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        fetchEmployees();
      } catch (err) {
        setError('Failed to delete employee');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/employees/edit/${id}`);
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Employees</h1>
        <button className="btn btn-primary" onClick={() => navigate('/employees/add')}>
          + Add New Employee
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search by name or email..."
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
              fetchEmployees();
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {employees.length === 0 ? (
        <div className="no-data">No employees found</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.firstName} {employee.lastName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>{employee.position}</td>
                  <td>{employee.departmentName}</td>
                  <td>${employee.salary}</td>
                  <td>
                    <span className={`status ${employee.isActive ? 'active' : 'inactive'}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action edit"
                      onClick={() => handleEdit(employee.id)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDelete(employee.id)}
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

export default EmployeeList;
