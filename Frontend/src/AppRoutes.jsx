import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Register from './pages/Register'; 
import Login from './pages/Login';       
import Home from './pages/Home';        

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        {/* Redirect unknown paths to home */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
