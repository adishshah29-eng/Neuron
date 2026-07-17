import React from 'react';

const SpaceBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      backgroundColor: '#000000',
      pointerEvents: 'none'
    }} />
  );
};

export default SpaceBackground;
