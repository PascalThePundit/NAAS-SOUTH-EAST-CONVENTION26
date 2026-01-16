import React from 'react';
import Layout from './components/layout/Layout';
import Section from './components/ui/Section';
import Hero from './components/ui/Hero';
import InfoSection from './components/sections/InfoSection';
import RegistrationForm from './components/registration/RegistrationForm';
import Schedule from './components/sections/Schedule';
import './App.css'; // Global styles

function App() {
  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* When and Where - Info Section */}
      <Section id="essence">
        <InfoSection />
      </Section>

      {/* Schedule Section - 6 Days */}
      <Section id="schedule">
        <Schedule />
      </Section>

      {/* Why You Should Attend Section */}
      <Section id="about">
        <div className="glass-card">
          <h2 className="text-gold-gradient">Why You Should Attend</h2>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>YES: Young Empowered Students</h3>
          
          <p style={{ marginBottom: 'var(--space-md)' }}>
            This convention is built on the pillars of Luke 2:52 — tailored for <strong>Spiritual, Mental, Physical, Social, and Financial empowerment</strong>.
          </p>
          
          <p>
            This is a focused, practical experience designed to equip students with real skills and a pathway to earning while in school. 
            Don't just attend an event; step into your future.
          </p>
        </div>
      </Section>

      {/* Contact/Registration Section */}
      <Section id="contact">
        <div style={{ textAlign: 'center', maxWidth: '100%', margin: '0 auto' }}>
          <h2>Ready to Ascend?</h2>
          <p style={{ marginBottom: 'var(--space-xl)' }}>
            Secure your spot. Limited tickets available.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RegistrationForm />
          </div>
        </div>
      </Section>
    </Layout>
  );
}

export default App;