<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
// Pastikan file Catalog.js sudah ada atau buat komponen placeholder sementara
=======

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import AnggotaDashboard from "./components/dashboard/AnggotaDashboard";
>>>>>>> d23618646845f654c14ce7389810f82842e0bbd5

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        {/* Halaman Publik (Full Screen Split Panel) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Halaman Terproteksi (Dengan Sidebar & Navbar Dinamis) */}
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
            {/* HALAMAN LAINNYA MASUKIN SINIIIII */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
=======
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/anggota/dashboard"
          element={<AnggotaDashboard />}
        />

        <Route path="*" element={<Navigate to="/login" />} />
>>>>>>> d23618646845f654c14ce7389810f82842e0bbd5
      </Routes>
    </BrowserRouter>
  );
}

export default App;