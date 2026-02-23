import React from 'react';
import { Link } from 'react-router-dom';

// Common Pokemon type colors for borders/glows
const typeColors: { [key: string]: string } = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

interface PokemonCardProps {
    name: string;
    url: string;
    index: number;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ name, url, index }) => {
    const [details, setDetails] = React.useState<any>(null);

    React.useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => setDetails(data));
    }, [url]);

    if (!details) {
        return (
            <div className="bento-card glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-float">Loading...</div>
            </div>
        );
    }

    const mainType = details.types[0].type.name;
    const color = typeColors[mainType] || '#ffffff';

    return (
        <Link to={`/pokemon/${details.name}`} style={{ display: 'block' }}>
            <div
                className="bento-card glass-panel animate-fade-in-up pokemon-card"
                style={{
                    animationDelay: `${(index % 20) * 50}ms`,
                    '--card-color': color
                } as React.CSSProperties}
            >
                <div className="pokemon-id">#{details.id.toString().padStart(3, '0')}</div>

                <div className="pokemon-image-wrapper">
                    <img
                        src={details.sprites.other['official-artwork'].front_default || details.sprites.front_default}
                        alt={name}
                        className="pokemon-image animate-float"
                    />
                    <div className="pokemon-glow" style={{ background: color }}></div>
                </div>

                <h3 className="feature-title" style={{ textTransform: 'capitalize', textAlign: 'center' }}>
                    {name}
                </h3>

                <div className="pokemon-types">
                    {details.types.map((t: any) => (
                        <span
                            key={t.type.name}
                            className="pokemon-type"
                            style={{ backgroundColor: typeColors[t.type.name] + '40', color: typeColors[t.type.name] }}
                        >
                            {t.type.name}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default PokemonCard;
