import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PokemonGrid from './components/PokemonGrid';
import Footer from './components/Footer';

import AdvancedSearch from './components/AdvancedSearch';
import PokemonDetails from './components/PokemonDetails';

export const REGIONS: { name: string, offset: number, limit: number, isMega?: boolean }[] = [
  { name: 'Kanto', offset: 0, limit: 151 },
  { name: 'Johto', offset: 151, limit: 100 },
  { name: 'Hoenn', offset: 251, limit: 135 },
  { name: 'Sinnoh', offset: 386, limit: 107 },
  { name: 'Unova', offset: 493, limit: 156 },
  { name: 'Kalos', offset: 649, limit: 72 },
  { name: 'Alola', offset: 721, limit: 88 },
  { name: 'Galar', offset: 809, limit: 89 },
  { name: 'Mega Evolutions', offset: 930, limit: 300, isMega: true } // Mega evolutions in the PokeAPI appear after the main national dex offsets
];

const Home = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = React.useState<{ name: string, offset: number, limit: number, isMega?: boolean } | null>(null);

  return (
    <main style={{ flex: 1, zIndex: 1, position: 'relative' }}>
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <AdvancedSearch selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} />

      {/* Region Selector */}
      <div className="container" id="regions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          className={`btn ${!selectedRegion ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedRegion(null)}
          style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
        >
          All Regions
        </button>
        {REGIONS.map(r => (
          <button
            key={r.name}
            className={`btn ${selectedRegion?.name === r.name ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedRegion(r)}
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
          >
            {r.name}
          </button>
        ))}
      </div>

      <PokemonGrid searchTerm={searchTerm} selectedTypes={selectedTypes} selectedRegion={selectedRegion} />
    </main>
  );
};

function App() {
  return (
    <HashRouter>
      <div className="ambient-bg"></div>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
