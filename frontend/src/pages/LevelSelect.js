import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { LEVELS } from '../game/data/gameData';
import { CHARACTER_CLASSES } from '../game/data/gameData';
import { ArrowLeft, Lock, Star, Sword, ShoppingBag, Trophy, Skull, Shield, Coins } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LEVEL_BG = 'https://images.unsplash.com/photo-1766258863162-2fa31f7a1ee3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHw0fHxkYXJrJTIwZmFudGFzeSUyMGR1bmdlb24lMjBjYXN0bGUlMjBiYWNrZ3JvdW5kJTIwYXRtb3NwaGVyaWN8ZW58MHx8fHwxNzcxNTI3ODUxfDA&ixlib=rb-4.1.0&q=85';

export default function LevelSelect() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    axios.get(`${API}/characters/${characterId}`)
      .then(res => setCharacter(res.data))
      .catch(() => navigate('/'));
  }, [characterId, navigate]);

  if (!character) {
    return <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <p className="font-rajdhani text-slate-500 animate-pulse">Ladowanie...</p>
    </div>;
  }

  const cls = CHARACTER_CLASSES[character.class_type];
  const completedLevels = character.completed_levels || [];

  const isUnlocked = (levelId) => {
    if (levelId === 1) return true;
    return completedLevels.includes(levelId - 1);
  };

  return (
    <div className="min-h-screen bg-dark-primary" data-testid="level-select-screen">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white font-rajdhani" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-cinzel text-xl text-white">{character.name}</h2>
            <p className="font-rajdhani text-sm" style={{ color: cls?.cssColor }}>{cls?.name} &middot; Poz. {character.level}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-rajdhani text-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-gold font-bold" data-testid="gold-display">{character.gold}</span>
          </div>
          <div className="flex items-center gap-2 font-rajdhani text-sm text-slate-400">
            <Skull className="w-4 h-4" />
            <span data-testid="kills-display">{character.kills}</span>
          </div>
          <button
            onClick={() => navigate(`/shop/${characterId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-slate-300 hover:text-white hover:border-purple-500/50 font-rajdhani text-sm"
            style={{ transition: 'border-color 0.2s ease, color 0.2s ease' }}
            data-testid="shop-btn"
          >
            <ShoppingBag className="w-4 h-4" /> SKLEP
          </button>
        </div>
      </div>

      {/* Stat points notification */}
      {character.stat_points > 0 && (
        <div className="mx-6 mt-4 p-3 bg-purple-900/30 border border-purple-500/30 rounded flex items-center justify-between" data-testid="stat-points-notice">
          <p className="font-rajdhani text-sm text-purple-300">
            Masz <span className="text-gold font-bold">{character.stat_points}</span> punktow statystyk do przydzielenia!
          </p>
          <div className="flex gap-2">
            {['str', 'dex', 'end', 'int', 'lck'].map(stat => (
              <button
                key={stat}
                onClick={async () => {
                  const res = await axios.post(`${API}/characters/${characterId}/levelup`, { stat });
                  setCharacter(res.data);
                }}
                className="px-3 py-1 bg-black/50 border border-slate-700 rounded text-xs font-rajdhani text-slate-300 hover:border-purple-500 hover:text-white uppercase"
                style={{ transition: 'border-color 0.2s ease' }}
                data-testid={`assign-stat-${stat}`}
              >
                {stat} ({character.stats[stat]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level cards */}
      <div className="p-6">
        <h1 className="font-cinzel text-2xl text-gold mb-6" data-testid="levels-title">Wybierz Poziom</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          {LEVELS.map((level) => {
            const unlocked = isUnlocked(level.id);
            const completed = completedLevels.includes(level.id);

            return (
              <div
                key={level.id}
                onClick={() => unlocked && navigate(`/game/${characterId}/${level.id}`)}
                className={`relative overflow-hidden rounded border ${
                  unlocked ? 'cursor-pointer border-slate-700 hover:border-purple-500/50' : 'cursor-not-allowed border-slate-800/50 opacity-50'
                }`}
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
                data-testid={`level-card-${level.id}`}
              >
                {/* Level image */}
                <div className="relative h-40 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${LEVEL_BG})`,
                      filter: unlocked ? 'brightness(0.5) saturate(0.7)' : 'brightness(0.2) saturate(0)',
                      transform: 'scale(1.1)'
                    }}
                  />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.9) 100%)'
                  }} />

                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-slate-600" />
                    </div>
                  )}

                  {completed && (
                    <div className="absolute top-3 right-3">
                      <Trophy className="w-6 h-6 text-gold" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-cinzel text-lg text-white">{level.name}</h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-lato text-xs text-slate-400 mb-3">{level.description}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < level.difficulty ? '#F59E0B' : 'none'}
                        stroke={i < level.difficulty ? '#F59E0B' : '#3F3F46'}
                      />
                    ))}
                    <span className="font-rajdhani text-xs text-slate-500 ml-2">
                      Trudnosc {level.difficulty}/3
                    </span>
                  </div>
                  <div className="flex gap-4 font-rajdhani text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Sword className="w-3 h-3" /> {level.enemies.length} wrogow</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Boss</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character stats panel */}
      <div className="p-6 pt-0">
        <div className="max-w-5xl border border-slate-800/50 rounded p-4 bg-black/40">
          <h3 className="font-cinzel text-sm text-slate-400 mb-3 uppercase tracking-wider">Statystyki Postaci</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-rajdhani text-sm">
            {Object.entries(character.stats).map(([stat, val]) => (
              <div key={stat} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-slate-800">
                <span className="text-slate-500 uppercase text-xs">{stat}</span>
                <span className="text-white font-bold">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-3 font-rajdhani text-xs text-slate-400">
            <span>HP: {character.max_health}</span>
            <span>MP: {character.max_mana}</span>
            <span>SP: {character.max_stamina}</span>
            <span>XP: {character.xp}/{character.xp_to_next}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
