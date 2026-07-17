import React from 'react';
import pressData from '../data/press.json';

const Press = () => {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'transparent' }}>
      <div className="container" style={{ paddingBlock: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="text-overline">In The Media</span>
          <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem', fontSize: '3.5rem' }}>Press</h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', marginInline: 'auto' }}>
            Featured Articles and Media Coverage
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {pressData.map(item => (
            <div key={item.id} className="bento-card">
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: 'var(--fs-small)', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  {item.outlet}
                </span>
                <span style={{ fontSize: 'var(--fs-small)', color: '#A0AEC0' }}>
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                {item.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', flex: 1 }}>
                {item.description}
              </p>
              <a href={item.link} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', alignSelf: 'flex-start' }}>
                Read Article
              </a>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button style={{ 
            background: 'none', 
            border: '2px solid var(--color-border)', 
            padding: '0.75rem 2rem', 
            borderRadius: '2rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            cursor: 'pointer'
          }}>
            Older Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default Press;
