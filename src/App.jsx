import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Shop from './Pages/Shop';
import Settings from './Pages/Settings';
import Conv from './Pages/Conv';
import Servers from './Pages/Servers';
import User from './Pages/User';
import Payment from './Pages/Payment';
import Admin from './Pages/Admin';
import LoadingOverlay from './Comps/LoadingOverlay';

const App = () => {
  const [loading, setLoading] = useState(false);

  const QueryRouter = () => {
    const query = new URLSearchParams(useLocation().search);
    const page = query.get('page');

    let Component;
    switch (page) {
      case 'login':
        Component = <Login />;
        break;
      case 'register':
        Component = <Register />;
        break;
      case 'admin':
        Component = (
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        );
        break;
      case 'shop':
        Component = (
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        );
        break;
      case 'settings':
        Component = (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        );
        break;
      case 'conv':
        Component = (
          <ProtectedRoute>
            <Conv />
          </ProtectedRoute>
        );
        break;
      case 'servers':
        Component = (
          <ProtectedRoute>
            <Servers />
          </ProtectedRoute>
        );
        break;
      case 'user':
        Component = (
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        );
        break;
      case 'payment':
        Component = (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        );
        break;
      default:
        Component = (
          <ProtectedRoute>
            <Dashboard setLoading={setLoading} />
          </ProtectedRoute>
        );
    }

    return (
      <Routes>
        <Route path="/" element={Component} />
      </Routes>
    );
  };

  return (
    <Router>
      <QueryRouter />
      {loading && <LoadingOverlay />}
    </Router>
  );
};

export default App;
