import React, { useState, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const heroRef = useRef(null);
  
  // Handle Mouse Move for Light Leak effect
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x: `${x}%`, y: `${y}%` });
  };

  const scrollToRegistration = () => {
    const section = document.getElementById('contact');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="hero-container" 
      ref={heroRef} 
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
    >
      <div className="hero-light-leak"></div>

      <div className="hero-content">
        {/* Interactive Headers */}
        <div className="hero-title-wrapper">
          <h1 className="hero-title">
            NAAS Quad-Zonal<br />Convention 2026
          </h1>
          <p className="hero-subtitle" style={{ fontStyle: 'italic', maxWidth: '800px' }}>
            "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me..." — Acts 1:8
          </p>
        </div>

        {/* CTA */}
        <div className="mascot-cta-container" style={{ justifyContent: 'center', marginTop: '3rem' }}>
          <button className="btn-hero" onClick={scrollToRegistration}>
            Register Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
