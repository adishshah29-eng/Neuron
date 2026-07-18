import React from 'react';
import { motion } from 'framer-motion';
import NeuralNetwork from '../components/3d/NeuralNetwork';

// Animation Presets
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
import { Activity, Brain, Zap, Shield, Smartphone } from 'lucide-react';
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
        
        <div
          className="responsive-grid-2"
          style={{
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'none',
            maxWidth: '1200px',
            width: '100%',
          }}>
          <motion.div {...fadeLeft}>
            <h1 style={{ 
              fontSize: '4.5rem', 
              lineHeight: 1.1, 
              color: 'white',
              marginBottom: '1.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}>
              Clarity When It Counts.
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
          </motion.div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             {/* Placeholder for future 3D element or floating cards */}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1, paddingBlock: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '700px', marginInline: 'auto' }}>
            <span className="text-overline">The Technology</span>
            <h2 style={{ color: 'var(--text-h)' }}>How It Works</h2>
            <p style={{ marginInline: 'auto', marginTop: '1rem', color: 'var(--text)', fontSize: '1.125rem' }}>
              We've miniaturized targeted neuromodulation into a discreet, wearable patch that interfaces directly with your nervous system.
            </p>
          </div>
          
          <motion.div className="bento-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {/* Card 1: Our Technology */}
            <motion.div className="bento-card" variants={staggerItem} style={{ 
              gridColumn: 'span 4', 
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              backdropFilter: 'blur(24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <Brain size={24} color="var(--color-cta)" />
                <h3 style={{ margin: 0, color: 'white', textTransform: 'uppercase' }}>Our Technology</h3>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Single-use neurostimulation patches that enhance cognition and sensory processing while worn on the neck. Hands-free, maintenance-free, safe, and comfortable.
              </p>
            </motion.div>
            
            {/* Card 2: The Science */}
            <motion.div className="bento-card" variants={staggerItem} style={{ 
              gridColumn: 'span 4',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              backdropFilter: 'blur(24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <Shield size={24} color="#60A5FA" />
                <h3 style={{ margin: 0, color: 'white', textTransform: 'uppercase' }}>The Science</h3>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                The Sharper Sense patch delivers an electric field that noninvasively stimulates nerves in your neck. These nerves project to the brain and primarily causes release of norepinephrine, which enhances cognition and sensory processing.
              </p>
            </motion.div>
            
            {/* Card 3: Applications */}
            <motion.div className="bento-card" variants={staggerItem} style={{ 
              gridColumn: 'span 4',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              backdropFilter: 'blur(24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <Activity size={24} color="#C084FC" />
                <h3 style={{ margin: 0, color: 'white', textTransform: 'uppercase' }}>Applications</h3>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Fatigue and distractions impair sensory processing increasing risk of human error and injury. Sharper Sense provides clarity when it counts towards safety and success. Users in military, sports, first responders, shift workers, students, and older adults.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1, paddingBlock: '4rem' }}>
        <div className="container">
          <div className="glass-panel responsive-grid-2" style={{ 
            padding: '3rem'
          }}>
            <motion.div {...fadeUp}>
              <span className="text-overline">Our Mission</span>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-h)' }}>Bridging Neuroscience and Wellness</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                At Sharper Sense, we are pioneering non-invasive neuromodulation techniques to unlock human potential and restore sensory acuity. 
              </p>
              <p style={{ fontSize: '1.125rem', marginTop: '1rem', color: 'var(--text)' }}>
                We believe that everyone deserves the ability to experience the world with absolute clarity. Our team of leading neuroscientists and engineers is dedicated to pushing the boundaries of human performance.
              </p>
            </motion.div>
            <motion.div {...fadeUp} style={{ 
              position: 'relative',
              borderRadius: 'var(--radius-lg)', 
              height: '100%', 
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '1px solid rgba(20, 184, 166, 0.2)'
            }}>
              {/* High-Tech Background Glow */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 60%)',
                zIndex: 0
              }} />
              
              {/* Product Image */}
              <img 
                src="/assets/sensor.jpg" 
                alt="Sharper Sense Neuro-Sensor" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  opacity: 0.9,
                  mixBlendMode: 'lighten'
                }} 
              />

              {/* Gradient Overlay for Depth */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(10, 19, 32, 0.1) 0%, rgba(10, 19, 32, 0.7) 100%)',
                zIndex: 2,
                pointerEvents: 'none'
              }} />

              {/* Tech UI Accents */}
              <div style={{
                position: 'absolute',
                top: '1rem', left: '1rem',
                width: '30px', height: '30px',
                borderTop: '2px solid var(--color-cta)',
                borderLeft: '2px solid var(--color-cta)',
                zIndex: 3
              }} />
              <div style={{
                position: 'absolute',
                bottom: '1rem', right: '1rem',
                width: '30px', height: '30px',
                borderBottom: '2px solid var(--color-cta)',
                borderRight: '2px solid var(--color-cta)',
                zIndex: 3
              }} />
              
              {/* Overlay Text/Data */}
              <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                zIndex: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-cta)', boxShadow: '0 0 10px var(--color-cta)' }} />
                  <span style={{ color: 'var(--color-cta)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px' }}>STATUS: ACTIVE</span>
                </div>
                <span style={{ color: 'white', fontSize: '0.875rem', letterSpacing: '1px', opacity: 0.8 }}>NEURAL LINK ESTABLISHED</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1, paddingBlock: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="text-overline">Leadership</span>
            <h2 style={{ color: 'var(--text-h)' }}>Meet the Team</h2>
          </div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {teamData.map(member => (
              <motion.div key={member.id} variants={staggerItem} className="bento-card" style={{ 
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                backdropFilter: 'blur(16px)',
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(20, 184, 166, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                  border: '2px solid rgba(20, 184, 166, 0.3)',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.15)',
                  padding: '4px',
                  background: 'var(--surface)'
                }}>
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>{member.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-cta)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{member.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advisors Section */}
      <section style={{ backgroundColor: 'transparent', overflow: 'hidden', paddingBlock: '4rem', position: 'relative', zIndex: 1 }}>
        <motion.div className="container" style={{ marginBottom: '2rem' }} {...fadeUp}>
          <div style={{ textAlign: 'center' }}>
            <span className="text-overline">Experts</span>
            <h2 style={{ color: 'var(--text-h)' }}>Our Advisors</h2>
          </div>
        </motion.div>

        <div className="marquee-container" style={{ display: 'flex', width: '100%', overflow: 'hidden', paddingBlock: '2rem', marginBlock: '-2rem' }}>
          <div className="marquee-content" style={{ display: 'flex', gap: '2rem', paddingRight: '2rem', animation: 'marquee 40s linear infinite', alignItems: 'center' }}>
            {advisorsData.map(advisor => (
              <div key={advisor.id} className="advisor-card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--color-primary-dark)' }}>{advisor.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{advisor.title}</p>
              </div>
            ))}
          </div>
          {/* Duplicate for seamless looping */}
          <div className="marquee-content" aria-hidden="true" style={{ display: 'flex', gap: '2rem', paddingRight: '2rem', animation: 'marquee 40s linear infinite' }}>
            {advisorsData.map(advisor => (
              <div key={`${advisor.id}-dup`} className="advisor-card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--color-primary-dark)' }}>{advisor.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#718096', margin: 0 }}>{advisor.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ backgroundColor: 'transparent', paddingBlock: '4rem', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="text-overline">Testimonials</span>
            <h2 style={{ color: 'var(--text-h)' }}>What People Are Saying</h2>
          </div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {[
              {
                id: 1,
                name: "Dr. Elena Rodriguez",
                role: "Neuroscientist",
                quote: "Sharper Sense is redefining what we thought was possible with non-invasive wearables. The clarity it provides is unprecedented."
              },
              {
                id: 2,
                name: "Michael Chang",
                role: "Professional Athlete",
                quote: "In high-pressure situations, focus is everything. This technology gives me the edge I need to perform at my absolute peak."
              },
              {
                id: 3,
                name: "Sarah Jenkins",
                role: "Surgeon",
                quote: "The ability to maintain extended concentration without fatigue has transformed my surgical practice. Truly groundbreaking."
              }
            ].map(testimonial => (
              <motion.div key={testimonial.id} variants={staggerItem} className="testimonial-card">
                <div style={{ color: 'var(--color-cta)', fontSize: '3rem', fontFamily: 'serif', marginBottom: '1rem', lineHeight: '0.5' }}>"</div>
                <p style={{ fontSize: '1.125rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', flexGrow: 1 }}>
                  {testimonial.quote}
                </p>
                <div>
                  <h4 style={{ color: 'white', margin: 0, fontSize: '1.125rem' }}>{testimonial.name}</h4>
                  <span style={{ color: 'var(--color-cta)', fontSize: '0.875rem', fontWeight: 500 }}>{testimonial.role}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="early-access" style={{ backgroundColor: 'transparent', paddingBlock: '4rem', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
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
          <motion.div className="responsive-grid-2" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '4rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            maxWidth: '1000px',
            marginInline: 'auto'
          }} {...fadeUp}>
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
                <div className="responsive-form-grid" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>First Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      required
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid var(--border)', 
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--text-h)',
                        outline: 'none', 
                        fontSize: '1rem',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-cta)';
                        e.target.style.boxShadow = '0 0 0 2px var(--color-cta-dim)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      required
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid var(--border)', 
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--text-h)',
                        outline: 'none', 
                        fontSize: '1rem',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-cta)';
                        e.target.style.boxShadow = '0 0 0 2px var(--color-cta-dim)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
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
                      border: '1px solid var(--border)', 
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--text-h)',
                      outline: 'none', 
                      fontSize: '1rem',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-cta)';
                      e.target.style.boxShadow = '0 0 0 2px var(--color-cta-dim)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
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
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-vanta-container { display: none; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused !important;
        }

        /* Pro UI Animations */
        .advisor-card {
          width: 250px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .advisor-card:hover {
          transform: translateY(-5px) scale(1.02);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(20, 184, 166, 0.5);
          box-shadow: 0 15px 25px rgba(20, 184, 166, 0.15), 0 0 15px rgba(20, 184, 166, 0.1);
        }

        .testimonial-card {
          background: linear-gradient(145deg, var(--surface) 0%, rgba(15,23,42,0.6) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .testimonial-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.8), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255,255,255,0.1);
        }
        .testimonial-card:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Home;
