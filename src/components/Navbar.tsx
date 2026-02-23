import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="nav-wrapper animate-fade-in-up">
      <nav
        className={`container nav-container ${scrolled ? 'glass-panel scrolled' : ''}`}
      >
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          PokeDex<span className="text-gradient-primary">.</span>
        </div>

        {!isHome && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← Explore All
          </button>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
