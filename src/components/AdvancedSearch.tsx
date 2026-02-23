import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

interface AdvancedSearchProps {
    selectedTypes: string[];
    setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ selectedTypes, setSelectedTypes }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleType = (type: string) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    return (
        <div className="advanced-search container animate-fade-in-up delay-300">
            <button
                className="btn glass-panel filter-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', maxWidth: '500px', margin: '1rem auto', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
            >
                <SlidersHorizontal size={18} />
                Advanced Search (Types)
            </button>

            {isOpen && (
                <div className="glass-panel filter-panel" style={{ padding: '2rem', marginTop: '1rem', maxWidth: '800px', margin: '1rem auto' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Filter by Type</h3>
                    <div className="type-filter-grid">
                        {POKEMON_TYPES.map(type => {
                            const isActive = selectedTypes.includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`type-filter-btn ${isActive ? 'active' : ''}`}
                                    style={{
                                        backgroundColor: isActive ? 'var(--text-main)' : 'rgba(255, 255, 255, 0.05)',
                                        color: isActive ? '#000' : 'var(--text-muted)',
                                    }}
                                >
                                    <span className={`pokemon-type-icon ${type}`}></span>
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
