import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      transition: 'background-color 0.3s ease, padding 0.3s ease',
      backgroundColor: isScrolled ? 'var(--color-bg-alt)' : 'transparent',
      boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      padding: isScrolled ? '1rem 0' : '1.5rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          SHARPER SENSE
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
          <Link to="/#about" style={{ fontWeight: 500 }}>About</Link>
          <Link to="/#team" style={{ fontWeight: 500 }}>Team</Link>
          <Link to="/science" style={{ fontWeight: 500 }}>Science</Link>
          <Link to="/press" style={{ fontWeight: 500 }}>Press</Link>
          <Link to="/careers" style={{ fontWeight: 500 }}>Careers</Link>
          <Link to="/#contactus" style={{ fontWeight: 500 }}>Contact</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--color-bg-alt)',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <Link to="/#about" style={{ padding: '1rem 1.5rem' }}>About</Link>
          <Link to="/#team" style={{ padding: '1rem 1.5rem' }}>Team</Link>
          <Link to="/science" style={{ padding: '1rem 1.5rem' }}>Science</Link>
          <Link to="/press" style={{ padding: '1rem 1.5rem' }}>Press</Link>
          <Link to="/careers" style={{ padding: '1rem 1.5rem' }}>Careers</Link>
          <Link to="/#contactus" style={{ padding: '1rem 1.5rem' }}>Contact</Link>
        </div>
      )}
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
