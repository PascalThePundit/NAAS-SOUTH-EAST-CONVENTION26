import React, { useState } from 'react';
import './Schedule.css';

const scheduleData = [
  { 
    day: 'Day 1', 
    title: "Arrival & Consecration", 
    desc: "Registration, Accommodation, and the Opening 'Acts 1:8' Fire Session.",
    icon: "🔥"
  },
  { 
    day: 'Day 2', 
    title: "The Mental & Spiritual Pillar", 
    desc: "Morning Devotion, Keynote on Intellectual Growth, and Bible Quiz Competitions.",
    icon: "🧠"
  },
  { 
    day: 'Day 3', 
    title: "The Economic Pillar", 
    desc: "Intensive Skill Acquisition Labs (Baking, Perfume Making, Digital Marketing, etc.).",
    icon: "💰"
  },
  { 
    day: 'Day 4', 
    title: "The Physical & Social Pillar", 
    desc: "Morning Aerobics, Inter-Zonal Sports Competitions, and Zonal Cultural Night.",
    icon: "🏃"
  },
  { 
    day: 'Day 5', 
    title: "Empowerment & Commissioning", 
    desc: "Advanced Skill Workshops, Entrepreneurship Seminar, and the Grand 'YES' Night of Favors.",
    icon: "✨"
  },
  { 
    day: 'Day 6', 
    title: "Departure & Impact", 
    desc: "Final Breakfast, Exchange of Contacts, and Departure to our various institutions.",
    icon: "🚌"
  },
];

const Schedule = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="schedule-container glass-card">
      <div className="schedule-header">
        <h2 className="text-gold-gradient section-title">Event Schedule</h2>
        <p className="schedule-tagline">"Growing in Wisdom, Stature, and Favor (Luke 2:52)"</p>
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