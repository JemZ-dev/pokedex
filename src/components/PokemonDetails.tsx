import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Zap, HelpCircle, X, ChevronRight, Volume2 } from 'lucide-react';

// Format mega form names: "charizard-mega-x" -> "Mega Charizard X"
const formatMegaName = (name: string): string => {
    const parts = name.split('-');
    const baseName = parts[0];
    const megaIndex = parts.indexOf('mega');
    const suffix = parts.slice(megaIndex + 1).join(' ').toUpperCase();
    const formatted = `Mega ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
    return suffix ? `${formatted} ${suffix}` : formatted;
};

const typeColors: { [key: string]: string } = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};

const statLabels: { [key: string]: string } = {
    'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', 'speed': 'SPD',
};

// Detect touch device
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ---- Main Component ----
const PokemonDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState<any>(null);
    const [species, setSpecies] = useState<any>(null);
    const [evolutions, setEvolutions] = useState<any[]>([]);
    const [megaForms, setMegaForms] = useState<any[]>([]);
    const [weaknesses, setWeaknesses] = useState<string[]>([]);
    const [abilities, setAbilities] = useState<{ name: string; description: string; isHidden: boolean }[]>([]);
    const [selectedAbility, setSelectedAbility] = useState<{ name: string; description: string; isHidden: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAnimated, setShowAnimated] = useState(false);

    useEffect(() => {
        setLoading(true);
        setWeaknesses([]);
        setAbilities([]);
        setMegaForms([]);
        setSelectedAbility(null);
        setShowAnimated(false);
        window.scrollTo(0, 0);

        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(res => res.json())
            .then(async (data) => {
                setPokemon(data);

                // ---- Fetch Weaknesses ----
                const typeUrls = data.types.map((t: any) => t.type.url);
                const typeDataArr = await Promise.all(typeUrls.map((url: string) => fetch(url).then(r => r.json())));

                const damageMap: { [key: string]: number } = {};
                typeDataArr.forEach((td: any) => {
                    td.damage_relations.double_damage_from.forEach((t: any) => {
                        damageMap[t.name] = (damageMap[t.name] || 1) * 2;
                    });
                    td.damage_relations.half_damage_from.forEach((t: any) => {
                        damageMap[t.name] = (damageMap[t.name] || 1) * 0.5;
                    });
                    td.damage_relations.no_damage_from.forEach((t: any) => {
                        damageMap[t.name] = 0;
                    });
                });
                const weakList = Object.entries(damageMap).filter(([, v]) => v > 1).map(([k]) => k);
                setWeaknesses(weakList);

                // ---- Fetch Ability Descriptions ----
                const abilityData = await Promise.all(
                    data.abilities.map(async (a: any) => {
                        const abilityRes = await fetch(a.ability.url);
                        const abilityJson = await abilityRes.json();
                        const entry = abilityJson.effect_entries.find((e: any) => e.language.name === 'en');
                        const flavorEntry = abilityJson.flavor_text_entries.find((e: any) => e.language.name === 'en');
                        return {
                            name: a.ability.name,
                            description: entry?.short_effect || flavorEntry?.flavor_text || 'No description available.',
                            isHidden: a.is_hidden,
                        };
                    })
                );
                setAbilities(abilityData);

                return fetch(data.species.url);
            })
            .then(res => res.json())
            .then(speciesData => {
                setSpecies(speciesData);

                const megaVarieties = speciesData.varieties.filter(
                    (v: any) => !v.is_default && v.pokemon.name.includes('mega')
                );
                if (megaVarieties.length > 0) {
                    Promise.all(
                        megaVarieties.map(async (v: any) => {
                            const res = await fetch(v.pokemon.url);
                            const data = await res.json();
                            return {
                                name: v.pokemon.name,
                                display_name: formatMegaName(v.pokemon.name),
                                id: data.id,
                                image: data.sprites.other['official-artwork'].front_default,
                                types: data.types,
                            };
                        })
                    ).then(setMegaForms);
                } else {
                    setMegaForms([]);
                }

                return fetch(speciesData.evolution_chain.url);
            })
            .then(res => res.json())
            .then(async (evolutionData) => {
                const evoChain: any[] = [];
                let evoData = evolutionData.chain;
                do {
                    const evoDetails = evoData.evolves_to[0]?.evolution_details[0];
                    evoChain.push({
                        species_name: evoData.species.name,
                        min_level: evoDetails ? evoDetails.min_level : null,
                        trigger: evoDetails ? evoDetails.trigger.name : null,
                    });
                    evoData = evoData.evolves_to[0];
                } while (!!evoData && evoData.hasOwnProperty('evolves_to'));

                const fullEvoData = await Promise.all(
                    evoChain.map(async (evo) => {
                        const evoRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.species_name}`);
                        const evoMon = await evoRes.json();
                        return {
                            ...evo, id: evoMon.id,
                            image: evoMon.sprites.other['official-artwork'].front_default,
                            types: evoMon.types,
                        };
                    })
                );
                setEvolutions(fullEvoData);
                setLoading(false);
            })
            .catch(err => { console.error("Failed to fetch detail", err); setLoading(false); });
    }, [id]);

    // Toggle animated sprite (touch = tap toggle, mouse = hover)
    const handleImageInteraction = useCallback(() => {
        if (isTouchDevice()) {
            setShowAnimated(prev => !prev);
        }
    }, []);

    if (loading || !pokemon || !species) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin text-gradient-primary" size={64} />
            </div>
        );
    }

    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType] || '#ffffff';
    const heightM = pokemon.height / 10;
    const feet = Math.floor(heightM * 3.28084);
    const inches = Math.round((heightM * 3.28084 - feet) * 12);
    const weightKg = pokemon.weight / 10;
    const weightLbs = (weightKg * 2.20462).toFixed(1);
    const description = species.flavor_text_entries.find((f: any) => f.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || 'No description available.';
    const totalStats = pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);
    const category = species.genera.find((g: any) => g.language.name === 'en')?.genus.replace(' Pokémon', '') || '';
    const animatedSrc = pokemon.sprites.other?.showdown?.front_default || pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || '';

    return (
        <div style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>

            {/* ======= HERO SECTION ======= */}
            <section style={{ position: 'relative', overflow: 'hidden', padding: '3rem 0 4rem' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '35%', transform: 'translate(-50%, -50%)',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
                    pointerEvents: 'none', zIndex: 0,
                }} />

                <div className="container detail-hero-flex" style={{
                    display: 'flex', alignItems: 'center', gap: '4rem',
                    position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center',
                }}>
                    {/* Pokémon Image - hover on desktop, tap on mobile */}
                    <div
                        className="detail-image-col"
                        style={{
                            flex: '0 0 auto', width: 'clamp(260px, 28vw, 380px)', aspectRatio: '1',
                            position: 'relative', cursor: 'pointer',
                            paddingBottom: '28px',
                        }}
                        onClick={handleImageInteraction}
                        onMouseEnter={() => {
                            if (!isTouchDevice()) setShowAnimated(true);
                        }}
                        onMouseLeave={() => {
                            if (!isTouchDevice()) setShowAnimated(false);
                        }}
                    >
                        {/* Static official artwork */}
                        <img
                            className="animate-float"
                            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                            alt={pokemon.name}
                            style={{
                                width: '100%', height: 'calc(100% - 28px)', objectFit: 'contain',
                                filter: `drop-shadow(0 25px 40px ${color}40)`,
                                transition: 'opacity 0.3s ease',
                                position: 'absolute', top: 0, left: 0,
                                opacity: showAnimated && animatedSrc ? 0 : 1,
                            }}
                        />
                        {/* Animated Showdown sprite */}
                        {animatedSrc && (
                            <img
                                src={animatedSrc}
                                alt={`${pokemon.name} animated`}
                                style={{
                                    width: '60%', height: '60%', objectFit: 'contain',
                                    imageRendering: 'pixelated',
                                    position: 'absolute', top: 'calc(50% - 14px)', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    opacity: showAnimated ? 1 : 0,
                                    visibility: showAnimated ? 'visible' : 'hidden',
                                    transition: 'opacity 0.3s ease',
                                    filter: `drop-shadow(0 10px 30px ${color}60)`,
                                    border: 'none', outline: 'none',
                                }}
                            />
                        )}
                        {/* Hint text */}
                        <div className="hover-hint-text" style={{
                            position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)',
                            fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.5,
                            pointerEvents: 'none', whiteSpace: 'nowrap',
                        }}>
                            {isTouchDevice() ? 'Tap to animate' : 'Hover to animate'}
                        </div>
                    </div>

                    {/* Name + Description + Info Card */}
                    <div className="detail-info-col" style={{ flex: '1 1 400px', maxWidth: '560px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                            #{pokemon.id.toString().padStart(4, '0')}
                        </span>
                        <div className="detail-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 4.5vw, 4rem)', textTransform: 'capitalize', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>
                                {pokemon.name}
                            </h1>
                            {pokemon.cries?.latest && (
                                <button
                                    onClick={(e) => {
                                        const btn = e.currentTarget;
                                        btn.classList.add('playing');
                                        const audio = new Audio(pokemon.cries.latest);
                                        audio.volume = 0.4;
                                        audio.play();
                                        audio.onended = () => btn.classList.remove('playing');
                                    }}
                                    style={{
                                        background: `${color}20`, border: `1px solid ${color}40`,
                                        borderRadius: '50%', width: '40px', height: '40px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color, transition: 'all 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}40`; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.transform = 'scale(1)'; }}
                                    title={`Play ${pokemon.name}'s cry`}
                                >
                                    <Volume2 size={20} />
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '480px' }}>
                            {description}
                        </p>

                        {/* Info Card - swaps to ability info when clicked */}
                        <div style={{
                            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                            border: `1px solid ${color}40`, borderRadius: '16px',
                            padding: '1.5rem', minHeight: '140px',
                        }}>
                            {selectedAbility ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Ability Info
                                        </span>
                                        <button
                                            onClick={() => setSelectedAbility(null)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                background: '#fff', color: '#000', border: 'none',
                                                borderRadius: '6px', padding: '0.3rem 0.7rem',
                                                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                                            }}
                                        >
                                            <X size={12} /> Close
                                        </button>
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', textTransform: 'capitalize' }}>
                                        {selectedAbility.name.replace('-', ' ')}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                                        {selectedAbility.description}
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr', gap: '1.2rem 2rem',
                                }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Height</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{feet}' {inches.toString().padStart(2, '0')}" <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({heightM}m)</span></p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Category</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{category}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Weight</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{weightLbs} lbs <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({weightKg}kg)</span></p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Abilities</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            {abilities.map((ab) => (
                                                <div key={ab.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                                        {ab.name.replace('-', ' ')}
                                                    </span>
                                                    {ab.isHidden && (
                                                        <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontWeight: 600 }}>H</span>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedAbility(ab)}
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                                                            padding: '2px', borderRadius: '50%', transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = `${color}40`; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                                                        title={`Click for details about ${ab.name}`}
                                                    >
                                                        <HelpCircle size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= TYPE + WEAKNESSES ======= */}
            <section className="container" style={{ marginBottom: '2.5rem' }}>
                <div className="detail-type-weak-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Type</h3>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {pokemon.types.map((t: any) => (
                                <span key={t.type.name} style={{
                                    backgroundColor: typeColors[t.type.name], color: '#fff',
                                    padding: '0.45rem 1.6rem', borderRadius: '9999px',
                                    fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize',
                                    letterSpacing: '0.04em', minWidth: '90px', textAlign: 'center',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                }}>
                                    {t.type.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Weaknesses</h3>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {weaknesses.map((w) => (
                                <span key={w} style={{
                                    backgroundColor: typeColors[w] || '#777', color: '#fff',
                                    padding: '0.45rem 1.6rem', borderRadius: '9999px',
                                    fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize',
                                    letterSpacing: '0.04em', minWidth: '90px', textAlign: 'center',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                }}>
                                    {w}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= STATS ======= */}
            <section className="container" style={{ marginBottom: '2.5rem' }}>
                <div className="glass-panel section-pad" style={{ padding: '2rem', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Base Stats</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color, padding: '0.25rem 0.7rem', borderRadius: '8px', background: `${color}15` }}>
                            Total: {totalStats}
                        </span>
                    </div>
                    <div className="detail-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        {pokemon.stats.map((s: any) => {
                            const statRatio = (s.base_stat / 255) * 100;
                            const label = statLabels[s.stat.name] || s.stat.name;
                            return (
                                <div key={s.stat.name}>
                                    <div className="detail-stat-bar-container" style={{
                                        height: '120px', display: 'flex', flexDirection: 'column',
                                        justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5rem',
                                    }}>
                                        <div style={{
                                            width: '100%', maxWidth: '50px',
                                            height: `${Math.max(statRatio, 8)}%`,
                                            background: `linear-gradient(180deg, ${color}, ${color}88)`,
                                            borderRadius: '6px 6px 2px 2px',
                                            transition: 'height 0.8s ease',
                                            boxShadow: `0 0 10px ${color}30`,
                                        }} />
                                    </div>
                                    <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{s.base_stat}</p>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ======= EVOLUTIONS ======= */}
            {(evolutions.length > 1 || megaForms.length > 0) && (
                <section className="container" style={{ marginBottom: '2.5rem' }}>
                    <div className="glass-panel section-pad" style={{ padding: '2rem', borderRadius: '20px' }}>
                        {evolutions.length > 1 && (
                            <>
                                <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Evolutions</h3>
                                <div className="detail-evo-chain" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    {evolutions.map((evo, index) => (
                                        <React.Fragment key={evo.species_name}>
                                            <div
                                                onClick={() => navigate(`/pokemon/${evo.species_name}`)}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    cursor: 'pointer', transition: 'all 0.3s',
                                                    opacity: pokemon.name === evo.species_name ? 1 : 0.65,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.opacity = pokemon.name === evo.species_name ? '1' : '0.65'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <div className="detail-evo-circle" style={{
                                                    width: '110px', height: '110px', borderRadius: '50%',
                                                    background: 'var(--color-bg-panel)',
                                                    border: `3px solid ${pokemon.name === evo.species_name ? color : 'rgba(255,255,255,0.1)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: '0.8rem',
                                                    boxShadow: pokemon.name === evo.species_name ? `0 0 20px ${color}40` : 'none',
                                                }}>
                                                    <img src={evo.image} alt={evo.species_name} style={{ width: '80%' }} />
                                                </div>
                                                <span className="detail-evo-name" style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.9rem' }}>
                                                    {evo.species_name}
                                                </span>
                                                <span className="detail-evo-id" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                                    #{evo.id.toString().padStart(4, '0')}
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    {evo.types?.map((t: any) => (
                                                        <span key={t.type.name} style={{
                                                            backgroundColor: typeColors[t.type.name], color: '#fff',
                                                            padding: '0.15rem 0.6rem', borderRadius: '9999px',
                                                            fontSize: '0.6rem', fontWeight: 700, textTransform: 'capitalize',
                                                            textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                                                        }}>
                                                            {t.type.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {index < evolutions.length - 1 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                                                    <ChevronRight size={28} strokeWidth={3} />
                                                    {evolutions[index + 1].min_level && (
                                                        <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>Lvl {evolutions[index + 1].min_level}</span>
                                                    )}
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Mega Evolutions */}
                        {megaForms.length > 0 && (
                            <>
                                {evolutions.length > 1 && (
                                    <div style={{ width: '100%', height: '1px', background: 'var(--border-glass)', margin: '2rem 0' }} />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Zap size={16} style={{ color }} />
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Mega Evolutions</h4>
                                    <Zap size={16} style={{ color }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                                    {megaForms.map((mega) => (
                                        <div
                                            key={mega.name}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                cursor: 'pointer', transition: 'transform 0.3s',
                                            }}
                                            onClick={() => navigate(`/pokemon/${mega.id}`)}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        >
                                            <div className="detail-mega-circle" style={{
                                                width: '100px', height: '100px', borderRadius: '50%',
                                                background: `linear-gradient(135deg, var(--color-bg-panel), ${color}15)`,
                                                border: `2px solid ${color}60`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '0.6rem', boxShadow: `0 0 15px ${color}20`,
                                            }}>
                                                <img src={mega.image} alt={mega.display_name} style={{ width: '82%' }} />
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                                                {mega.display_name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.6rem', fontWeight: 700, marginTop: '0.25rem',
                                                padding: '0.1rem 0.5rem', borderRadius: '8px',
                                                background: `${color}20`, color, letterSpacing: '0.06em',
                                            }}>MEGA</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default PokemonDetails;
