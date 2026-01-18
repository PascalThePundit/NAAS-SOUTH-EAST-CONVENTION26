import React, { useState } from 'react';
import './layout.css';
import logo1 from '../../assets/nav-logo-1.png';
import logo2 from '../../assets/nav-logo-2.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-logo-container">
            <img src={logo1} alt="Logo 1" className="nav-logo-img" />
            <img src={logo2} alt="Logo 2" className="nav-logo-img" />
        </div>
        <a href="/" className="nav-brand text-gold-gradient">
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