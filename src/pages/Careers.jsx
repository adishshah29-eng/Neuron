import React from 'react';

const Careers = () => {
  return (
    <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 400px)', backgroundColor: 'transparent' }}>
      <div className="container" style={{ paddingBlock: '4rem', textAlign: 'center' }}>
        <span className="text-overline">Careers</span>
        <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '1.5rem', fontSize: '3.5rem' }}>Join the Team</h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 4rem' }}>
          We are always looking for passionate individuals to help us build the future of neuromodulation and human enhancement.
        </p>

        <div className="bento-card" style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
            No open roles right now — check back soon!
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            Even if we don't have a role that fits you right now, we'd still love to hear from you.
          </p>
          <a href="mailto:careers@sharpersense.com" className="btn-primary">
            Send us your resume
          </a>
        </div>
      </div>
    </div>
  );
};

export default Careers;
