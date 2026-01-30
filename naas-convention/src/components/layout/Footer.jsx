import React, { useEffect, useState } from 'react';
import './layout.css';
import { getVisitorCount } from '../../lib/analytics';

const Footer = () => {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    async function fetchCount() {
      const count = await getVisitorCount();
      if (count !== null) setVisitorCount(count);
    }
    fetchCount();
  }, []);

  return (
    <footer className="footer">
      <p style={{ color: 'var(--frosted-silver)', fontSize: 'var(--text-sm)' }}>
        © 2026 NAAS Quad-Zonal Convention. All Rights Reserved.
      </p>
      {visitorCount !== null && (
        <p style={{ color: 'var(--frosted-silver)', fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Visitors: {visitorCount.toLocaleString()}
        </p>
      )}
      <div className="footer-links">
        <span className="social-link">Instagram</span>
        <span className="social-link">Twitter</span>
        <span className="social-link">LinkedIn</span>
      </div>
    </footer>
  );
};

export default Footer;
