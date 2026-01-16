import React, { useEffect, useRef, useState } from 'react';
import '../layout/layout.css'; // Import shared layout styles for animation classes

const Section = ({ id, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when 15% of the element is visible
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optional: Unobserve if you only want it to animate once
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Slightly offset trigger point
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      id={id} 
      ref={sectionRef} 
      className={`section-wrapper ${isVisible ? 'section-visible' : ''} ${className}`}
    >
      {children}
    </section>
  );
};

export default Section;
