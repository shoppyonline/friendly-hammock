import React from 'react';

const Header = () => (
  <header style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  }}>
    <img
      src={process.env.PUBLIC_URL + '/header.png'}
      alt="Just Like You! header with children illustration"
      style={{
        width: '100%',
        maxWidth: 600,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
    />
  </header>
);

export default Header; 