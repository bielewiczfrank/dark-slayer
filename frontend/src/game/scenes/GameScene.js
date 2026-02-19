import Phaser from 'phaser';
import EventBus from '../EventBus';
import { ENEMY_STATS, BOSS_STATS } from '../data/gameData';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelData = data.level;
    this.charData = data.character;
    this.playerHealth = data.character.health || data.character.max_health;
    this.playerMaxHealth = data.character.max_health;
    this.playerMana = data.character.mana || data.character.max_mana;
    this.playerMaxMana = data.character.max_mana;
    this.playerStamina = data.character.stamina || data.character.max_stamina;
    this.playerMaxStamina = data.character.max_stamina;
    this.playerGold = 0;
    this.playerXP = 0;
    this.totalKills = 0;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.isDashing = false;
    this.isInvincible = false;
    this.canDoubleJump = false;
    this.gameOver = false;
    this.isPaused = false;
    this.exitReady = false;
    this.mobileLeft = false;
    this.mobileRight = false;
    this.mobileJump = false;
    this.bossActive = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, this.levelData.width, 600);

    this.createBackground();
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();
    this.createPlayer();
    this.enemies = this.physics.add.group();
    this.createEnemies();
    this.traps = this.physics.add.staticGroup();
    this.createTraps();
    this.collectibles = this.physics.add.group();
    this.createCollectibles();
    this.createExit();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();

    if (this.levelData.boss) {
      this.createBoss();
    } else {
      this.exitReady = true;
    }

    this.setupCollisions();
    this.setupInput();

    this.cameras.main.setBounds(0, 0, this.levelData.width, 600);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 40);

    this.emitHUDUpdate();

    EventBus.on('mobile-action', this.handleMobileAction.bind(this));
    EventBus.on('pause-game', () => { this.isPaused = true; this.physics.pause(); });
    EventBus.on('resume-game', () => { this.isPaused = false; this.physics.resume(); });
  }

  createBackground() {
    const bg = this.add.tileSprite(0, 0, this.levelData.width, 600, 'bg_far');
    bg.setOrigin(0, 0);
    bg.setScrollFactor(0.1);
    bg.setTint(this.levelData.bgColor || 0x1a1a2e);

    const mid = this.add.tileSprite(0, 0, this.levelData.width, 600, 'bg_mid');
    mid.setOrigin(0, 0);
    mid.setScrollFactor(0.4);
    mid.setTint(this.levelData.bgMidColor || 0x16213e);
  }

  createPlatforms() {
    for (const [x, w] of this.levelData.ground) {
      const ground = this.platforms.create(x + w / 2, 560, 'platform_stone');
      ground.setDisplaySize(w, 60).refreshBody();
    }
    for (const [x, y, w] of this.levelData.platforms) {
      const plat = this.platforms.create(x + w / 2, y, 'platform_float');
      plat.setDisplaySize(w, 20).refreshBody();
    }
  }

  createPlayer() {
    const { x, y } = this.levelData.playerStart;
    const textureKey = `player_${this.charData.class_type}`;
    this.player = this.physics.add.sprite(x, y, textureKey);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.body.setSize(24, 44);
    this.player.body.setOffset(8, 12);
    this.physics.add.collider(this.player, this.platforms);

    // Idle animation tween
    this.tweens.add({
      targets: this.player,
      scaleY: { from: 1, to: 1.03 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createEnemies() {
    for (const data of this.levelData.enemies) {
      const [x, y, type, patrolLeft, patrolRight] = data;
      const stats = ENEMY_STATS[type];
      if (!stats) continue;
      const enemy = this.enemies.create(x, y, `enemy_${type}`);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.05);
      enemy.body.setSize(26, 44);
      enemy.body.setOffset(7, 12);
      enemy.enemyType = type;
      enemy.patrolLeft = patrolLeft;
      enemy.patrolRight = patrolRight;
      enemy.hp = stats.hp;
      enemy.maxHp = stats.hp;
      enemy.attack = stats.attack;
      enemy.xpReward = stats.xp;
      enemy.goldReward = stats.gold;
      enemy.speed = stats.speed;
      enemy.state = 'patrol';
      enemy.attackCooldown = 0;
      enemy.isBoss = false;
      enemy.setVelocityX(stats.speed);
      this.physics.add.collider(enemy, this.platforms);
    }
  }

  createBoss() {
    const { x, y, type, health } = this.levelData.boss;
    const stats = BOSS_STATS[type];
    if (!stats) { this.exitReady = true; return; }

    this.boss = this.physics.add.sprite(x, y, `boss_${type}`);
    this.boss.setCollideWorldBounds(true);
    this.boss.setScale(1.4);
    this.boss.body.setSize(44, 64);
    this.boss.body.setOffset(8, 12);
    this.boss.hp = health;
    this.boss.maxHp = health;
    this.boss.bossType = type;
    this.boss.attack = stats.attack;
    this.boss.xpReward = stats.xp;
    this.boss.goldReward = stats.gold;
    this.boss.speed = stats.speed;
    this.boss.phase = 1;
    this.boss.attackCooldown = 0;
    this.boss.isBoss = true;
    this.boss.enemyType = type;

    this.physics.add.collider(this.boss, this.platforms);
    this.enemies.add(this.boss);
  }

  createTraps() {
    for (const [x, y, type] of this.levelData.traps) {
      const trapKey = type === 'spikes' ? 'trap_spikes' : 'trap_fire';
      const trap = this.traps.create(x, y, trapKey);
      trap.setDisplaySize(40, 20).refreshBody();
      trap.damage = type === 'spikes' ? 15 : 10;
      trap.trapType = type;

      if (type === 'fire') {
        this.tweens.add({
          targets: trap,
          alpha: { from: 0.6, to: 1 },
          duration: 400,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }

  createCollectibles() {
    for (const [x, y, type, value] of this.levelData.collectibles) {
      const key = type === 'gold' ? 'collectible_gold' : 'collectible_potion';
      const item = this.collectibles.create(x, y, key);
      item.body.setAllowGravity(false);
      item.collectType = type;
      item.value = value;
      this.tweens.add({
        targets: item,
        y: y - 6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createExit() {
    this.exitPortal = this.physics.add.sprite(
      this.levelData.exit.x, this.levelData.exit.y, 'exit_portal'
    );
    this.exitPortal.body.setAllowGravity(false);
    this.exitPortal.setAlpha(this.exitReady ? 0.8 : 0.2);

    this.tweens.add({
      targets: this.exitPortal,
      angle: 360,
      duration: 4000,
      repeat: -1
    });
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
      SPACE: this.input.keyboard.addKey('SPACE'),
      Z: this.input.keyboard.addKey('Z'),
      X: this.input.keyboard.addKey('X'),
      C: this.input.keyboard.addKey('C'),
      J: this.input.keyboard.addKey('J'),
      K: this.input.keyboard.addKey('K'),
      L: this.input.keyboard.addKey('L')
    };

    this.keys.Z.on('down', () => this.playerAttack());
    this.keys.J.on('down', () => this.playerAttack());
    this.keys.X.on('down', () => this.playerSpecial());
    this.keys.K.on('down', () => this.playerSpecial());
    this.keys.C.on('down', () => this.playerDash());
    this.keys.L.on('down', () => this.playerDash());
  }

  setupCollisions() {
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!this.isInvincible && !this.gameOver) {
        this.takeDamage(enemy.attack || 10);
      }
    });

    this.physics.add.overlap(this.player, this.traps, (player, trap) => {
      if (!this.isInvincible && !this.gameOver) {
        this.takeDamage(trap.damage || 10);
      }
    });

    this.physics.add.overlap(this.player, this.collectibles, (player, item) => {
      this.collectItem(item);
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      this.damageEnemy(enemy, proj.damage || 15);
      proj.destroy();
    });

    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      if (!this.isInvincible && !this.gameOver) {
        this.takeDamage(proj.damage || 15);
        proj.destroy();
      }
    });
  }

  handleMobileAction(action) {
    switch (action) {
      case 'left-start': this.mobileLeft = true; break;
      case 'left-end': this.mobileLeft = false; break;
      case 'right-start': this.mobileRight = true; break;
      case 'right-end': this.mobileRight = false; break;
      case 'jump': this.mobileJump = true; break;
      case 'attack': this.playerAttack(); break;
      case 'special': this.playerSpecial(); break;
      case 'dash': this.playerDash(); break;
      default: break;
    }
  }

  update(time, delta) {
    if (this.gameOver || this.isPaused) return;

    this.handleMovement();

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) this.updateEnemy(enemy, delta);
    });

    // Stamina regen
    if (this.playerStamina < this.playerMaxStamina) {
      this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + delta * 0.015);
    }
    // Mana regen
    if (this.playerMana < this.playerMaxMana) {
      this.playerMana = Math.min(this.playerMaxMana, this.playerMana + delta * 0.005);
    }

    // Check exit
    if (this.exitReady && this.exitPortal) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.exitPortal.x, this.exitPortal.y
      );
      if (dist < 40) this.levelComplete();
    }

    // Cleanup projectiles
    this.projectiles.getChildren().forEach(p => {
      if (p.x < 0 || p.x > this.levelData.width || p.y < 0 || p.y > 600) p.destroy();
    });
    this.enemyProjectiles.getChildren().forEach(p => {
      if (p.x < 0 || p.x > this.levelData.width || p.y < 0 || p.y > 600) p.destroy();
    });

    this.emitHUDUpdate();
  }

  handleMovement() {
    const speed = 250;
    const jumpVel = -420;

    if (this.isDashing) return;

    if (this.cursors.left.isDown || this.keys.A.isDown || this.mobileLeft) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.keys.D.isDown || this.mobileRight) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const onFloor = this.player.body.onFloor();

    if ((this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown || this.mobileJump) && onFloor) {
      this.player.setVelocityY(jumpVel);
      this.canDoubleJump = true;
      this.mobileJump = false;
    } else if ((this.cursors.up.isDown || this.keys.W.isDown || this.mobileJump) && this.canDoubleJump && !onFloor) {
      this.player.setVelocityY(jumpVel * 0.8);
      this.canDoubleJump = false;
      this.mobileJump = false;
    }

    if (onFloor) {
      this.mobileJump = false;
    }
  }

  playerAttack() {
    if (this.isAttacking || this.attackCooldown > 0 || this.gameOver) return;

    const isRanged = ['mage', 'dark_mage', 'elite_soldier'].includes(this.charData.class_type);

    if (isRanged) {
      if (this.playerMana < 8) return;
      this.playerMana -= 8;

      const dir = this.player.flipX ? -1 : 1;
      const projType = this.charData.class_type === 'elite_soldier' ? 'projectile_arrow' : 'projectile_magic';
      const proj = this.projectiles.create(this.player.x + dir * 20, this.player.y - 5, projType);
      proj.setVelocityX(dir * 400);
      proj.body.setAllowGravity(false);
      proj.setFlipX(this.player.flipX);
      proj.damage = this.calcDamage();
      this.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
    } else {
      if (this.playerStamina < 12) return;
      this.playerStamina -= 12;
      this.isAttacking = true;

      const dir = this.player.flipX ? -1 : 1;
      const slash = this.physics.add.sprite(this.player.x + dir * 28, this.player.y - 4, 'slash_effect');
      slash.body.setAllowGravity(false);
      slash.setFlipX(this.player.flipX);
      slash.setAlpha(0.8);
      slash.damage = this.calcDamage();

      const hitEnemies = new Set();
      this.physics.add.overlap(slash, this.enemies, (sl, enemy) => {
        if (!hitEnemies.has(enemy)) {
          hitEnemies.add(enemy);
          this.damageEnemy(enemy, sl.damage);
        }
      });

      this.time.delayedCall(180, () => {
        slash.destroy();
        this.isAttacking = false;
      });
    }

    this.attackCooldown = 350;
  }

  playerSpecial() {
    if (this.gameOver) return;
    const cost = 25;
    if (this.playerMana < cost) return;
    this.playerMana -= cost;

    // Area damage around player
    const range = 120;
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < range) {
        this.damageEnemy(enemy, this.calcDamage() * 1.5);
      }
    });

    // Visual effect
    const circle = this.add.circle(this.player.x, this.player.y, 10, 0x8844FF, 0.5);
    this.tweens.add({
      targets: circle,
      radius: range,
      alpha: 0,
      duration: 400,
      onUpdate: () => { circle.setRadius(circle.radius || 10); },
      onComplete: () => circle.destroy()
    });

    // Screen flash
    this.cameras.main.flash(200, 100, 50, 200);
    this.attackCooldown = 600;
  }

  playerDash() {
    if (this.isDashing || this.gameOver) return;
    if (this.playerStamina < 20) return;
    this.playerStamina -= 20;

    this.isDashing = true;
    this.isInvincible = true;

    const dir = this.player.flipX ? -1 : 1;
    this.player.setVelocityX(dir * 500);
    this.player.setAlpha(0.4);

    this.time.delayedCall(250, () => {
      this.isDashing = false;
      this.isInvincible = false;
      this.player.setAlpha(1);
    });
  }

  calcDamage() {
    const stats = this.charData.stats;
    const isRanged = ['mage', 'dark_mage', 'elite_soldier'].includes(this.charData.class_type);
    const weapon = this.charData.equipment?.weapon;
    const weaponDmg = weapon?.stats?.attack || 5;
    const statBonus = isRanged ? stats.int * 1.8 : stats.str * 1.8;
    const variance = 0.85 + Math.random() * 0.3;
    return Math.floor((weaponDmg + statBonus) * variance);
  }

  damageEnemy(enemy, amount) {
    if (!enemy.active) return;
    const dmg = Math.floor(amount);
    enemy.hp -= dmg;

    this.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      repeat: 2
    });

    const dir = enemy.x > this.player.x ? 1 : -1;
    enemy.setVelocityX(dir * 150);

    this.showDamageNumber(enemy.x, enemy.y - 30, dmg);

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }

    if (enemy.isBoss) {
      EventBus.emit('boss-hp', { current: Math.max(0, enemy.hp), max: enemy.maxHp, name: BOSS_STATS[enemy.bossType]?.name || 'Boss' });
    }
  }

  killEnemy(enemy) {
    this.totalKills++;
    this.playerXP += enemy.xpReward || 10;
    this.playerGold += enemy.goldReward || 5;

    // Death effect
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 1.5,
      y: enemy.y - 20,
      duration: 300,
      onComplete: () => enemy.destroy()
    });

    if (enemy.isBoss) {
      this.bossActive = false;
      this.exitReady = true;
      this.exitPortal.setAlpha(1);
      this.tweens.add({
        targets: this.exitPortal,
        scaleX: { from: 1, to: 1.2 },
        scaleY: { from: 1, to: 1.2 },
        duration: 600,
        yoyo: true,
        repeat: -1
      });
      EventBus.emit('boss-defeated', { name: 'Boss pokonany!' });
      this.cameras.main.shake(500, 0.01);
    }
  }

  takeDamage(amount) {
    if (this.isInvincible || this.gameOver) return;

    const defense = (this.charData.stats.end || 0) * 1.5;
    const armorDef = this.charData.equipment?.armor?.stats?.defense || 0;
    const actualDmg = Math.max(1, Math.floor(amount - (defense + armorDef) / 4));

    this.playerHealth -= actualDmg;
    this.isInvincible = true;

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (this.player.active) this.player.setAlpha(1);
        this.isInvincible = false;
      }
    });

    this.cameras.main.shake(100, 0.005);
    this.showDamageNumber(this.player.x, this.player.y - 40, actualDmg, '#FF4444');

    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.playerDeath();
    }
  }

  playerDeath() {
    this.gameOver = true;
    this.player.setVelocityY(-300);
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      angle: 360,
      duration: 800
    });

    this.cameras.main.fade(1000, 0, 0, 0);
    this.time.delayedCall(1200, () => {
      EventBus.emit('player-died', {
        xp: this.playerXP,
        gold: this.playerGold,
        kills: this.totalKills
      });
    });
  }

  showDamageNumber(x, y, amount, color = '#FFAA00') {
    const text = this.add.text(x, y, `${amount}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  updateEnemy(enemy, delta) {
    if (!enemy.active || !enemy.body) return;

    enemy.attackCooldown = Math.max(0, (enemy.attackCooldown || 0) - delta);

    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

    if (enemy.isBoss) {
      this.updateBoss(enemy, delta, dist);
      return;
    }

    const detectionRange = 250;
    const attackRange = 40;

    if (dist < detectionRange) {
      // Chase
      const chaseSpeed = (enemy.speed || 60) * 1.3;
      if (this.player.x < enemy.x) {
        enemy.setVelocityX(-chaseSpeed);
        enemy.setFlipX(true);
      } else {
        enemy.setVelocityX(chaseSpeed);
        enemy.setFlipX(false);
      }
    } else {
      // Patrol
      if (enemy.x <= enemy.patrolLeft) {
        enemy.setVelocityX(enemy.speed || 60);
        enemy.setFlipX(false);
      } else if (enemy.x >= enemy.patrolRight) {
        enemy.setVelocityX(-(enemy.speed || 60));
        enemy.setFlipX(true);
      }
    }
  }

  updateBoss(boss, delta, dist) {
    const hpPct = boss.hp / boss.maxHp;
    if (hpPct <= 0.25) boss.phase = 3;
    else if (hpPct <= 0.5) boss.phase = 2;

    if (!this.bossActive && dist < 400) {
      this.bossActive = true;
      EventBus.emit('boss-start', {
        name: BOSS_STATS[boss.bossType]?.name || 'Boss',
        hp: boss.hp,
        maxHp: boss.maxHp
      });
    }

    if (!this.bossActive) return;

    const speed = (boss.speed || 70) + (boss.phase - 1) * 20;

    if (this.player.x < boss.x) {
      boss.setVelocityX(-speed);
      boss.setFlipX(true);
    } else {
      boss.setVelocityX(speed);
      boss.setFlipX(false);
    }

    // Ranged attack for phase 2+
    if (boss.phase >= 2 && dist > 150 && boss.attackCooldown <= 0) {
      this.bossRangedAttack(boss);
      boss.attackCooldown = 2500 / boss.phase;
    }
  }

  bossRangedAttack(boss) {
    const dir = this.player.x < boss.x ? -1 : 1;
    const proj = this.enemyProjectiles.create(boss.x + dir * 30, boss.y - 10, 'projectile_boss');
    proj.setVelocityX(dir * 250);
    proj.setVelocityY(Phaser.Math.Between(-50, 50));
    proj.body.setAllowGravity(false);
    proj.damage = boss.attack * 0.7;
    this.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
  }

  collectItem(item) {
    if (!item.active) return;
    if (item.collectType === 'gold') {
      this.playerGold += item.value;
      this.showDamageNumber(item.x, item.y - 10, `+${item.value}`, '#FFD700');
    } else if (item.collectType === 'potion') {
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + item.value);
      this.showDamageNumber(item.x, item.y - 10, `+${item.value}`, '#22CC55');
    }
    item.destroy();
  }

  levelComplete() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.cameras.main.flash(500, 100, 50, 200);

    this.time.delayedCall(800, () => {
      EventBus.emit('level-complete', {
        levelId: this.levelData.id,
        xp: this.playerXP,
        gold: this.playerGold,
        kills: this.totalKills
      });
    });
  }

  emitHUDUpdate() {
    EventBus.emit('hud-update', {
      health: Math.floor(this.playerHealth),
      maxHealth: this.playerMaxHealth,
      mana: Math.floor(this.playerMana),
      maxMana: this.playerMaxMana,
      stamina: Math.floor(this.playerStamina),
      maxStamina: this.playerMaxStamina,
      gold: this.playerGold,
      xp: this.playerXP,
      kills: this.totalKills
    });
  }

  shutdown() {
    EventBus.off('mobile-action', this.handleMobileAction);
    EventBus.off('pause-game');
    EventBus.off('resume-game');
  }
}
