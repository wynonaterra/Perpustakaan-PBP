
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Sementara untuk pengujian navigasi.
    // Nanti diganti dengan autentikasi API Laravel.
    const role = prompt("Masukkan role: admin atau anggota");

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "anggota") {
      navigate("/anggota/dashboard");
    } else {
      alert("Role tidak valid!");
    }
  };

  return (
    <div>
      <h2>Login Sistem Perpustakaan</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
