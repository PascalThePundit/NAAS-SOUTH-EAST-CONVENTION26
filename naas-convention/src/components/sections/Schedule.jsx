import React, { useState } from 'react';
import './Schedule.css';

const scheduleData = [
  { 
    day: 'Day 1', 
    title: "Arrival / Accreditation", 
    desc: "Welcome delegates! Settling in and registration for the Quad-Zonal convention.",
    icon: "🛄"
  },
  { 
    day: 'Day 2', 
    title: "Opening Ceremony / Community Outreach", 
    desc: "Official commencement and reaching out to the local community with the YES spirit.",
    icon: "🤝"
  },
  { 
    day: 'Day 3', 
    title: "Sabbath Worship", 
    desc: "A day of spiritual renewal, rest, and corporate worship.",
    icon: "⛪"
  },
  { 
    day: 'Day 4', 
    title: "Business Pitch", 
    desc: "Empowering young entrepreneurs. Presenting innovative ideas for the future.",
    icon: "💼"
  },
  { 
    day: 'Day 5', 
    title: "Music Concert", 
    desc: "A night of celebration, music, and creative expression.",
    icon: "🎵"
  },
  { 
    day: 'Day 6', 
    title: "NAAS Sports Festival / Departure", 
    desc: "Concluding with athletic competitions and the official closing of the convention.",
    icon: "🏆"
  },
];

const Schedule = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="schedule-container glass-card">
      <div className="schedule-header">
        <h2 className="text-gold-gradient section-title">Event Schedule</h2>
        <p className="schedule-tagline">Daily Highlights</p>
      </div>
      
      {/* Tabs Navigation */}
      <div className="schedule-tabs-wrapper">
        <div className="schedule-tabs">
          {scheduleData.map((item, index) => (
            <button 
              key={index} 
              className={`tab-btn ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {item.day}
              {activeTab === index && <div className="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content Display */}
      <div className="schedule-content">
        <div className="content-card">
            <div className="content-icon">{scheduleData[activeTab].icon}</div>
            <div className="content-text">
                <h3 className="content-title">{scheduleData[activeTab].title}</h3>
                <p className="content-details">{scheduleData[activeTab].desc}</p>
            </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="download-section">
        <button className="btn-outline-gold disabled" disabled>
            Download Full PDF Timetable (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default Schedule;