export const CHARACTER_CLASSES = {
  knight: {
    id: 'knight', name: 'Rycerz',
    description: 'Wytrzymaly wojownik z mieczem i tarcza. Doskonaly w walce wrecz.',
    color: 0x4488CC, cssColor: '#4488CC',
    stats: { str: 12, dex: 8, end: 14, int: 4, lck: 7 },
    baseHealth: 120, baseMana: 30, baseStamina: 100,
    weaponType: 'sword', attackStyle: 'melee',
    icon: 'Shield'
  },
  mage: {
    id: 'mage', name: 'Mag',
    description: 'Potezny czarodziej wladajacy zywiolami. Niszczy wrogow z dystansu.',
    color: 0x8844FF, cssColor: '#8844FF',
    stats: { str: 4, dex: 6, end: 6, int: 16, lck: 8 },
    baseHealth: 70, baseMana: 120, baseStamina: 60,
    weaponType: 'staff', attackStyle: 'ranged',
    icon: 'Wand2'
  },
  assassin: {
    id: 'assassin', name: 'Zabojca',
    description: 'Szybki i smiertelny cien nocy. Mistrz sztyletow i unikow.',
    color: 0x22AA44, cssColor: '#22AA44',
    stats: { str: 8, dex: 16, end: 6, int: 6, lck: 10 },
    baseHealth: 80, baseMana: 50, baseStamina: 120,
    weaponType: 'dagger', attackStyle: 'melee',
    icon: 'Eye'
  },
  dark_mage: {
    id: 'dark_mage', name: 'Czarny Mag',
    description: 'Mistrz mrocznych sztuk i zakazanej magii. Potezny ale kruchy.',
    color: 0xAA22CC, cssColor: '#AA22CC',
    stats: { str: 3, dex: 5, end: 5, int: 18, lck: 9 },
    baseHealth: 60, baseMana: 140, baseStamina: 50,
    weaponType: 'wand', attackStyle: 'ranged',
    icon: 'Skull'
  },
  soldier: {
    id: 'soldier', name: 'Zolnierz',
    description: 'Doswiadczony weteran wielu bitew. Silny i wytrzymaly.',
    color: 0x886633, cssColor: '#886633',
    stats: { str: 14, dex: 7, end: 12, int: 3, lck: 6 },
    baseHealth: 130, baseMana: 20, baseStamina: 110,
    weaponType: 'spear', attackStyle: 'melee',
    icon: 'Sword'
  },
  elite_soldier: {
    id: 'elite_soldier', name: 'Elitarny Zolnierz',
    description: 'Najlepszy z najlepszych. Mistrz taktyki i kuszy.',
    color: 0xCCAA33, cssColor: '#CCAA33',
    stats: { str: 13, dex: 10, end: 11, int: 5, lck: 8 },
    baseHealth: 110, baseMana: 40, baseStamina: 100,
    weaponType: 'crossbow', attackStyle: 'ranged',
    icon: 'Target'
  },
  dark_knight: {
    id: 'dark_knight', name: 'Ciemny Rycerz',
    description: 'Rycerz pochloniety przez mrok. Laczy sile z mroczna magia.',
    color: 0xCC2244, cssColor: '#CC2244',
    stats: { str: 15, dex: 6, end: 13, int: 8, lck: 5 },
    baseHealth: 140, baseMana: 60, baseStamina: 90,
    weaponType: 'greatsword', attackStyle: 'melee',
    icon: 'Flame'
  }
};

export const ENEMY_STATS = {
  undead: { name: 'Nieumarły', hp: 30, attack: 8, xp: 15, gold: 5, speed: 60, color: 0x44AA44 },
  demon: { name: 'Demon', hp: 50, attack: 15, xp: 30, gold: 12, speed: 80, color: 0xCC2244 },
  cultist: { name: 'Kultysta', hp: 35, attack: 12, xp: 20, gold: 8, speed: 50, color: 0x7733AA },
  dragon_mini: { name: 'Smoczy Szczeniak', hp: 80, attack: 20, xp: 50, gold: 20, speed: 40, color: 0xDD6600 }
};

export const BOSS_STATS = {
  undead_king: { name: 'Krol Nieumarłych', hp: 300, attack: 20, xp: 200, gold: 100, speed: 70, color: 0x225522 },
  demon_lord: { name: 'Wladca Demonow', hp: 500, attack: 30, xp: 400, gold: 200, speed: 80, color: 0x881122 },
  ancient_dragon: { name: 'Pradawny Smok', hp: 800, attack: 40, xp: 600, gold: 350, speed: 60, color: 0xCC4400 }
};

export const RARITY_COLORS = {
  common: { color: '#9CA3AF', name: 'Zwykly' },
  rare: { color: '#2563EB', name: 'Rzadki' },
  epic: { color: '#9333EA', name: 'Epicki' },
  mythic: { color: '#EF4444', name: 'Mityczny' },
  legendary: { color: '#F59E0B', name: 'Legendarny' }
};

export const STAT_NAMES = {
  str: 'Sila',
  dex: 'Zrecznosc',
  end: 'Wytrzymalosc',
  int: 'Inteligencja',
  lck: 'Szczescie'
};

export const LEVELS = [
  {
    id: 1,
    name: 'Mroczny Las',
    description: 'Ciemny las pelny nieumarłych stworzen.',
    difficulty: 1,
    width: 6000,
    height: 600,
    bgColor: 0x0a1a0a,
    bgMidColor: 0x0a150a,
    playerStart: { x: 100, y: 400 },
    ground: [[0, 800], [900, 600], [1600, 700], [2400, 800], [3300, 700], [4100, 1900]],
    platforms: [
      [300, 440, 120], [500, 380, 100], [750, 430, 150],
      [1000, 420, 130], [1200, 350, 120],
      [1700, 420, 130], [1900, 350, 100], [2050, 280, 120],
      [2600, 430, 100], [2800, 370, 120], [3000, 310, 100],
      [3500, 420, 150], [3700, 350, 120],
      [4300, 450, 100], [4500, 400, 120], [4700, 350, 100]
    ],
    enemies: [
      [600, 490, 'undead', 500, 750],
      [1050, 490, 'undead', 950, 1150],
      [1400, 490, 'undead', 1300, 1550],
      [1800, 490, 'undead', 1700, 2000],
      [2500, 490, 'cultist', 2400, 2700],
      [2900, 490, 'undead', 2800, 3100],
      [3100, 490, 'cultist', 3000, 3250],
      [3600, 490, 'undead', 3500, 3800],
      [4400, 490, 'undead', 4300, 4600],
      [4700, 490, 'cultist', 4600, 4900]
    ],
    traps: [
      [830, 530, 'spikes'], [1550, 530, 'spikes'],
      [2350, 530, 'fire'], [3250, 530, 'spikes'],
      [4050, 530, 'fire']
    ],
    collectibles: [
      [320, 410, 'gold', 10], [520, 350, 'gold', 15],
      [1020, 390, 'gold', 10], [1220, 320, 'gold', 20],
      [1920, 320, 'potion', 30], [2070, 250, 'gold', 25],
      [2620, 400, 'gold', 15], [2820, 340, 'potion', 30],
      [3020, 280, 'gold', 30], [3520, 390, 'gold', 20],
      [4320, 420, 'gold', 15], [4520, 370, 'gold', 20]
    ],
    exit: { x: 5800, y: 480 },
    boss: { x: 5200, y: 440, type: 'undead_king', health: 300 }
  },
  {
    id: 2,
    name: 'Twierdza Demonow',
    description: 'Plonaca twierdza pelna demonow i pulapek.',
    difficulty: 2,
    width: 7000,
    height: 600,
    bgColor: 0x1a0a0a,
    bgMidColor: 0x150a0a,
    playerStart: { x: 100, y: 400 },
    ground: [[0, 700], [800, 500], [1400, 600], [2100, 500], [2700, 700], [3500, 600], [4200, 500], [4800, 600], [5500, 1500]],
    platforms: [
      [250, 440, 120], [450, 370, 100], [650, 300, 120],
      [900, 420, 100], [1100, 350, 130], [1300, 280, 100],
      [1500, 430, 120], [1700, 360, 100], [1900, 290, 120],
      [2200, 420, 130], [2400, 350, 100], [2600, 280, 120],
      [2800, 440, 100], [3000, 370, 130], [3200, 300, 100],
      [3600, 430, 120], [3800, 360, 100], [4000, 290, 120],
      [4300, 420, 100], [4500, 350, 130], [4700, 280, 100],
      [5000, 440, 120], [5200, 370, 100], [5400, 300, 120]
    ],
    enemies: [
      [500, 490, 'demon', 400, 650],
      [900, 490, 'undead', 800, 1100],
      [1200, 490, 'demon', 1100, 1400],
      [1600, 490, 'cultist', 1500, 1800],
      [2000, 490, 'demon', 1900, 2200],
      [2500, 490, 'demon', 2400, 2700],
      [2900, 490, 'cultist', 2800, 3100],
      [3300, 490, 'demon', 3200, 3500],
      [3700, 490, 'undead', 3600, 3900],
      [4100, 490, 'demon', 4000, 4300],
      [4500, 490, 'cultist', 4400, 4700],
      [5000, 490, 'demon', 4900, 5200],
      [5300, 490, 'demon', 5200, 5500]
    ],
    traps: [
      [750, 530, 'fire'], [1350, 530, 'spikes'], [2050, 530, 'fire'],
      [2650, 530, 'fire'], [3450, 530, 'spikes'], [4150, 530, 'fire'],
      [4750, 530, 'fire'], [5450, 530, 'spikes']
    ],
    collectibles: [
      [270, 410, 'gold', 15], [470, 340, 'gold', 20],
      [670, 270, 'gold', 25], [1120, 320, 'potion', 40],
      [1720, 330, 'gold', 20], [2220, 390, 'gold', 20],
      [2420, 320, 'gold', 25], [3020, 340, 'potion', 50],
      [3620, 400, 'gold', 25], [4020, 260, 'gold', 30],
      [4520, 320, 'gold', 25], [5020, 410, 'potion', 50],
      [5220, 340, 'gold', 30]
    ],
    exit: { x: 6800, y: 480 },
    boss: { x: 6200, y: 420, type: 'demon_lord', health: 500 }
  },
  {
    id: 3,
    name: 'Smocza Jaskinia',
    description: 'Pradawna jaskinia strzez?na przez poteznego smoka.',
    difficulty: 3,
    width: 8000,
    height: 600,
    bgColor: 0x1a0f00,
    bgMidColor: 0x150a00,
    playerStart: { x: 100, y: 400 },
    ground: [[0, 600], [700, 500], [1300, 400], [1800, 600], [2500, 500], [3100, 600], [3800, 500], [4400, 600], [5100, 500], [5700, 600], [6400, 1600]],
    platforms: [
      [200, 440, 120], [400, 370, 100], [600, 300, 100],
      [800, 420, 100], [1000, 350, 120], [1200, 280, 100],
      [1400, 430, 100], [1600, 360, 120], [1800, 290, 100],
      [2000, 440, 120], [2200, 370, 100], [2400, 300, 100],
      [2600, 420, 100], [2800, 350, 130], [3000, 280, 100],
      [3200, 440, 120], [3400, 370, 100], [3600, 300, 100],
      [3900, 420, 100], [4100, 350, 120], [4300, 280, 100],
      [4500, 440, 100], [4700, 370, 130], [4900, 300, 100],
      [5200, 420, 120], [5400, 350, 100], [5600, 280, 100],
      [5800, 440, 100], [6000, 370, 120], [6200, 300, 100]
    ],
    enemies: [
      [400, 490, 'demon', 300, 550],
      [800, 490, 'cultist', 700, 950],
      [1100, 490, 'demon', 1000, 1300],
      [1500, 490, 'dragon_mini', 1400, 1700],
      [1900, 490, 'demon', 1800, 2100],
      [2300, 490, 'cultist', 2200, 2500],
      [2700, 490, 'demon', 2600, 2900],
      [3000, 490, 'dragon_mini', 2900, 3200],
      [3400, 490, 'demon', 3300, 3600],
      [3800, 490, 'cultist', 3700, 4000],
      [4200, 490, 'demon', 4100, 4400],
      [4600, 490, 'dragon_mini', 4500, 4800],
      [5000, 490, 'demon', 4900, 5200],
      [5400, 490, 'cultist', 5300, 5600],
      [5800, 490, 'demon', 5700, 6000],
      [6200, 490, 'demon', 6100, 6400]
    ],
    traps: [
      [650, 530, 'fire'], [1250, 530, 'fire'], [1750, 530, 'spikes'],
      [2450, 530, 'fire'], [3050, 530, 'fire'], [3750, 530, 'spikes'],
      [4350, 530, 'fire'], [5050, 530, 'fire'], [5650, 530, 'spikes'],
      [6350, 530, 'fire']
    ],
    collectibles: [
      [220, 410, 'gold', 20], [420, 340, 'gold', 25],
      [1020, 320, 'potion', 50], [1620, 330, 'gold', 30],
      [2020, 410, 'gold', 25], [2220, 340, 'potion', 60],
      [2820, 320, 'gold', 30], [3220, 410, 'gold', 25],
      [3420, 340, 'gold', 30], [3920, 390, 'potion', 60],
      [4120, 320, 'gold', 35], [4720, 340, 'gold', 30],
      [5220, 390, 'potion', 70], [5420, 320, 'gold', 35],
      [5820, 410, 'gold', 30], [6020, 340, 'gold', 40]
    ],
    exit: { x: 7800, y: 480 },
    boss: { x: 7200, y: 400, type: 'ancient_dragon', health: 800 }
  }
];
