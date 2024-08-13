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
    course: [],
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

  useEffect(() => {
    if (view === 'edit' && editingEmployee) {
      setFormData({
        name: editingEmployee.name,
        email: editingEmployee.email,
        mobile_no: editingEmployee.mobile_no,
        designation: editingEmployee.designation,
        gender: editingEmployee.gender,
        course: editingEmployee.course || [],
        created_date: new Date(editingEmployee.created_date).toISOString().split('T')[0],
        image: null,
      });
    }
  }, [view, editingEmployee]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      course: checked
        ? [...prevData.course, value]
        : prevData.course.filter((course) => course !== value),
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Create a new FormData object for employee data
    const data = new FormData();
    
    // Clear existing courses in the data if in edit mode
    if (view === 'edit' && editingEmployee) {
      data.append('courses', ''); // Send an empty array to clear existing courses
    }
  
    // Add new data to FormData
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        // Special handling for courses
        if (key === 'course') {
          // Add each course separately
          formData[key].forEach(course => data.append('course', course));
        } else {
          data.append(key, formData[key]);
        }
      }
    }
  
    try {
      if (view === 'create') {
        // Create a new employee
        await axios.post('/api/employees', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (view === 'edit' && editingEmployee) {
        // Step 1: Delete existing courses
        await axios.post(`/api/employees/${editingEmployee._id}/delete-courses`, {
          courses: editingEmployee.course,
        });
      
        // Step 2: Update employee with new data
        await axios.put(`/api/employees/${editingEmployee._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      // Refresh employee list and reset form state
      setView('list');
      setFormData({
        name: '',
        email: '',
        mobile_no: '',
        designation: '',
        gender: '',
        course: [],
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
  {paginatedEmployees.map((employee) => {
    // Define the base path you want to remove
    const basePath = 'C:\\Users\\dexte\\OneDrive\\Desktop\\new-project\\'; // Adjust this path as needed

    // Remove the base path from employee.image if it starts with it
    const imagePath = employee.image.startsWith(basePath) 
      ? employee.image.substring(basePath.length) 
      : employee.image;

    return (
      <tr key={employee._id}>
        <td className="border px-4 py-2">{employee._id}</td>
        <td className="border px-4 py-2">
          {employee.image && (
            <img 
              src={`/${imagePath}`} // Use the modified path
              alt={employee.name} 
              className="w-10 h-10 rounded-full" 
            />
          )}
        </td>
        <td className="border px-4 py-2">{employee.name}</td>
        <td className="border px-4 py-2">{employee.email}</td>
        <td className="border px-4 py-2">{employee.mobile_no}</td>
        <td className="border px-4 py-2">{employee.designation}</td>
        <td className="border px-4 py-2">{employee.gender}</td>
        <td className="border px-4 py-2">{employee.course.join(', ')}</td>
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
    );
  })}
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
              <select
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Designation</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="Sales">Sales</option>
              </select>
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
              <div className="flex flex-col">
                <label className="inline-flex items-center mt-2">
                  <input
                    type="checkbox"
                    value="MCA"
                    checked={formData.course.includes('MCA')}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">MCA</span>
                </label>
                <label className="inline-flex items-center mt-2">
                  <input
                    type="checkbox"
                    value="BCA"
                    checked={formData.course.includes('BCA')}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">BCA</span>
                </label>
                <label className="inline-flex items-center mt-2">
                  <input
                    type="checkbox"
                    value="BSc"
                    checked={formData.course.includes('BSc')}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">BSc</span>
                </label>
              </div>
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
