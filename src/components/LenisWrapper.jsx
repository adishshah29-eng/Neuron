import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const LenisWrapper = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return; // Skip Lenis if reduced motion is requested
    }

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
    });
    
    lenisRef.current = lenis;

    lenis.on('scroll', (e) => {
      document.documentElement.style.setProperty('--scroll-y', e.scroll);
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default LenisWrapper;
