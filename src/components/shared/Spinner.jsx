import React from 'react';

const Spinner = ({ size = 48, color = '#4fa94d' }) => {
  const style = {
    width: size,
    height: size,
    border: `${Math.max(2, Math.floor(size / 12))}px solid rgba(0,0,0,0.1)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'bbm-spin 1s linear infinite',
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <div style={style} />
      <style>{`@keyframes bbm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Spinner;


