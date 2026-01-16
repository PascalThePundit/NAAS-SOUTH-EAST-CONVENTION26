import React from 'react';
import './layout.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p style={{ color: 'var(--frosted-silver)', fontSize: 'var(--text-sm)' }}>
        © 2026 NAAS Quad-Zonal Convention. All Rights Reserved.
      </p>
      <div className="footer-links">
        <span className="social-link">Instagram</span>
        <span className="social-link">Twitter</span>
        <span className="social-link">LinkedIn</span>
      </div>
    </footer>
  );
};

export default Footer;
