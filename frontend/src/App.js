import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Publik (Full Screen Split Panel) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Halaman Terproteksi (Dengan Sidebar & Navbar Dinamis) */}
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
            {/* HALAMAN LAINNYA MASUKIN SINIIIII */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;