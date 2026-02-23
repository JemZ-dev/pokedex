import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchTerm, setSearchTerm }) => {
    return (
        <section className="hero container">
            {/* Background Orbs */}
            <div className="hero-orb orb-1"></div>
            <div className="hero-orb orb-2"></div>

            <h1 className="hero-title animate-fade-in-up">
                Explore the <br />
                <span className="text-gradient-primary" style={{ display: 'inline-block', transform: 'scale(1.05)' }}>Pokémon Universe</span>
            </h1>

            <p className="hero-subtitle animate-fade-in-up delay-100">
                Access the ultimate database of Pokémon right from your device. Search by name and build your knowledge of the original 151.
            </p>

            <div className="hero-search animate-fade-in-up delay-200" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input glass-panel"
                />
            </div>
        </section>
    );
};

export default Hero;
