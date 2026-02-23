import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import { Loader2 } from 'lucide-react';

interface PokemonListProps {
    searchTerm: string;
    selectedTypes: string[];
    selectedRegion: { name: string; offset: number; limit: number; isMega?: boolean } | null;
}

const PokemonGrid: React.FC<PokemonListProps> = ({ searchTerm, selectedTypes, selectedRegion }) => {
    const [pokemon, setPokemon] = useState<{ name: string, url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [limit] = useState(20);
    const [hasMore, setHasMore] = useState(true);

    const fetchPokemon = async (reset = false) => {
        setLoading(true);
        try {
            let results: { name: string, url: string }[] = [];
            const currentOffset = reset ? (selectedRegion ? selectedRegion.offset : 0) : offset;

            if (selectedTypes.length > 0) {
                // Fetch pokemon for each selected type
                const typePromises = selectedTypes.map(type =>
                    fetch(`https://pokeapi.co/api/v2/type/${type}`).then(res => res.json())
                );

                const typeDataArray = await Promise.all(typePromises);
                let intersectedPokemon = typeDataArray[0].pokemon.map((p: any) => p.pokemon);

                for (let i = 1; i < typeDataArray.length; i++) {
                    const currentTypePokemon = typeDataArray[i].pokemon.map((p: any) => p.pokemon.name);
                    intersectedPokemon = intersectedPokemon.filter((p: any) => currentTypePokemon.includes(p.name));
                }

                // If a region is selected, filter the typed results
                if (selectedRegion) {
                    if (selectedRegion.isMega) {
                        intersectedPokemon = intersectedPokemon.filter((p: any) => p.name.includes('-mega'));
                    } else {
                        const minId = selectedRegion.offset + 1;
                        const maxId = selectedRegion.offset + selectedRegion.limit;
                        intersectedPokemon = intersectedPokemon.filter((p: any) => {
                            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
                            return id >= minId && id <= maxId;
                        });
                    }
                }

                results = intersectedPokemon;
                setHasMore(false); // Disable Load More since we fetched all matching types
            } else if (searchTerm) {
                // If only searching by name, fetch a large chunk to filter client-side
                let maxFetch = 1000;
                let fetchOffset = 0;

                if (selectedRegion) {
                    maxFetch = selectedRegion.limit;
                    fetchOffset = selectedRegion.offset;
                }

                const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${maxFetch}&offset=${fetchOffset}`);
                let data = await res.json();

                // For mega search, we need to filter by names containing '-mega' or similar logic, 
                // but the megas are fetched in the limit block correctly.
                results = data.results;

                if (selectedRegion && selectedRegion.isMega) {
                    // Pre-filter so we only search within the Megas
                    results = results.filter((p: any) => p.name.includes('-mega'));
                }

                setHasMore(false);
            } else {
                // Normal pagination
                let effectiveLimit = limit;
                let fetchOffset = currentOffset;

                // For normal regions, cap the limit.
                if (selectedRegion && !selectedRegion.isMega) {
                    const remainingInRegion = selectedRegion.limit - (currentOffset - selectedRegion.offset);
                    effectiveLimit = Math.min(limit, remainingInRegion);
                } else if (selectedRegion && selectedRegion.isMega) {
                    // Fetch a larger chunk for Megas so we can filter by name reliably without paginating endlessly over sparse ID space
                    effectiveLimit = selectedRegion.limit;
                }

                if (effectiveLimit > 0) {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${effectiveLimit}&offset=${fetchOffset}`);
                    let data = await res.json();

                    let newResults = data.results;

                    if (selectedRegion && selectedRegion.isMega) {
                        newResults = newResults.filter((p: any) => p.name.includes('-mega'));
                        setHasMore(false); // Disable pagination since we fetch all megas at once
                        setOffset(currentOffset + effectiveLimit);
                    } else {
                        if (selectedRegion && currentOffset + effectiveLimit >= selectedRegion.offset + selectedRegion.limit) {
                            setHasMore(false);
                        } else {
                            setHasMore(data.next !== null);
                        }
                        setOffset(currentOffset + effectiveLimit);
                    }

                    results = reset ? newResults : [...pokemon, ...newResults];

                } else {
                    results = reset ? [] : pokemon;
                    setHasMore(false);
                }
            }

            setPokemon(results);
        } catch (err) {
            console.error("Failed to fetch Pokemon", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset offset state when filters or region changes
        if (selectedRegion) {
            setOffset(selectedRegion.offset);
        } else {
            setOffset(0);
        }
        fetchPokemon(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedTypes, selectedRegion]); // Re-fetch/reset when filters change

    const filteredPokemon = pokemon.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <section id="pokedex" className="features container" style={{ paddingTop: '5rem' }}>
            <div className="features-header">
                <h2 className="features-title animate-fade-in-up">
                    Pokedex Database<br />
                </h2>
            </div>

            {loading && pokemon.length === 0 ? (
                <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin text-gradient-primary" size={64} />
                </div>
            ) : filteredPokemon.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No Pokémon found matching "{searchTerm}"
                </div>
            ) : (
                <>
                    <div className="pokemon-grid">
                        {filteredPokemon.map((p, index) => (
                            <PokemonCard key={p.name} name={p.name} url={p.url} index={index} />
                        ))}
                    </div>

                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => fetchPokemon()}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load more Pokémon'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default PokemonGrid;
