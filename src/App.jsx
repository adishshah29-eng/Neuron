import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LenisWrapper from './components/LenisWrapper';
import SpaceBackground from './components/3d/SpaceBackground';
import ChatWidget from './components/chat/ChatWidget';

// Pages
import Home from './pages/Home';
import Science from './pages/Science';
import Press from './pages/Press';
import Careers from './pages/Careers';

const ScrollToAnchor = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, useLocation().pathname]);

  return null;
};

function App() {
  return (
    <LenisWrapper>
      <SpaceBackground />
      <Navigation />
      <ScrollToAnchor />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/science" element={<Science />} />
          <Route path="/press" element={<Press />} />
          <Route path="/careers" element={<Careers />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </LenisWrapper>
  );
}

export default App;
