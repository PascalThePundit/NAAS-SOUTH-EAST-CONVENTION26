import React, { useState } from 'react';
import './layout.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--frosted-silver)', border: '1px solid rgba(255,255,255,0.2)' }}>N</div>
            <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--frosted-silver)', border: '1px solid rgba(255,255,255,0.2)' }}>E</div>
        </div>
        <a href="/" className="nav-brand text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
          NAAS Convention
        </a>
      </div>
      
      {/* Mobile Hamburger Toggle */}
      <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
        <li><a href="#hero" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</a></li>
        <li><a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a></li>
        <li><a href="#schedule" className="nav-link" onClick={() => setIsMenuOpen(false)}>Schedule</a></li>
        <li><a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
        <li>
          <a href="#register" className="btn-register-nav" onClick={() => setIsMenuOpen(false)}>
            Register
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;