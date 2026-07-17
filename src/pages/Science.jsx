import React from 'react';
import publicationsData from '../data/publications.json';

const Science = () => {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ paddingBlock: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="text-overline">Clinical Validation</span>
          <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem', fontSize: '3.5rem' }}>The Science</h1>
          <p style={{ fontSize: '1.25rem', color: '#4B5563', marginInline: 'auto' }}>
            A Well-Documented Mechanism of Action
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {publicationsData.map(pub => (
            <div key={pub.id} className="bento-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: 'var(--fs-small)', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {pub.journal}
                </span>
                <span style={{ fontSize: 'var(--fs-small)', color: '#A0AEC0' }}>
                  {new Date(pub.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                {pub.title}
              </h3>
              <p style={{ fontSize: 'var(--fs-small)', color: '#718096', marginBottom: '1rem' }}>
                {pub.authors}
              </p>
              <p style={{ color: '#4A5568', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {pub.description}
              </p>
              <a href={pub.link} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Read Paper
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Science;
