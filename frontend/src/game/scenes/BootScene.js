import Phaser from 'phaser';
import { CHARACTER_CLASSES } from '../data/gameData';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateTextures();
    const characterData = this.game.registry.get('characterData');
    const levelData = this.game.registry.get('levelData');
    this.scene.start('GameScene', { character: characterData, level: levelData });
  }

  darken(color, factor) {
    const r = Math.floor(((color >> 16) & 0xFF) * factor);
    const g = Math.floor(((color >> 8) & 0xFF) * factor);
    const b = Math.floor((color & 0xFF) * factor);
    return (r << 16) | (g << 8) | b;
  }

  generateTextures() {
    this.generateBackgrounds();
    this.generatePlayerTextures();
    this.generateEnemyTextures();
    this.generateBossTextures();
    this.generatePlatformTextures();
    this.generateTrapTextures();
    this.generateCollectibleTextures();
    this.generateProjectileTextures();
    this.generateExitTexture();
  }

  generateBackgrounds() {
    const w = 960, h = 600;
    // Far background - sky with stars
    let gfx = this.add.graphics();
    gfx.fillStyle(0x0a0a1a, 1);
    gfx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * 350;
      gfx.fillStyle(0xFFFFFF, Math.random() * 0.4 + 0.2);
      gfx.fillCircle(sx, sy, Math.random() * 1.5 + 0.5);
    }
    gfx.fillStyle(0x1a0a2e, 0.4);
    gfx.fillRect(0, 400, w, 200);
    gfx.generateTexture('bg_far', w, h);
    gfx.destroy();

    // Mid background - mountain silhouettes
    gfx = this.add.graphics();
    gfx.fillStyle(0x0f0f1f, 0.7);
    gfx.beginPath();
    gfx.moveTo(0, h);
    const points = [0, 380, 80, 320, 180, 360, 280, 290, 380, 340, 480, 270, 580, 330, 680, 280, 780, 350, 880, 300, w, 330, w, h];
    for (let i = 0; i < points.length; i += 2) {
      gfx.lineTo(points[i], points[i + 1]);
    }
    gfx.closePath();
    gfx.fillPath();
    gfx.fillStyle(0x060612, 0.8);
    gfx.beginPath();
    gfx.moveTo(0, h);
    const trees = [0, 450, 40, 400, 80, 460, 140, 410, 200, 470, 260, 420, 320, 460, 380, 430, 440, 470, 500, 410, 560, 450, 620, 400, 680, 460, 740, 430, 800, 470, 860, 420, 920, 460, w, 440, w, h];
    for (let i = 0; i < trees.length; i += 2) {
      gfx.lineTo(trees[i], trees[i + 1]);
    }
    gfx.closePath();
    gfx.fillPath();
    gfx.generateTexture('bg_mid', w, h);
    gfx.destroy();
  }

  generatePlayerTextures() {
    for (const [key, cls] of Object.entries(CHARACTER_CLASSES)) {
      const gfx = this.add.graphics();
      const c = cls.color;

      // Shadow
      gfx.fillStyle(0x000000, 0.3);
      gfx.fillEllipse(20, 56, 28, 6);

      // Legs
      gfx.fillStyle(this.darken(c, 0.4), 1);
      gfx.fillRect(11, 44, 7, 12);
      gfx.fillRect(22, 44, 7, 12);

      // Boots
      gfx.fillStyle(0x332211, 1);
      gfx.fillRoundedRect(9, 52, 10, 6, 2);
      gfx.fillRoundedRect(21, 52, 10, 6, 2);

      // Body
      gfx.fillStyle(c, 1);
      gfx.fillRoundedRect(8, 18, 24, 28, 5);

      // Belt
      gfx.fillStyle(this.darken(c, 0.6), 1);
      gfx.fillRect(8, 38, 24, 4);

      // Head
      gfx.fillStyle(0xD4A574, 1);
      gfx.fillCircle(20, 13, 9);

      // Hair
      gfx.fillStyle(this.darken(c, 0.3), 1);
      gfx.fillRoundedRect(11, 2, 18, 10, 4);

      // Eyes
      gfx.fillStyle(0xFFFFFF, 1);
      gfx.fillCircle(17, 12, 2.5);
      gfx.fillCircle(24, 12, 2.5);
      gfx.fillStyle(0x111111, 1);
      gfx.fillCircle(17, 12, 1.2);
      gfx.fillCircle(24, 12, 1.2);

      gfx.generateTexture(`player_${key}`, 40, 58);
      gfx.destroy();
    }
  }

  generateEnemyTextures() {
    const enemies = {
      undead: { body: 0x336633, head: 0x44AA44, dark: 0x113311 },
      demon: { body: 0x882222, head: 0xCC3333, dark: 0x441111 },
      cultist: { body: 0x442266, head: 0xBB99AA, dark: 0x221133 },
      dragon_mini: { body: 0xBB5500, head: 0xDD7700, dark: 0x663300 }
    };

    for (const [type, colors] of Object.entries(enemies)) {
      const gfx = this.add.graphics();

      gfx.fillStyle(0x000000, 0.3);
      gfx.fillEllipse(20, 56, 28, 6);

      gfx.fillStyle(colors.dark, 1);
      gfx.fillRect(11, 44, 7, 12);
      gfx.fillRect(22, 44, 7, 12);

      gfx.fillStyle(colors.body, 1);
      gfx.fillRoundedRect(6, 18, 28, 28, 5);

      gfx.fillStyle(colors.head, 1);
      gfx.fillCircle(20, 14, 10);

      // Eyes - red/glowing
      gfx.fillStyle(0xFF0000, 1);
      gfx.fillCircle(16, 13, 2);
      gfx.fillCircle(24, 13, 2);

      if (type === 'demon') {
        gfx.fillStyle(0x440000, 1);
        gfx.fillTriangle(12, 6, 10, 0, 14, 4);
        gfx.fillTriangle(28, 6, 26, 0, 30, 4);
      }

      if (type === 'dragon_mini') {
        gfx.fillStyle(colors.dark, 0.7);
        gfx.fillTriangle(0, 30, 6, 18, 8, 35);
        gfx.fillTriangle(40, 30, 34, 18, 32, 35);
      }

      gfx.generateTexture(`enemy_${type}`, 40, 58);
      gfx.destroy();
    }
  }

  generateBossTextures() {
    const bosses = {
      undead_king: { body: 0x225522, head: 0x44CC44, crown: 0xFFD700 },
      demon_lord: { body: 0x881122, head: 0xCC2244, crown: 0xFF4400 },
      ancient_dragon: { body: 0xCC4400, head: 0xEE6600, crown: 0xFFAA00 }
    };

    for (const [type, colors] of Object.entries(bosses)) {
      const gfx = this.add.graphics();

      gfx.fillStyle(0x000000, 0.4);
      gfx.fillEllipse(30, 76, 40, 8);

      gfx.fillStyle(this.darken(colors.body, 0.5), 1);
      gfx.fillRect(14, 60, 12, 16);
      gfx.fillRect(34, 60, 12, 16);

      gfx.fillStyle(colors.body, 1);
      gfx.fillRoundedRect(8, 24, 44, 40, 8);

      gfx.fillStyle(colors.head, 1);
      gfx.fillCircle(30, 18, 14);

      // Crown
      gfx.fillStyle(colors.crown, 1);
      gfx.fillRect(18, 0, 24, 8);
      gfx.fillTriangle(18, 8, 18, 0, 22, 0);
      gfx.fillTriangle(30, 0, 28, -4, 32, -4);
      gfx.fillTriangle(42, 8, 38, 0, 42, 0);

      // Eyes
      gfx.fillStyle(0xFF0000, 1);
      gfx.fillCircle(24, 16, 3);
      gfx.fillCircle(36, 16, 3);
      gfx.fillStyle(0xFFFF00, 1);
      gfx.fillCircle(24, 16, 1.5);
      gfx.fillCircle(36, 16, 1.5);

      gfx.generateTexture(`boss_${type}`, 60, 80);
      gfx.destroy();
    }
  }

  generatePlatformTextures() {
    // Stone ground
    let gfx = this.add.graphics();
    gfx.fillStyle(0x3a3a4a, 1);
    gfx.fillRect(0, 0, 64, 64);
    gfx.fillStyle(0x4a4a5a, 0.3);
    gfx.fillRect(0, 0, 64, 4);
    gfx.lineStyle(1, 0x2a2a3a, 0.4);
    gfx.strokeRect(0, 0, 32, 32);
    gfx.strokeRect(32, 32, 32, 32);
    gfx.generateTexture('platform_stone', 64, 64);
    gfx.destroy();

    // Floating platform
    gfx = this.add.graphics();
    gfx.fillStyle(0x4a4a5a, 1);
    gfx.fillRoundedRect(0, 0, 64, 20, 3);
    gfx.fillStyle(0x5a5a6a, 0.4);
    gfx.fillRect(2, 0, 60, 5);
    gfx.fillStyle(0x2a2a3a, 0.6);
    gfx.fillRect(2, 16, 60, 4);
    gfx.generateTexture('platform_float', 64, 20);
    gfx.destroy();
  }

  generateTrapTextures() {
    // Spikes
    let gfx = this.add.graphics();
    gfx.fillStyle(0xAA3333, 1);
    for (let i = 0; i < 5; i++) {
      gfx.fillTriangle(i * 8, 20, i * 8 + 4, 2, i * 8 + 8, 20);
    }
    gfx.generateTexture('trap_spikes', 40, 20);
    gfx.destroy();

    // Fire
    gfx = this.add.graphics();
    gfx.fillStyle(0xFF4400, 0.8);
    gfx.fillCircle(15, 15, 12);
    gfx.fillStyle(0xFF6600, 0.6);
    gfx.fillCircle(15, 10, 10);
    gfx.fillStyle(0xFFAA00, 0.5);
    gfx.fillCircle(15, 8, 7);
    gfx.fillStyle(0xFFDD00, 0.3);
    gfx.fillCircle(15, 6, 4);
    gfx.generateTexture('trap_fire', 30, 28);
    gfx.destroy();
  }

  generateCollectibleTextures() {
    // Gold
    let gfx = this.add.graphics();
    gfx.fillStyle(0xFFD700, 1);
    gfx.fillCircle(8, 8, 7);
    gfx.fillStyle(0xCC9900, 1);
    gfx.fillCircle(8, 8, 5);
    gfx.fillStyle(0xFFD700, 1);
    gfx.fillCircle(7, 7, 3);
    gfx.generateTexture('collectible_gold', 16, 16);
    gfx.destroy();

    // Health potion
    gfx = this.add.graphics();
    gfx.fillStyle(0xCC1111, 1);
    gfx.fillRoundedRect(3, 8, 10, 12, 3);
    gfx.fillStyle(0x991111, 1);
    gfx.fillRoundedRect(5, 2, 6, 8, 2);
    gfx.fillStyle(0xFF3333, 0.5);
    gfx.fillRect(6, 10, 4, 3);
    gfx.generateTexture('collectible_potion', 16, 22);
    gfx.destroy();
  }

  generateProjectileTextures() {
    // Magic bolt
    let gfx = this.add.graphics();
    gfx.fillStyle(0x8844FF, 0.4);
    gfx.fillCircle(8, 8, 8);
    gfx.fillStyle(0xAA66FF, 0.7);
    gfx.fillCircle(8, 8, 5);
    gfx.fillStyle(0xCCAAFF, 1);
    gfx.fillCircle(8, 8, 3);
    gfx.generateTexture('projectile_magic', 16, 16);
    gfx.destroy();

    // Arrow
    gfx = this.add.graphics();
    gfx.fillStyle(0x886644, 1);
    gfx.fillRect(0, 3, 14, 2);
    gfx.fillStyle(0xCCCCCC, 1);
    gfx.fillTriangle(14, 0, 20, 4, 14, 8);
    gfx.fillStyle(0x664422, 0.8);
    gfx.fillTriangle(0, 1, 4, 4, 0, 7);
    gfx.generateTexture('projectile_arrow', 20, 8);
    gfx.destroy();

    // Slash effect
    gfx = this.add.graphics();
    gfx.fillStyle(0xFFFFFF, 0.7);
    gfx.beginPath();
    gfx.moveTo(0, 32);
    gfx.lineTo(36, 0);
    gfx.lineTo(40, 8);
    gfx.lineTo(6, 38);
    gfx.closePath();
    gfx.fillPath();
    gfx.generateTexture('slash_effect', 40, 40);
    gfx.destroy();

    // Boss projectile
    gfx = this.add.graphics();
    gfx.fillStyle(0xFF2200, 0.5);
    gfx.fillCircle(10, 10, 10);
    gfx.fillStyle(0xFF4400, 0.7);
    gfx.fillCircle(10, 10, 7);
    gfx.fillStyle(0xFFAA00, 1);
    gfx.fillCircle(10, 10, 4);
    gfx.generateTexture('projectile_boss', 20, 20);
    gfx.destroy();
  }

  generateExitTexture() {
    const gfx = this.add.graphics();
    gfx.fillStyle(0x2200AA, 0.2);
    gfx.fillCircle(24, 30, 24);
    gfx.fillStyle(0x4400CC, 0.4);
    gfx.fillCircle(24, 30, 18);
    gfx.fillStyle(0x6600FF, 0.6);
    gfx.fillCircle(24, 30, 12);
    gfx.fillStyle(0x8800FF, 0.8);
    gfx.fillCircle(24, 30, 7);
    gfx.fillStyle(0xCC88FF, 1);
    gfx.fillCircle(24, 30, 3);
    gfx.generateTexture('exit_portal', 48, 60);
    gfx.destroy();
  }
}
