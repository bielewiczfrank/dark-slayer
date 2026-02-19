import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Phaser from 'phaser';
import BootScene from '../game/scenes/BootScene';
import GameScene from '../game/scenes/GameScene';
import EventBus from '../game/EventBus';
import { LEVELS } from '../game/data/gameData';
import { Heart, Droplets, Wind, Coins, Skull, ArrowLeft, ArrowRight, ArrowUp, Swords, Zap, Shield } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function HUDBar({ current, max, type, label }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div className="bar-container" data-testid={`hud-bar-${type}`}>
      <div className={`bar-fill bar-${type}`} style={{ width: `${pct}%` }} />
      <span className="bar-label">{label}: {current}/{max}</span>
    </div>
  );
}

function BossBar({ name, current, max }) {
  const pct = max > 0 ? Math.max(0, (current / max) * 100) : 0;
  return (
    <div className="text-center" data-testid="boss-bar">
      <p className="font-cinzel text-sm text-red-400 mb-1">{name}</p>
      <div className="bar-boss mx-auto">
        <div className="bar-fill bar-health" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function GameScreen() {
  const navigate = useNavigate();
  const { characterId, levelId } = useParams();
  const gameRef = useRef(null);
  const phaserGame = useRef(null);
  const [character, setCharacter] = useState(null);
  const [hud, setHud] = useState({ health: 100, maxHealth: 100, mana: 50, maxMana: 50, stamina: 80, maxStamina: 80, gold: 0, xp: 0, kills: 0 });
  const [bossInfo, setBossInfo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [levelStats, setLevelStats] = useState(null);
  const [isMobile] = useState(() => 'ontouchstart' in window);

  // Load character
  useEffect(() => {
    axios.get(`${API}/characters/${characterId}`)
      .then(res => setCharacter(res.data))
      .catch(() => navigate('/'));
  }, [characterId, navigate]);

  // Start Phaser game
  useEffect(() => {
    if (!character || !gameRef.current) return;

    const level = LEVELS.find(l => l.id === parseInt(levelId));
    if (!level) { navigate('/'); return; }

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 960,
      height: 540,
      backgroundColor: '#050505',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [BootScene, GameScene],
      callbacks: {
        preBoot: (game) => {
          game.registry.set('characterData', character);
          game.registry.set('levelData', level);
        }
      }
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
      EventBus.clear();
    };
  }, [character, levelId, navigate]);

  // Event listeners
  useEffect(() => {
    const onHudUpdate = (data) => setHud(data);
    const onBossStart = (data) => setBossInfo(data);
    const onBossHp = (data) => setBossInfo(prev => prev ? { ...prev, ...data } : data);
    const onBossDefeated = () => setBossInfo(null);
    const onPlayerDied = (data) => { setIsDead(true); setLevelStats(data); };
    const onLevelComplete = (data) => { setIsComplete(true); setLevelStats(data); };
    const onTogglePause = () => {
      setIsPaused(prev => {
        const next = !prev;
        EventBus.emit(next ? 'pause-game' : 'resume-game');
        return next;
      });
    };

    EventBus.on('hud-update', onHudUpdate);
    EventBus.on('boss-start', onBossStart);
    EventBus.on('boss-hp', onBossHp);
    EventBus.on('boss-defeated', onBossDefeated);
    EventBus.on('player-died', onPlayerDied);
    EventBus.on('level-complete', onLevelComplete);
    EventBus.on('toggle-pause', onTogglePause);

    // Keyboard pause
    const onKeyDown = (e) => { if (e.key === 'Escape') onTogglePause(); };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      EventBus.off('hud-update', onHudUpdate);
      EventBus.off('boss-start', onBossStart);
      EventBus.off('boss-hp', onBossHp);
      EventBus.off('boss-defeated', onBossDefeated);
      EventBus.off('player-died', onPlayerDied);
      EventBus.off('level-complete', onLevelComplete);
      EventBus.off('toggle-pause', onTogglePause);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleDeath = async () => {
    try {
      await axios.post(`${API}/game/player-death`, { character_id: characterId });
    } catch (e) { console.error(e); }
    navigate(`/level-select/${characterId}`);
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API}/game/complete-level`, {
        character_id: characterId,
        level_id: parseInt(levelId),
        xp_gained: levelStats?.xp || 0,
        gold_gained: levelStats?.gold || 0,
        kills: levelStats?.kills || 0
      });
    } catch (e) { console.error(e); }
    navigate(`/level-select/${characterId}`);
  };

  const emitMobile = useCallback((action) => {
    EventBus.emit('mobile-action', action);
  }, []);

  if (!character) {
    return <div className="w-screen h-screen bg-dark-primary flex items-center justify-center">
      <p className="font-rajdhani text-slate-500 animate-pulse">Ladowanie...</p>
    </div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black" data-testid="game-screen">
      {/* Phaser canvas */}
      <div ref={gameRef} className="absolute inset-0" data-testid="phaser-container" />

      {/* HUD overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top left - resource bars */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-auto" data-testid="hud-bars">
          <HUDBar current={hud.health} max={hud.maxHealth} type="health" label="HP" />
          <HUDBar current={hud.mana} max={hud.maxMana} type="mana" label="MP" />
          <HUDBar current={hud.stamina} max={hud.maxStamina} type="stamina" label="SP" />
        </div>

        {/* Top right - gold, kills */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-auto" data-testid="hud-stats">
          <div className="flex items-center gap-2 font-rajdhani font-bold text-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-gold" data-testid="hud-gold">{hud.gold}</span>
          </div>
          <div className="flex items-center gap-2 font-rajdhani text-sm text-slate-400">
            <Skull className="w-3.5 h-3.5" />
            <span data-testid="hud-kills">{hud.kills}</span>
          </div>
          <div className="xp-bar-container mt-1" data-testid="hud-xp-bar">
            <div className="xp-bar-fill" style={{ width: `${Math.min(100, (hud.xp / 100) * 100)}%` }} />
          </div>
          <span className="font-rajdhani text-xs text-slate-500">XP: {hud.xp}</span>
        </div>

        {/* Boss health bar */}
        {bossInfo && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
            <BossBar name={bossInfo.name} current={bossInfo.current ?? bossInfo.hp} max={bossInfo.maxHp ?? bossInfo.max} />
          </div>
        )}
      </div>

      {/* Mobile controls */}
      {isMobile && (
        <div className="mobile-controls" data-testid="mobile-controls">
          <div className="flex gap-2">
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('left-start')}
              onTouchEnd={() => emitMobile('left-end')}
              data-testid="mobile-left"
            ><ArrowLeft className="w-6 h-6" /></button>
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('jump')}
              data-testid="mobile-jump"
            ><ArrowUp className="w-6 h-6" /></button>
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('right-start')}
              onTouchEnd={() => emitMobile('right-end')}
              data-testid="mobile-right"
            ><ArrowRight className="w-6 h-6" /></button>
          </div>
          <div className="flex gap-2">
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('dash')}
              data-testid="mobile-dash"
            ><Shield className="w-5 h-5" /></button>
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('special')}
              data-testid="mobile-special"
            ><Zap className="w-5 h-5" /></button>
            <button className="mobile-btn"
              onTouchStart={() => emitMobile('attack')}
              data-testid="mobile-attack"
            ><Swords className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && !isDead && !isComplete && (
        <div className="game-overlay" data-testid="pause-overlay">
          <div className="game-overlay-content">
            <h2 className="font-cinzel text-3xl text-gold mb-6">PAUZA</h2>
            <div className="flex flex-col gap-3">
              <button className="menu-btn w-full" onClick={() => { setIsPaused(false); EventBus.emit('resume-game'); }} data-testid="resume-btn">
                WZNOW
              </button>
              <button className="menu-btn-secondary w-full" onClick={() => navigate(`/level-select/${characterId}`)} data-testid="quit-btn">
                WYJDZ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Death overlay */}
      {isDead && (
        <div className="game-overlay" data-testid="death-overlay">
          <div className="game-overlay-content">
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-cinzel text-3xl text-red-500 mb-2">SMIERC</h2>
            <p className="font-lato text-sm text-slate-400 mb-6">Twoj bohater polegl w walce...</p>
            {levelStats && (
              <div className="flex justify-center gap-6 mb-6 font-rajdhani text-sm">
                <span className="text-gold">Zloto: {levelStats.gold}</span>
                <span className="text-purple-400">XP: {levelStats.xp}</span>
                <span className="text-slate-400">Zabicia: {levelStats.kills}</span>
              </div>
            )}
            <button className="menu-btn w-full" onClick={handleDeath} data-testid="return-after-death-btn">
              POWROT
            </button>
          </div>
        </div>
      )}

      {/* Victory overlay */}
      {isComplete && (
        <div className="game-overlay" data-testid="victory-overlay">
          <div className="game-overlay-content" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="text-gold text-6xl mb-4 font-cinzel animate-float">&#9733;</div>
            <h2 className="font-cinzel text-3xl text-gold mb-2">ZWYCIESTWO!</h2>
            <p className="font-lato text-sm text-slate-400 mb-6">Poziom ukonczony!</p>
            {levelStats && (
              <div className="flex justify-center gap-6 mb-6 font-rajdhani text-sm">
                <span className="text-gold">Zloto: +{levelStats.gold}</span>
                <span className="text-purple-400">XP: +{levelStats.xp}</span>
                <span className="text-slate-400">Zabicia: {levelStats.kills}</span>
              </div>
            )}
            <button className="menu-btn w-full" onClick={handleComplete} data-testid="continue-after-victory-btn">
              KONTYNUUJ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
