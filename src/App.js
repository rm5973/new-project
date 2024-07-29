import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const loginUser = (userInfo) => {
    setUser(userInfo);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage onLogin={loginUser} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={logoutUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
