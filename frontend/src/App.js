
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./components/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import AdminDashboard from "./components/dashboard/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* Layout Admin */}
        <Route path="/admin" element={<MainLayout />}>
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Redirect halaman yang belum tersedia */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
