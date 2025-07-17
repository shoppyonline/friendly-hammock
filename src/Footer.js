import React from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

const MobileLogoBar = () => (
  <div
    className="mobile-logo-bar"
    style={{
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100vw',
      background: '#fff',
      borderTop: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '8px 0',
      pointerEvents: 'auto',
    }}
  >
    <a
      href="https://varietyalberta.ca/"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', cursor: 'pointer', marginRight: 8 }}
    >
      <img
        src={process.env.PUBLIC_URL + '/variety_logo.png'}
        alt="Variety the children's charity logo"
        className="footer-logo"
        style={{ display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))', maxHeight: 32 }}
      />
    </a>
    <div style={{ color: 'red', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
      Creating Inclusive Communities!
    </div>
  </div>
);

const Footer = ({ onPrevPage, onNextPage, page, totalPages }) => {
  if (isMobile) {
    return (
      <>
        {/* Navigation bar in content flow */}
        <div
          className="footer-mobile-nav"
          style={{
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 60px auto', // leave space for fixed logo bar
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'red', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '2px 8px' }}>
            {page > 0 && (
              <button onClick={onPrevPage} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, gap: 4 }}>
                <CaretLeft size={20} weight="regular" />
                <span style={{ fontSize: 15, fontWeight: 500 }}>Previous game</span>
              </button>
            )}
            <button onClick={onNextPage} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>Next game</span>
              <CaretRight size={20} weight="regular" />
            </button>
          </div>
        </div>
        {/* Fixed logo bar at bottom */}
        <MobileLogoBar />
      </>
    );
  }
  // Desktop: original fixed footer
  return (
    <footer
      style={{
        width: '100vw',
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          padding: '0 32px 8px 32px',
          boxSizing: 'border-box',
          position: 'relative',
          minHeight: 56,
        }}
      >
        {/* Left: Variety logo only */}
        <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
          <a
            href="https://varietyalberta.ca/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', cursor: 'pointer', marginRight: 8 }}
          >
            <img
              src={process.env.PUBLIC_URL + '/variety_logo.png'}
              alt="Variety the children's charity logo"
              className="footer-logo"
              style={{ display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))', maxHeight: 32 }}
            />
          </a>
        </div>
        {/* Center: Pagination */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'red', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '4px 16px' }}>
          {page > 0 && (
            <button onClick={onPrevPage} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, gap: 4 }}>
              <CaretLeft size={20} weight="regular" />
              <span style={{ fontSize: 15, fontWeight: 500 }}>Previous game</span>
            </button>
          )}
          <button onClick={onNextPage} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Next game</span>
            <CaretRight size={20} weight="regular" />
          </button>
        </div>
        {/* Right: Tagline */}
        <div style={{ color: 'red', fontWeight: 'bold', fontSize: '1.05rem', pointerEvents: 'auto' }}>
          Creating Inclusive Communities!
        </div>
      </div>
    </footer>
  );
};

export default Footer; 