import React from 'react';

export default function AuthVisualPanel({ title, subtitle }) {
  return (
    <div className="auth-visual-panel">
      {/* Brand Header */}
      <div className="auth-brand">
        <div className="auth-brand-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>
        <span className="auth-brand-name">DigiLib</span>
      </div>

      {/* Ilustrasi Vektor Perpustakaan */}
      <div className="auth-illustration-box">
        <svg
          className="auth-illustration-svg"
          viewBox="0 0 360 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Latar Lengkung */}
          <rect x="40" y="24" width="280" height="200" rx="28" fill="#F6F3ED" fillOpacity="0.12" />
          
          {/* Rak Buku */}
          <rect x="75" y="186" width="210" height="10" rx="5" fill="#D8C5A4" />
          <rect x="92" y="196" width="12" height="22" rx="3" fill="#5B4034" />
          <rect x="256" y="196" width="12" height="22" rx="3" fill="#5B4034" />

          {/* Susunan Buku Berdiri */}
          <rect x="92" y="96" width="26" height="90" rx="4" fill="#D8C5A4" />
          <rect x="97" y="108" width="16" height="4" rx="2" fill="#5B4034" />
          <rect x="97" y="170" width="16" height="4" rx="2" fill="#5B4034" />

          <rect x="122" y="82" width="30" height="104" rx="4" fill="#F6F3ED" />
          <rect x="128" y="96" width="18" height="5" rx="2.5" fill="#7D8D6A" />
          <circle cx="137" cy="134" r="6" fill="#6E8FA8" />

          <rect x="156" y="102" width="24" height="84" rx="4" fill="#6E8FA8" />
          <rect x="161" y="114" width="14" height="3" rx="1.5" fill="#F6F3ED" />

          {/* Buku Miring */}
          <g transform="rotate(-12 195 145)">
            <rect x="188" y="96" width="26" height="90" rx="4" fill="#5B4034" />
            <rect x="194" y="110" width="14" height="4" rx="2" fill="#D8C5A4" />
          </g>

          {/* Kartu Katalog / Lencana Digital */}
          <rect x="228" y="64" width="68" height="50" rx="10" fill="#F6F3ED" />
          <rect x="238" y="76" width="28" height="5" rx="2.5" fill="#7D8D6A" />
          <rect x="238" y="86" width="46" height="4" rx="2" fill="#D8C5A4" />
          <rect x="238" y="95" width="38" height="4" rx="2" fill="#D8C5A4" />
        </svg>

        <h2 className="auth-visual-title">{title}</h2>
        <p className="auth-visual-desc">{subtitle}</p>
      </div>

      {/* Footer Info */}
      <div className="auth-visual-footer">
        <span>Sistem Informasi Perpustakaan</span>
        <span>Katalog &amp; Reservasi Ruang</span>
      </div>
    </div>
  );
}