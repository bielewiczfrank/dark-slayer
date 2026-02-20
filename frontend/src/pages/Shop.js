import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { RARITY_COLORS } from '../game/data/gameData';
import { CHARACTER_CLASSES } from '../game/data/gameData';
import { ArrowLeft, Coins, ShoppingCart, Check, Sword, Shield, Star, Scroll, Package } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPE_ICONS = { weapon: Sword, armor: Shield, relic: Star, scroll: Scroll };

export default function Shop() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [items, setItems] = useState([]);
  const [buying, setBuying] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [charRes, itemsRes] = await Promise.all([
          axios.get(`${API}/characters/${characterId}`),
          axios.get(`${API}/shop?level=1`)
        ]);
        setCharacter(charRes.data);
        const lvl = charRes.data.level || 1;
        const shopRes = await axios.get(`${API}/shop?level=${lvl}`);
        setItems(shopRes.data);
      } catch (e) {
        navigate('/');
      }
    };
    load();
  }, [characterId, navigate]);

  const buyItem = async (itemId) => {
    setBuying(itemId);
    try {
      const res = await axios.post(`${API}/shop/buy`, {
        character_id: characterId,
        item_id: itemId
      });
      setCharacter(res.data);
    } catch (e) {
      console.error(e?.response?.data?.detail || 'Error');
    }
    setBuying(null);
  };

  const equipItem = async (index, slot) => {
    try {
      const res = await axios.post(`${API}/characters/${characterId}/equip`, {
        inventory_index: index,
        slot: slot
      });
      setCharacter(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const unequipItem = async (slot) => {
    try {
      const res = await axios.post(`${API}/characters/${characterId}/unequip`, { slot });
      setCharacter(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!character) {
    return <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <p className="font-rajdhani text-slate-500 animate-pulse">Ladowanie...</p>
    </div>;
  }

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="h-screen flex flex-col bg-dark-primary" data-testid="shop-screen">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/level-select/${characterId}`)} className="text-slate-400 hover:text-white" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-cinzel text-2xl text-gold">Sklep & Ekwipunek</h1>
        </div>
        <div className="flex items-center gap-2 font-rajdhani font-bold">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="text-gold text-lg" data-testid="shop-gold">{character.gold}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1 min-h-0 overflow-y-auto">
        {/* Equipment / Inventory */}
        <div className="lg:w-80 shrink-0">
          {/* Equipment slots */}
          <h3 className="font-cinzel text-sm text-slate-400 uppercase tracking-wider mb-3">Ekwipunek</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['weapon', 'armor', 'relic', 'scroll'].map(slot => {
              const item = character.equipment?.[slot];
              const Icon = TYPE_ICONS[slot] || Package;
              const rarity = item?.rarity || 'common';
              return (
                <div
                  key={slot}
                  className={`p-3 rounded border ${item ? `rarity-${rarity}-bg` : 'bg-black/40 border-slate-800'}`}
                  data-testid={`equip-slot-${slot}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color: item ? RARITY_COLORS[rarity]?.color : '#52525B' }} />
                    <span className="font-rajdhani text-xs text-slate-500 uppercase">{slot}</span>
                  </div>
                  {item ? (
                    <>
                      <p className="font-lato text-xs font-bold" style={{ color: RARITY_COLORS[rarity]?.color }}>{item.name}</p>
                      <button
                        onClick={() => unequipItem(slot)}
                        className="mt-1 text-xs font-rajdhani text-slate-500 hover:text-red-400"
                        data-testid={`unequip-${slot}`}
                      >
                        Zdejmij
                      </button>
                    </>
                  ) : (
                    <p className="font-lato text-xs text-slate-600">Puste</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inventory */}
          <h3 className="font-cinzel text-sm text-slate-400 uppercase tracking-wider mb-3">
            Plecak ({character.inventory?.length || 0})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(character.inventory || []).map((item, idx) => {
              const rarity = item.rarity || 'common';
              const Icon = TYPE_ICONS[item.type] || Package;
              const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : item.type === 'relic' ? 'relic' : 'scroll';
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded border rarity-${rarity}-bg`}
                  data-testid={`inventory-item-${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: RARITY_COLORS[rarity]?.color }} />
                    <div>
                      <p className="font-lato text-xs font-bold" style={{ color: RARITY_COLORS[rarity]?.color }}>{item.name}</p>
                      <p className="font-rajdhani text-[10px] text-slate-500">{RARITY_COLORS[rarity]?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => equipItem(idx, slot)}
                    className="px-2 py-1 bg-purple-900/40 border border-purple-500/30 rounded text-xs font-rajdhani text-purple-300 hover:bg-purple-900/60"
                    data-testid={`equip-item-${idx}`}
                  >
                    Zaloz
                  </button>
                </div>
              );
            })}
            {(!character.inventory || character.inventory.length === 0) && (
              <p className="font-lato text-xs text-slate-600 text-center py-4">Plecak jest pusty</p>
            )}
          </div>
        </div>

        {/* Shop items */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-cinzel text-sm text-slate-400 uppercase tracking-wider">Przedmioty</h3>
            <div className="flex gap-1 ml-auto">
              {['all', 'weapon', 'armor', 'relic', 'scroll'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded text-xs font-rajdhani uppercase ${
                    filter === f ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  data-testid={`filter-${f}`}
                >
                  {f === 'all' ? 'Wszystko' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map(item => {
              const rarity = item.rarity || 'common';
              const Icon = TYPE_ICONS[item.type] || Package;
              const canAfford = character.gold >= item.price;
              const meetsLevel = character.level >= item.level_req;
              const canBuy = canAfford && meetsLevel;
              const owned = character.inventory?.some(i => i.id === item.id) || Object.values(character.equipment || {}).some(e => e?.id === item.id);

              return (
                <div
                  key={item.id}
                  className={`item-card rarity-${rarity}-bg`}
                  data-testid={`shop-item-${item.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" style={{ color: RARITY_COLORS[rarity]?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-lato text-sm font-bold truncate" style={{ color: RARITY_COLORS[rarity]?.color }}>{item.name}</p>
                      <p className="font-rajdhani text-[10px]" style={{ color: RARITY_COLORS[rarity]?.color + '99' }}>{RARITY_COLORS[rarity]?.name}</p>
                    </div>
                  </div>

                  <p className="font-lato text-xs text-slate-500 mb-2">{item.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(item.stats || {}).map(([stat, val]) => {
                      if (val === 0 || stat === 'heal' || stat === 'damage') return null;
                      return (
                        <span key={stat} className="stat-badge">
                          <span className="text-slate-500">{stat}:</span>
                          <span className={val > 0 ? 'text-green-400' : 'text-red-400'}>{val > 0 ? '+' : ''}{val}</span>
                        </span>
                      );
                    })}
                    {item.stats?.heal && <span className="stat-badge text-green-400">Lecz: +{item.stats.heal}</span>}
                    {item.stats?.damage && <span className="stat-badge text-red-400">Dmg: {item.stats.damage}</span>}
                  </div>

                  {/* Price + Buy */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      <span className={`font-rajdhani text-sm font-bold ${canAfford ? 'text-gold' : 'text-red-400'}`}>{item.price}</span>
                      {item.level_req > 1 && (
                        <span className={`font-rajdhani text-xs ml-2 ${meetsLevel ? 'text-slate-500' : 'text-red-400'}`}>
                          Poz.{item.level_req}
                        </span>
                      )}
                    </div>
                    {owned ? (
                      <span className="flex items-center gap-1 font-rajdhani text-xs text-green-500">
                        <Check className="w-3.5 h-3.5" /> Posiadane
                      </span>
                    ) : (
                      <button
                        onClick={() => canBuy && buyItem(item.id)}
                        disabled={!canBuy || buying === item.id}
                        className={`px-3 py-1 rounded text-xs font-rajdhani font-bold flex items-center gap-1 ${
                          canBuy ? 'bg-red-900/60 border border-red-500/30 text-white hover:bg-red-900/80' : 'bg-slate-900/50 border border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                        style={{ transition: 'background 0.2s ease' }}
                        data-testid={`buy-${item.id}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {buying === item.id ? '...' : 'KUP'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
