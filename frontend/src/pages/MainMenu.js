import { useNavigate } from 'react-router-dom';
import { Swords, Shield, Flame } from 'lucide-react';

const BG_IMAGE = 'https://images.unsplash.com/photo-1734967640286-f8835c3209fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxkYXJrJTIwZmFudGFzeSUyMGR1bmdlb24lMjBjYXN0bGUlMjBiYWNrZ3JvdW5kJTIwYXRtb3NwaGVyaWN8ZW58MHx8fHwxNzcxNTI3ODUxfDA&ixlib=rb-4.1.0&q=85';

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden" data-testid="main-menu">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})`, filter: 'brightness(0.4) saturate(0.8)' }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(5,5,5,0.85) 100%)'
      }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Title */}
        <div className="mb-2 flex items-center gap-4 animate-fade-in">
          <Flame className="w-8 h-8 text-red-600 opacity-60" />
          <h1
            className="font-cinzel text-5xl sm:text-6xl lg:text-7xl font-black tracking-wider text-gold"
            style={{ textShadow: '0 0 40px rgba(255,215,0,0.4), 0 4px 12px rgba(0,0,0,0.8)' }}
            data-testid="game-title"
          >
            DARK REALMS
          </h1>
          <Flame className="w-8 h-8 text-red-600 opacity-60" />
        </div>

        <p
          className="font-cinzel-decorative text-base sm:text-lg text-slate-400 mb-16 tracking-[0.3em] uppercase animate-fade-in"
          style={{ animationDelay: '0.15s' }}
          data-testid="game-subtitle"
        >
          Kroniki Mroku
        </p>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 w-72 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            className="menu-btn flex items-center justify-center gap-3 w-full"
            onClick={() => navigate('/character-select', { state: { mode: 'new' } })}
            data-testid="new-game-btn"
          >
            <Swords className="w-5 h-5" />
            NOWA GRA
          </button>

          <button
            className="menu-btn-secondary flex items-center justify-center gap-3 w-full"
            onClick={() => navigate('/character-select', { state: { mode: 'continue' } })}
            data-testid="continue-btn"
          >
            <Shield className="w-5 h-5" />
            KONTYNUUJ
          </button>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="font-rajdhani text-xs text-slate-600 tracking-wider uppercase">
            WASD / Strzalki - Ruch &nbsp;&middot;&nbsp; Z/J - Atak &nbsp;&middot;&nbsp; X/K - Specjalny &nbsp;&middot;&nbsp; C/L - Unik
          </p>
        </div>
      </div>
    </div>
  );
}
