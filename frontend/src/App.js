
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import RoomBooking from './components/room-bookings/RoomBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Publik */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Halaman Terproteksi */}
        <Route element={<MainLayout />}>
          {/* HALAMAN ADMIN */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/booking-ruang" element={<RoomBooking />} />

          {/* HALAMAN ADMIN LAINNYA MENYUSUL */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
