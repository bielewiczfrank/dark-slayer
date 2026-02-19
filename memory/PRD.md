# Dark Realms - PRD

## Problem Statement
2D action-platformer game inspired by Magic Rampage with dark fantasy theme, 7 character classes, equipment system, combat mechanics, 3 hand-crafted dungeon levels with bosses, XP/progression system, and item shop.

## Architecture
- **Frontend**: React + Phaser.js (game engine) + Tailwind CSS
- **Backend**: FastAPI + MongoDB
- **Game Engine**: Phaser 3.90.0 with Arcade Physics

## User Personas
- Gamers aged 15-35 who enjoy action-platformer RPGs
- Both PC (keyboard) and mobile (touch) players

## What's Been Implemented (Jan 2026)
- Main Menu with dark fantasy castle background
- 7 character classes: Knight, Mage, Assassin, Dark Mage, Soldier, Elite Soldier, Dark Knight
- Character creation with name + class selection
- 3 hand-crafted dungeon levels (Dark Forest, Demon Fortress, Dragon's Lair)
- Phaser.js side-scrolling platformer with physics
- Combat system: melee + ranged attacks, special abilities, dash
- Enemy AI: patrol, chase, attack patterns
- Boss fights with multi-phase mechanics
- HUD: HP/MP/SP bars, gold, kills, XP, boss health bar
- Equipment system with 5 rarity tiers (common/rare/epic/mythic/legendary)
- Item shop with weapons, armor, relics, scrolls
- Inventory with equip/unequip
- XP/leveling with stat point allocation
- Level progression (unlock next level after completing previous)
- Save/load via MongoDB
- Mobile touch controls
- Death/victory overlays with stat tracking
- Leaderboard API

## Prioritized Backlog
### P0
- Sound effects and music (fantasy audio)
- PvP Arena mode

### P1
- Skill tree UI with class-specific abilities
- Moving platforms and breakable platforms
- Secret areas and hidden passages
- Interactive elements (levers, portals)

### P2
- Item upgrading system
- More enemy factions (dragons faction expansion)
- Procedural dungeon variants
- Character animations (sprite sheets vs vector)
- Dynamic 2D lighting effects
