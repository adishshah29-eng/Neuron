import React from 'react';

const Footer = () => {
  return (
    <footer 
      style={{ 
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'black', 
        color: 'rgba(255, 255, 255, 0.7)',
        padding: '6rem 0 2rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', 
          gap: 'clamp(2rem, 4vw, 4rem)',
          marginBottom: '4rem'
        }}>
          {/* Brand Column */}
          <div className="footer-brand">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'white', letterSpacing: '0.05em' }}>
              SHARPER SENSE
            </h2>
            <p style={{ maxWidth: '400px', lineHeight: 1.7, marginBottom: '2rem' }}>
              Pioneering non-invasive neuromodulation to unlock human potential and restore sensory acuity.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="https://www.linkedin.com/company/SharperSense" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cta)', fontWeight: 600 }}>LinkedIn</a>
              <a href="https://x.com/SharperSenseInc" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cta)', fontWeight: 600 }}>X (Twitter)</a>
              <a href="https://www.instagram.com/SharperSense/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cta)', fontWeight: 600 }}>Instagram</a>
              <a href="https://www.facebook.com/TrySharperSense/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cta)', fontWeight: 600 }}>Facebook</a>
            </div>
          </div>
          
          {/* Links Column 1 */}
          <div>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="/about" style={{ transition: 'color 0.2s' }}>About Us</a></li>
              <li><a href="/careers" style={{ transition: 'color 0.2s' }}>Careers</a></li>
              <li><a href="/contact" style={{ transition: 'color 0.2s' }}>Contact</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="/science" style={{ transition: 'color 0.2s' }}>The Science</a></li>
              <li><a href="/press" style={{ transition: 'color 0.2s' }}>Press & Media</a></li>
              <li><a href="#early-access" style={{ transition: 'color 0.2s' }}>Early Access</a></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', maxWidth: '800px', lineHeight: 1.6, opacity: 0.6 }}>
            * This product is intended for general wellness and is not a medical device. 
            It is not intended to diagnose, treat, cure, or prevent any disease or medical condition.
          </p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} Sharper Sense. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
