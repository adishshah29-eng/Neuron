import React from 'react';

const SpaceBackground = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100vh', 
      zIndex: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(circle at center, #1E293B 0%, #0B1121 100%)'
    }} />
  );
};

export default SpaceBackground;
