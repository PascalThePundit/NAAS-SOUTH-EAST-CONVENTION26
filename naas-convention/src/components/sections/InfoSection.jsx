import React, { useEffect, useRef, useState } from 'react';
import Countdown from '../ui/Countdown';
import './InfoSection.css';

const InfoSection = () => {
  const zones = ['Enugu', 'Imo', 'Ebonyi', 'Anambra'];
  const [showMap, setShowMap] = useState(false);

  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const hiddenElements = sectionRef.current.querySelectorAll('.stagger-reveal');
    hiddenElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <section className="info-section" ref={sectionRef}>
      <div className="info-container">
        
        <div className="stagger-reveal reveal-up header-group">
           <h2 className="section-title text-gold-gradient">The Gathering</h2>
           <p className="section-subtitle">April 2nd — 7th, 2026</p>
        </div>

        <div className="stagger-reveal reveal-up">
            <Countdown targetDate="2026-04-02T09:00:00" />
        </div>

        <div className="venue-spotlight stagger-reveal reveal-left">
          <div className="glass-card venue-card">
            <div className="venue-content">
              <h3 className="venue-title">Federal Government College</h3>
              <p className="venue-location">Enugu, Nigeria</p>
              <p className="venue-desc">
                Experience the convergence of minds in the heart of the Coal City. 
                A venue chosen for its legacy and capacity to host history.
              </p>
              
              {/* Map Display Area */}
              <div className="map-display-container">
                  {!showMap ? (
                      <div className="map-preview-card" onClick={() => setShowMap(true)}>
                        <div className="map-preview-img">
                          <div className="map-marker-ping"></div>
                        </div>
                        <div className="map-preview-content">
                          <span className="map-label">Interactive Map</span>
                          <span className="map-hint">Click to expand venue details</span>
                        </div>
                      </div>
                  ) : (
                      <div className="map-inline-frame" style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--gold-mid)', marginBottom: 'var(--space-md)' }}>
                          <iframe 
                            title="Venue Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.717654321456!2d7.5000!3d6.4500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x105b677a2d480831%3A0x6281085387f374c4!2sFederal%20Government%20College%20Enugu!5e0!3m2!1sen!2sng!4v1675123456789!5m2!1sen!2sng" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                      </div>
                  )}
              </div>

              <button className="venue-btn" onClick={() => setShowMap(!showMap)}>
                {showMap ? 'Close Map' : 'View on Map'}
                <div className="btn-pulse"></div>
              </button>

            </div>
          </div>
        </div>

        <div className="zonal-grid">
          {zones.map((zone, index) => (
            <div 
              key={zone} 
              className={`glass-card zone-card stagger-reveal ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="zone-content">
                <h4 className="zone-name text-gold-gradient">{zone}</h4>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};

export default InfoSection;