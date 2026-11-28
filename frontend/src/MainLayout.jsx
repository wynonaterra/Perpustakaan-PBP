
import React from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation
} from "react-router-dom";

const ADMIN_MENUS = [
  {
    section: "Utama",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
    ]
  },
  {
    section: "Master Data",
    items: [
      { label: "Kelola Buku", path: "/admin/buku", icon: "menu_book" },
      { label: "Data Anggota", path: "/admin/anggota", icon: "group" },
      { label: "Kelola Ruangan", path: "/admin/ruangan", icon: "meeting_room" },
    ]
  },
  {
    section: "Sirkulasi & Layanan",
    items: [
      { label: "Peminjaman Buku", path: "/admin/peminjaman", icon: "swap_horiz" },
      { label: "Pengembalian", path: "/admin/pengembalian", icon: "assignment_return" },
      { label: "Booking Ruangan", path: "/admin/booking-ruang", icon: "event_available" },
      { label: "Data Denda", path: "/admin/denda", icon: "payments" },
    ]
  }
];

const ANGGOTA_MENUS = [
  {
    section: "Eksplorasi",
    items: [
      { label: "Katalog Buku", path: "/katalog", icon: "auto_stories" },
      { label: "Booking Ruangan", path: "/ruangan", icon: "meeting_room" },
    ]
  },
  {
    section: "Aktivitas Saya",
    items: [
      { label: "Pinjaman Saya", path: "/pinjaman-saya", icon: "bookmark_added" },
      { label: "Riwayat Booking", path: "/booking-saya", icon: "calendar_month" },
      { label: "Tagihan Denda", path: "/denda-saya", icon: "receipt_long" },
    ]
  }
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  let storedUser = {};

  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    storedUser = {};
  }

  // Menentukan role berdasarkan URL untuk sementara
  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : storedUser.role || "anggota";

  const namaLengkap =
    storedUser.nama_lengkap ||
    storedUser.name ||
    (role === "admin" ? "Administrator" : "Anggota Perpus");

  const nomorAnggota = storedUser.nomor_anggota;

  const menuGroups = role === "admin"
    ? ADMIN_MENUS
    : ANGGOTA_MENUS;

  const allItems = menuGroups.flatMap(group => group.items);

  const currentMenu = allItems.find(
    item => location.pathname === item.path
  );

  const pageTitle = currentMenu
    ? currentMenu.label
    : "Perpustakaan Digital";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = namaLengkap
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(name => name[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <span className="material-symbols-outlined">
                local_library
              </span>
            </div>

            <div>
              <div className="sidebar-brand-title">
                Digilib
              </div>

              <div className="sidebar-brand-sub">
                {role === "admin"
                  ? "Panel Pustakawan"
                  : "Portal Anggota"}
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuGroups.map(group => (
              <div key={group.section}>
                <div className="sidebar-section-label">
                  {group.section}
                </div>

                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">
              logout
            </span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="app-main-wrapper">

        {/* NAVBAR */}
        <header className="app-navbar">
          <div className="navbar-left">
            <h2 className="navbar-page-title">
              {pageTitle}
            </h2>
          </div>

          <div className="navbar-right">
            {role === "anggota" && nomorAnggota && (
              <span className="badge badge-info">
                {nomorAnggota}
              </span>
            )}

            <div className="user-pill">
              <div className="user-avatar">
                {initials}
              </div>

              <div className="user-meta">
                <span className="user-name">
                  {namaLengkap}
                </span>

                <span className="user-role">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="app-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
