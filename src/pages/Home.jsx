import React from 'react';
import NeuralNetwork from '../components/3d/NeuralNetwork';
import teamData from '../data/team.json';
import advisorsData from '../data/advisors.json';

const Home = () => {
  return (
    <div style={{ backgroundColor: 'transparent' }}>
      {/* Hero Section with 3D Background */}
      <section style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <NeuralNetwork />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '4rem', 
              lineHeight: 1.1, 
              color: 'white',
              marginBottom: '1.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}>
              Unlock Your Potential.
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '2rem',
              maxWidth: '80%',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}>
              Sharper Sense develops non-invasive neuromodulation patches that safely enhance human performance, focus, and recovery.
            </p>
            <div style={{ pointerEvents: 'auto' }}>
              <a href="#early-access" className="btn-primary" style={{ marginRight: '1rem' }}>Get Early Access</a>
              <a href="#science" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>Read the Science →</a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             {/* Placeholder for future 3D element or floating cards */}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section style={{ backgroundColor: 'transparent' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '600px', marginInline: 'auto' }}>
            <span className="text-overline">The Technology</span>
            <h2 style={{ color: 'var(--color-primary-dark)' }}>How It Works</h2>
            <p style={{ marginInline: 'auto', marginTop: '1rem' }}>
              We've miniaturized targeted neuromodulation into a discreet, wearable patch that interfaces directly with your nervous system.
            </p>
          </div>
          
          <div className="bento-grid">
            <div className="bento-card" style={{ gridColumn: 'span 12' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontSize: '1.75rem' }}>Non-Invasive Stimulation</h3>
              <p>
                Sharper Sense patches deliver precise, imperceptible electrical patterns to peripheral nerves. This targeted stimulation upregulates sensory processing pathways, giving you unparalleled clarity when you need it most—without drugs or side effects.
              </p>
            </div>
            
            <div className="bento-card" style={{ gridColumn: 'span 6' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Clinically Validated</h3>
              <p>
                Backed by years of rigorous clinical trials and neuroscience research, our technology has been proven to enhance sensory acuity and cognitive focus in double-blind studies.
              </p>
            </div>
            
            <div className="bento-card" style={{ gridColumn: 'span 6' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Seamless Integration</h3>
              <p>
                Designed for everyday wear. The ultra-thin, breathable patch syncs instantly with your smartphone for personalized stimulation profiles and real-time biometric feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: 'transparent' }}>
        <div className="container">
          <div className="glass-panel" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '4rem', 
            alignItems: 'center',
            padding: '4rem'
          }}>
            <div>
              <span className="text-overline">Our Mission</span>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Bridging Neuroscience and Wellness</h2>
              <p style={{ fontSize: '1.125rem' }}>
                At Sharper Sense, we are pioneering non-invasive neuromodulation techniques to unlock human potential and restore sensory acuity. 
              </p>
              <p style={{ fontSize: '1.125rem', marginTop: '1rem' }}>
                We believe that everyone deserves the ability to experience the world with absolute clarity. Our team of leading neuroscientists and engineers is dedicated to pushing the boundaries of human performance.
              </p>
            </div>
            <div style={{ 
              backgroundColor: 'var(--color-border)', 
              borderRadius: 'var(--radius-lg)', 
              height: '100%', 
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Graphic Placeholder */}
              <p style={{ color: '#A0AEC0', fontWeight: '500' }}>[ Brand Graphic / Product Shot ]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={{ backgroundColor: 'transparent' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="text-overline">Leadership</span>
            <h2 style={{ color: 'var(--color-primary-dark)' }}>Meet the Team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '3rem' }}>
            {teamData.map(member => (
              <div key={member.id} style={{ textAlign: 'center' }}>
                <div className="avatar-container">
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary-dark)' }}>{member.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-cta)', fontWeight: '600', marginInline: 'auto' }}>{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors Section */}
      <section style={{ backgroundColor: 'transparent' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="text-overline">Experts</span>
            <h2 style={{ color: 'var(--color-primary-dark)' }}>Our Advisors</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {advisorsData.map(advisor => (
              <div key={advisor.id} className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-border)', flexShrink: 0 }}></div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.125rem', color: 'var(--color-primary-dark)' }}>{advisor.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{advisor.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="early-access" style={{ backgroundColor: 'transparent', paddingBlock: '8rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'linear-gradient(145deg, #14263F 0%, #0a1320 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '4rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            maxWidth: '1000px',
            marginInline: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <span className="text-overline" style={{ color: 'var(--color-cta)' }}>Beta Program</span>
              <h2 style={{ marginBottom: '1rem', color: 'white', fontSize: '2.5rem' }}>Secure Your Early Access.</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Join our exclusive waitlist to be among the very first to experience the future of human sensory enhancement.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>✓</div>
                  <span>Priority shipping on launch</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>✓</div>
                  <span>Exclusive pricing discounts</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>✓</div>
                  <span>Direct input on feature roadmap</span>
                </li>
              </ul>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Work Email</label>
                  <input 
                    type="email" 
                    placeholder="john@company.com" 
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(0,0,0,0.2)',
                      color: 'white',
                      outline: 'none', 
                      fontSize: '1rem',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-cta)', color: 'white', padding: '1.25rem', fontSize: '1rem', width: '100%', marginTop: '0.5rem' }}>
                  Join the Waitlist
                </button>
              </form>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginTop: '1.5rem', textAlign: 'center' }}>
                * This product is intended for general wellness. Not a medical device.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-vanta-container { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Home;
