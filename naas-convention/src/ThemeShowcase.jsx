import React from 'react';
import './App.css';

const ThemeShowcase = () => {
  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <h1 className="text-gold-gradient" style={{ fontSize: 'var(--text-2xl)' }}>
          NAAS Quad-Zonal Convention
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', opacity: 0.8 }}>
          Visual Identity System: <span className="text-gold-gradient">YES Theme</span>
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>1. Color Palette & Typography</h2>
        <div className="grid-showcase">
          <div className="glass-card">
            <h3>Swatches</h3>
            <div className="color-swatch" style={{ background: 'var(--deep-cosmic-solid)' }}>Deep Cosmic</div>
            <div className="color-swatch" style={{ background: 'var(--gold-bronze)' }}>Bronze</div>
            <div className="color-swatch" style={{ background: 'var(--gold-gradient)' }}>Success Gold</div>
            <div className="color-swatch" style={{ background: 'var(--frosted-silver)' }}>Frosted Silver</div>
          </div>
          
          <div className="glass-card">
            <h3>Typography Hierarchy</h3>
            <h1>Heading 1 (Montserrat)</h1>
            <h2>Heading 2 (Montserrat)</h2>
            <p>Body text (Inter). This is a sample paragraph demonstrating high readability on a dark background. The "Deep Cosmic" theme allows for excellent contrast with Pure White text.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>2. Glassmorphism & Components</h2>
        <div className="grid-showcase">
          <div className="glass-card">
            <h3 className="text-gold-gradient">Premium Card</h3>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              This card uses a backdrop blur of 12px, a fine-line 1px border with a top highlight, 
              and a subtle radial gradient overlay.
            </p>
            <button className="btn-top-notch">Register Now</button>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Mascot Placeholder</h3>
            <div className="mascot-glow-container">
              <div className="mascot-glow"></div>
              <div className="mascot-placeholder">
                Mascot
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', textAlign: 'center', opacity: 0.7 }}>
              CSS-based "Glow" effect ready for asset integration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeShowcase;
