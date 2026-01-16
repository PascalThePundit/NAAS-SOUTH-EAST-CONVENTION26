import React from 'react';
import './Schedule.css';

const Schedule = () => {
  return (
    <div className="schedule-container glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h2 className="text-gold-gradient section-title">Convention Timetable</h2>
      
      <div style={{ 
        border: '1px dashed var(--gold-mid)', 
        borderRadius: '12px', 
        padding: '3rem',
        background: 'rgba(0,0,0,0.2)',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Full Timetable: Coming Soon</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          We are finalizing an impactful agenda for you. Stay tuned.
        </p>
      </div>
    </div>
  );
};

export default Schedule;