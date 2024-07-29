import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [view, setView] = useState('welcome');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_no: '',
    designation: '',
    gender: '',
    course: '',
    created_date: '',
    image: null,
  });
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAttribute, setSortAttribute] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'list') {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get('/api/employees');
          setEmployees(response.data);
          setFilteredEmployees(response.data);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      };

      fetchEmployees();
    }
  }, [view]);

  useEffect(() => {
    let updatedEmployees = employees;

    if (searchTerm) {
      updatedEmployees = updatedEmployees.filter((employee) =>
        ['name', 'email', 'created_date'].some((key) =>
          employee[key].toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortAttribute) {
      updatedEmployees.sort((a, b) =>
        a[sortAttribute] > b[sortAttribute] ? 1 : -1
      );
    }

    setFilteredEmployees(updatedEmployees);
  }, [searchTerm, sortAttribute, employees]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      if (view === 'create') {
        await axios.post('/api/employees', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (view === 'edit' && editingEmployee) {
        await axios.put(`/api/employees/${editingEmployee._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setView('list');
      setFormData({
        name: '',
        email: '',
        mobile_no: '',
        designation: '',
        gender: '',
        course: '',
        created_date: '',
        image: null,
      });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      mobile_no: employee.mobile_no,
      designation: employee.designation,
      gender: employee.gender,
      course: employee.course,
      created_date: new Date(employee.created_date).toISOString().split('T')[0],
      image: null,
    });
    setView('edit');
  };

  const handleDelete = async (employeeId) => {
    try {
      await axios.delete(`/api/employees/${employeeId}`);
      setEmployees(employees.filter((employee) => employee._id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 flex justify-between items-center">
        <div className="text-white">
          <button
            onClick={() => setView('welcome')}
            className={`mr-4 ${view === 'welcome' ? 'underline' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setView('list')}
            className={`mr-4 ${view === 'list' ? 'underline' : ''}`}
          >
            Employee List
          </button>
        </div>
        <div className="text-white">
          <span className="mr-4">{user.email}</span>
          <button onClick={handleLogout} className="text-white underline">
            Logout
          </button>
        </div>
      </nav>
      <main className="p-8">
        {view === 'welcome' && (
          <div className="text-center">
            <h1 className="text-2xl mb-4">Welcome, {user.email}!</h1>
            <p className="text-lg mb-4">This is your dashboard where you can manage employee records.</p>
            <button
              onClick={() => setView('list')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Employee List
            </button>
          </div>
        )}
        {view === 'list' && (
          <>
            <div className="flex justify-between items-center mt-8 mb-4">
              <h2 className="text-xl">Employee List</h2>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setView('create')}
              >
                Create Employee
              </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded w-full mr-2"
              />
              <select
                value={sortAttribute}
                onChange={(e) => setSortAttribute(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="created_date">Date</option>
                <option value="_id">ID</option>
              </select>
            </div>
            <div className="bg-white p-4 rounded shadow-md overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Image</th>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Mobile No.</th>
                    <th className="border px-4 py-2">Designation</th>
                    <th className="border px-4 py-2">Gender</th>
                    <th className="border px-4 py-2">Course</th>
                    <th className="border px-4 py-2">Created Date</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td className="border px-4 py-2">{employee._id}</td>
                      <td className="border px-4 py-2">
                        {employee.image && (
                          <img src={`/${employee.image}`} alt={employee.name} className="w-10 h-10 rounded-full" />
                        )}
                      </td>
                      <td className="border px-4 py-2">{employee.name}</td>
                      <td className="border px-4 py-2">{employee.email}</td>
                      <td className="border px-4 py-2">{employee.mobile_no}</td>
                      <td className="border px-4 py-2">{employee.designation}</td>
                      <td className="border px-4 py-2">{employee.gender}</td>
                      <td className="border px-4 py-2">{employee.course}</td>
                      <td className="border px-4 py-2">{new Date(employee.created_date).toLocaleDateString()}</td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(employee._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {(view === 'create' || view === 'edit') && (
          <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded shadow-md mt-8 max-w-md mx-auto">
            <h2 className="text-xl mb-4">{view === 'create' ? 'Create' : 'Edit'} Employee</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Mobile No.</label>
              <input
                type="text"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Created Date</label>
              <input
                type="date"
                name="created_date"
                value={formData.created_date}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {view === 'create' ? 'Create' : 'Update'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
