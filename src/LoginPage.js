import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { email, password });
      console.log('Response:', response.data);
      if (response.status === 200 && response.data.message === "Login successful") {
        console.log('Navigating to dashboard');
        onLogin({ email });  // Update the user state in App.js
        navigate('/dashboard');
      } else {
        setErrorMessage('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
        {errorMessage && (
          <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
