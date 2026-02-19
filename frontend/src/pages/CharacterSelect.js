import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CHARACTER_CLASSES, STAT_NAMES } from '../game/data/gameData';
import { Input } from '../components/ui/input';
import { ArrowLeft, Swords, Wand2, Eye, Skull, Sword, Target, Flame, Shield, Zap, Heart, Droplets, Wind, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICONS = { Shield, Wand2, Eye, Skull, Sword, Target, Flame };

export default function CharacterSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || 'new';
  const [selectedClass, setSelectedClass] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [existingChars, setExistingChars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'continue') {
      axios.get(`${API}/characters`).then(res => setExistingChars(res.data)).catch(() => {});
    }
  }, [mode]);

  const createCharacter = async () => {
    if (!selectedClass || !characterName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/characters`, {
        name: characterName.trim(),
        class_type: selectedClass
      });
      navigate(`/level-select/${res.data.id}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const deleteChar = async (id, e) => {
    e.stopPropagation();
    await axios.delete(`${API}/characters/${id}`);
    setExistingChars(prev => prev.filter(c => c.id !== id));
  };

  // Continue mode
  if (mode === 'continue') {
    return (
      <div className="min-h-screen bg-dark-primary p-6" data-testid="continue-screen">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 font-rajdhani" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" /> POWROT
        </button>
        <h1 className="font-cinzel text-3xl text-gold mb-8" data-testid="continue-title">Wybierz Postac</h1>

        {existingChars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-lato text-lg mb-4" data-testid="no-chars-msg">Brak zapisanych postaci</p>
            <button className="menu-btn" onClick={() => navigate('/character-select', { state: { mode: 'new' } })} data-testid="create-new-btn">
              STWORZ NOWA
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            {existingChars.map(char => {
              const cls = CHARACTER_CLASSES[char.class_type];
              return (
                <div
                  key={char.id}
                  onClick={() => navigate(`/level-select/${char.id}`)}
                  className="relative bg-black/80 border border-slate-800 p-5 rounded cursor-pointer hover:border-purple-500/50 group"
                  style={{ transition: 'border-color 0.2s ease, transform 0.2s ease' }}
                  data-testid={`char-card-${char.id}`}
                >
                  <button
                    onClick={(e) => deleteChar(char.id, e)}
                    className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
                    style={{ transition: 'opacity 0.2s ease' }}
                    data-testid={`delete-char-${char.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: cls?.cssColor + '33', border: `2px solid ${cls?.cssColor}66` }}>
                      <Swords className="w-5 h-5" style={{ color: cls?.cssColor }} />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-lg text-white">{char.name}</h3>
                      <p className="font-rajdhani text-sm" style={{ color: cls?.cssColor }}>{cls?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 font-rajdhani text-sm text-slate-400">
                    <span>Poz. {char.level}</span>
                    <span>Zabicia: {char.kills}</span>
                    <span>Zloto: {char.gold}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // New character mode
  return (
    <div className="min-h-screen bg-dark-primary" data-testid="character-select-screen">
      <div className="p-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-rajdhani" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" /> POWROT
        </button>
        <h1 className="font-cinzel text-3xl text-gold mb-2" data-testid="select-title">Wybierz Klase</h1>
        <p className="font-lato text-sm text-slate-500 mb-8">Kazda klasa ma unikalne zdolnosci i styl walki</p>
      </div>

      {/* Class grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl">
          {Object.entries(CHARACTER_CLASSES).map(([key, cls]) => {
            const IconComp = ICONS[cls.icon] || Swords;
            const isSelected = selectedClass === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedClass(key)}
                className={`relative p-5 rounded cursor-pointer border ${
                  isSelected ? 'border-opacity-70' : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  background: isSelected ? `${cls.cssColor}15` : 'rgba(0,0,0,0.6)',
                  borderColor: isSelected ? cls.cssColor : undefined,
                  boxShadow: isSelected ? `0 0 20px ${cls.cssColor}30` : 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
                }}
                data-testid={`class-card-${key}`}
              >
                {/* Class icon + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: `${cls.cssColor}22`, border: `1px solid ${cls.cssColor}44` }}>
                    <IconComp className="w-6 h-6" style={{ color: cls.cssColor }} />
                  </div>
                  <div>
                    <h3 className="font-cinzel-decorative text-base font-bold text-white">{cls.name}</h3>
                    <p className="font-rajdhani text-xs text-slate-400">{cls.attackStyle === 'melee' ? 'Walka wrecz' : 'Walka dystansowa'}</p>
                  </div>
                </div>

                <p className="font-lato text-xs text-slate-400 mb-4 leading-relaxed">{cls.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {Object.entries(cls.stats).map(([stat, val]) => (
                    <div key={stat} className="text-center">
                      <div className="font-rajdhani text-[10px] text-slate-500 uppercase">{stat}</div>
                      <div className="font-rajdhani text-sm font-bold" style={{ color: val >= 14 ? cls.cssColor : val >= 10 ? '#E5E5E5' : '#71717A' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Resources */}
                <div className="flex gap-3 text-xs font-rajdhani">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {cls.baseHealth}</span>
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-purple-500" /> {cls.baseMana}</span>
                  <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-green-500" /> {cls.baseStamina}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar - name + create */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-secondary/95 backdrop-blur-sm border-t border-slate-800 p-4 z-30">
        <div className="max-w-2xl mx-auto flex gap-4 items-center">
          <Input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Nazwa postaci..."
            className="bg-black/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 font-lato"
            maxLength={20}
            data-testid="character-name-input"
          />
          <button
            className="menu-btn whitespace-nowrap px-8 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!selectedClass || !characterName.trim() || loading}
            onClick={createCharacter}
            data-testid="create-character-btn"
          >
            {loading ? '...' : 'STWORZ'}
          </button>
        </div>
      </div>
    </div>
  );
}
