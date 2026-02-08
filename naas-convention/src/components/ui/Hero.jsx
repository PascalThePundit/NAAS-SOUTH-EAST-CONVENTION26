import React, { useState, useRef } from 'react';
import './Hero.css';
import PitchEntry from '../business-pitch/PitchEntry';

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [verifiedUID, setVerifiedUID] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
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
        <div className="mascot-cta-container" style={{ justifyContent: 'center', marginTop: '3rem', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn-hero" onClick={scrollToRegistration}>
            Register Now
          </button>
          
          <button 
            className="btn-pitch" 
            onClick={() => setIsPitchModalOpen(true)}
          >
            APPLY FOR BUSINESS PITCH – ₦200,000 Start Up
            <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.9, textTransform: 'none' }}>
                Ends 15th March
            </span>
          </button>
        </div>
      </div>

      <PitchEntry 
        isOpen={isPitchModalOpen} 
        onClose={() => setIsPitchModalOpen(false)}
        onVerified={(regData) => {
            console.log('Verified User:', regData);
            setVerifiedUID(regData.transaction_id);
            setIsVerified(true);
            // Will navigate to next stage later
        }}
      />
    </section>
  );
};

export default Hero;
