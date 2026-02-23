# 🔴 PokeDex

A modern, interactive Pokédex web application built with React + TypeScript. Browse, search, and explore Pokémon with a sleek dark UI inspired by the [official Pokémon website](https://www.pokemon.com/us/pokedex).

🌐 **[Live Demo](https://jemz-dev.github.io/pokedex/)**

![PokeDex Screenshot](https://raw.githubusercontent.com/JemZ-dev/pokedex/main/preview.png)

---

## ✨ Features

- **Browse & Search** — Explore all Pokémon with real-time search and infinite scroll
- **Type & Region Filtering** — Filter by type (Fire, Water, etc.) and generation/region
- **Detailed Pokémon Pages** — Stats, abilities, type weaknesses, evolution chains & mega evolutions
- **Animated Sprites** — Hover (desktop) or tap (mobile) to see animated Pokémon sprites
- **Pokémon Cries** — Click the speaker button to hear each Pokémon's cry
- **Ability Info** — Click the `?` icon to see ability descriptions inline
- **Fully Responsive** — Optimized for desktop, tablet, and mobile screens
- **Dark Mode UI** — Premium glassmorphism design with type-colored accents

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **React Router** | Client-Side Routing |
| **PokeAPI** | Pokémon Data |
| **Lucide React** | Icons |
| **GitHub Pages** | Hosting |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/JemZ-dev/pokedex.git
cd pokedex

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173/`

### Build & Deploy

```bash
# Production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── Hero.tsx            # Landing hero section
│   ├── PokemonGrid.tsx     # Pokémon browsing grid with search & filters
│   ├── PokemonDetails.tsx  # Detailed Pokémon page
│   └── Footer.tsx          # Footer
├── App.tsx                 # Routes & layout
├── index.css               # Global styles & design system
└── main.tsx                # Entry point
```

## 🎮 Usage

- **Search** — Type a Pokémon name in the search bar
- **Filter by Type** — Click type badges to filter (e.g., Fire, Water)
- **Filter by Region** — Use the region dropdown (Kanto, Johto, etc.)
- **View Details** — Click any Pokémon card for full stats
- **Animated Sprite** — Hover over the artwork (tap on mobile)
- **Play Cry** — Click the 🔊 button next to the name
- **Ability Info** — Click `?` next to any ability

## 📝 Credits

**Created by [JemZ-dev](https://github.com/JemZ-dev)**

- Pokémon data provided by [PokéAPI](https://pokeapi.co/)
- Design inspired by the [Official Pokémon Website](https://www.pokemon.com/us/pokedex)
- Pokémon and Pokémon character names are trademarks of Nintendo

---

Made with ❤️ and Poké Balls
