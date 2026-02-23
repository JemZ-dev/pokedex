import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="footer container">
            <div className="footer-inner">
                <div className="nav-logo" style={{ fontSize: '1.2rem' }}>
                    PokeDex<span className="text-gradient-primary">.</span>
                </div>


                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} Pokemon Universe.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
