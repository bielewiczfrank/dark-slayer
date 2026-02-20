from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Character class definitions
CHARACTER_CLASSES = {
    "knight": {
        "name": "Rycerz", "str": 12, "dex": 8, "end": 14, "int": 4, "lck": 7,
        "health": 120, "mana": 30, "stamina": 100, "weapon_type": "sword",
        "description": "Wytrzymaly wojownik z mieczem i tarcza"
    },
    "mage": {
        "name": "Mag", "str": 4, "dex": 6, "end": 6, "int": 16, "lck": 8,
        "health": 70, "mana": 120, "stamina": 60, "weapon_type": "staff",
        "description": "Potezny czarodziej wladajacy zywiolami"
    },
    "assassin": {
        "name": "Zabojca", "str": 8, "dex": 16, "end": 6, "int": 6, "lck": 10,
        "health": 80, "mana": 50, "stamina": 120, "weapon_type": "dagger",
        "description": "Szybki i smiertelny cien nocy"
    },
    "dark_mage": {
        "name": "Czarny Mag", "str": 3, "dex": 5, "end": 5, "int": 18, "lck": 9,
        "health": 60, "mana": 140, "stamina": 50, "weapon_type": "wand",
        "description": "Mistrz mrocznych sztuk i zakazanej magii"
    },
    "soldier": {
        "name": "Zolnierz", "str": 14, "dex": 7, "end": 12, "int": 3, "lck": 6,
        "health": 130, "mana": 20, "stamina": 110, "weapon_type": "spear",
        "description": "Doswiadczony weteran wielu bitew"
    },
    "elite_soldier": {
        "name": "Elitarny Zolnierz", "str": 13, "dex": 10, "end": 11, "int": 5, "lck": 8,
        "health": 110, "mana": 40, "stamina": 100, "weapon_type": "crossbow",
        "description": "Najlepszy z najlepszych, mistrz taktyki"
    },
    "dark_knight": {
        "name": "Ciemny Rycerz", "str": 15, "dex": 6, "end": 13, "int": 8, "lck": 5,
        "health": 140, "mana": 60, "stamina": 90, "weapon_type": "greatsword",
        "description": "Rycerz pochloniety przez mrok"
    }
}

SHOP_ITEMS = [
    {"id": "w1", "name": "Zelazny Miecz", "type": "weapon", "weapon_type": "sword", "rarity": "common", "stats": {"attack": 8, "defense": 0, "magic": 0, "speed": 0}, "level_req": 1, "price": 100, "description": "Prosty, ale solidny miecz"},
    {"id": "w2", "name": "Stalowy Topor", "type": "weapon", "weapon_type": "axe", "rarity": "common", "stats": {"attack": 10, "defense": 0, "magic": 0, "speed": -1}, "level_req": 1, "price": 120, "description": "Ciezki topor zadajacy potezne ciosy"},
    {"id": "w3", "name": "Debowy Kostur", "type": "weapon", "weapon_type": "staff", "rarity": "common", "stats": {"attack": 4, "defense": 0, "magic": 8, "speed": 0}, "level_req": 1, "price": 80, "description": "Kostur wzmacniajacy magie"},
    {"id": "w4", "name": "Luk Lowcy", "type": "weapon", "weapon_type": "bow", "rarity": "common", "stats": {"attack": 7, "defense": 0, "magic": 0, "speed": 2}, "level_req": 1, "price": 90, "description": "Szybki i celny luk"},
    {"id": "w5", "name": "Sztylet Cienia", "type": "weapon", "weapon_type": "dagger", "rarity": "rare", "stats": {"attack": 12, "defense": 0, "magic": 0, "speed": 4}, "level_req": 3, "price": 300, "description": "Sztylet przesiakni?ty ciemnoscia"},
    {"id": "w6", "name": "Ognisty Miecz", "type": "weapon", "weapon_type": "sword", "rarity": "rare", "stats": {"attack": 16, "defense": 2, "magic": 4, "speed": 0}, "level_req": 3, "price": 350, "description": "Miecz plonacy wiecznym ogniem"},
    {"id": "w7", "name": "Mlot Gromu", "type": "weapon", "weapon_type": "hammer", "rarity": "epic", "stats": {"attack": 24, "defense": 4, "magic": 6, "speed": -2}, "level_req": 5, "price": 800, "description": "Mlot przyzywajacy blyskawice"},
    {"id": "w8", "name": "Rozdzka Mrozu", "type": "weapon", "weapon_type": "wand", "rarity": "epic", "stats": {"attack": 8, "defense": 0, "magic": 22, "speed": 2}, "level_req": 5, "price": 750, "description": "Rozdzka zamrazajaca wrogow"},
    {"id": "w9", "name": "Wlocznia Pustki", "type": "weapon", "weapon_type": "spear", "rarity": "mythic", "stats": {"attack": 30, "defense": 6, "magic": 10, "speed": 0}, "level_req": 7, "price": 1500, "description": "Wlocznia wykuta w otchlani"},
    {"id": "w11", "name": "All Seeing Sword", "type": "weapon", "weapon_type": "sword", "rarity": "mythic", "stats": {"attack": 50, "defense": 15, "magic": 0, "speed": 2, "health_bonus": 10}, "level_req": 7, "price": 1800, "description": "Miecz ktory widzi wszystko"},
    {"id": "a7", "name": "Warden of Demons Armour", "type": "armor", "rarity": "mythic", "stats": {"attack": 15, "defense": 0, "magic": 0, "speed": 5}, "level_req": 7, "price": 2000, "description": "Zbroja straznika demonow"},
    {"id": "w10", "name": "Smoczobjca", "type": "weapon", "weapon_type": "sword", "rarity": "legendary", "stats": {"attack": 40, "defense": 8, "magic": 12, "speed": 3}, "level_req": 10, "price": 3000, "description": "Legendarny miecz zabojcow smokow"},
    {"id": "a1", "name": "Skorzana Zbroja", "type": "armor", "rarity": "common", "stats": {"attack": 0, "defense": 6, "magic": 0, "speed": 0}, "level_req": 1, "price": 80, "description": "Lekka zbroja ze skorki"},
    {"id": "a2", "name": "Kolczuga", "type": "armor", "rarity": "common", "stats": {"attack": 0, "defense": 10, "magic": 0, "speed": -1}, "level_req": 1, "price": 150, "description": "Solidna kolczuga stalowa"},
    {"id": "a3", "name": "Plyta Stalowa", "type": "armor", "rarity": "rare", "stats": {"attack": 0, "defense": 18, "magic": 0, "speed": -2}, "level_req": 3, "price": 400, "description": "Ciezka zbroja platowa"},
    {"id": "a4", "name": "Plaszcz Cienia", "type": "armor", "rarity": "rare", "stats": {"attack": 0, "defense": 10, "magic": 6, "speed": 3}, "level_req": 3, "price": 350, "description": "Plaszcz ukrywajacy wlasciciela"},
    {"id": "a5", "name": "Skora Demona", "type": "armor", "rarity": "epic", "stats": {"attack": 4, "defense": 22, "magic": 8, "speed": 0}, "level_req": 5, "price": 900, "description": "Zbroja z demonskiej skory"},
    {"id": "a6", "name": "Luska Smoka", "type": "armor", "rarity": "legendary", "stats": {"attack": 6, "defense": 35, "magic": 10, "speed": -1}, "level_req": 10, "price": 2500, "description": "Zbroja ze smoczych lusek"},
    {"id": "r1", "name": "Amulet Zdrowia", "type": "relic", "rarity": "common", "stats": {"attack": 0, "defense": 2, "magic": 0, "speed": 0, "health_bonus": 20}, "level_req": 1, "price": 100, "description": "Zwieksza maksymalne zdrowie"},
    {"id": "r2", "name": "Pierscień Many", "type": "relic", "rarity": "common", "stats": {"attack": 0, "defense": 0, "magic": 4, "speed": 0, "mana_bonus": 20}, "level_req": 1, "price": 100, "description": "Zwieksza maksymalna mane"},
    {"id": "r3", "name": "Pas Wytrzymalosci", "type": "relic", "rarity": "rare", "stats": {"attack": 0, "defense": 4, "magic": 0, "speed": 1, "stamina_bonus": 30}, "level_req": 3, "price": 300, "description": "Zwieksza wytrzymalosc"},
    {"id": "r4", "name": "Relikwia Mocy", "type": "relic", "rarity": "legendary", "stats": {"attack": 10, "defense": 8, "magic": 10, "speed": 2}, "level_req": 8, "price": 2000, "description": "Pradawna relikwia nieskonczonej mocy"},
    {"id": "s1", "name": "Zwoj Leczenia", "type": "scroll", "rarity": "common", "stats": {"heal": 30}, "level_req": 1, "price": 50, "description": "Przywraca 30 punktow zdrowia", "consumable": True},
    {"id": "s2", "name": "Zwoj Kuli Ognia", "type": "scroll", "rarity": "rare", "stats": {"damage": 40}, "level_req": 3, "price": 200, "description": "Zadaje 40 obrazen ognia", "consumable": True},
    {"id": "s3", "name": "Zwoj Blyskawicy", "type": "scroll", "rarity": "epic", "stats": {"damage": 80}, "level_req": 5, "price": 500, "description": "Potezna blyskawica raz?ca wrogow", "consumable": True},
    {"id": "w12", "name": "Broń Michała", "type": "weapon", "weapon_type": "sword", "rarity": "legendary", "stats": {"attack": 20, "defense": 5, "magic": 1, "speed": 3, "health_bonus": 20}, "level_req": 1, "price": 1, "description": "Tani miecz Michała"},
]


class CharacterCreate(BaseModel):
    name: str
    class_type: str


class CharacterUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    gold: Optional[int] = None
    xp: Optional[int] = None
    level: Optional[int] = None
    health: Optional[int] = None
    max_health: Optional[int] = None
    mana: Optional[int] = None
    max_mana: Optional[int] = None
    stamina: Optional[int] = None
    max_stamina: Optional[int] = None
    stats: Optional[Dict[str, int]] = None
    stat_points: Optional[int] = None
    equipment: Optional[Dict[str, Any]] = None
    inventory: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    completed_levels: Optional[List[int]] = None
    kills: Optional[int] = None
    deaths: Optional[int] = None


class ShopBuy(BaseModel):
    character_id: str
    item_id: str


class EquipItem(BaseModel):
    inventory_index: int
    slot: str


class LevelUpRequest(BaseModel):
    stat: str


@api_router.get("/")
async def root():
    return {"message": "Dark Realms API"}


@api_router.get("/classes")
async def get_classes():
    return CHARACTER_CLASSES


@api_router.post("/characters")
async def create_character(data: CharacterCreate):
    if data.class_type not in CHARACTER_CLASSES:
        raise HTTPException(status_code=400, detail="Invalid class type")

    cls = CHARACTER_CLASSES[data.class_type]
    character = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "class_type": data.class_type,
        "level": 1,
        "xp": 0,
        "xp_to_next": 100,
        "stats": {
            "str": cls["str"], "dex": cls["dex"], "end": cls["end"],
            "int": cls["int"], "lck": cls["lck"]
        },
        "stat_points": 0,
        "health": cls["health"],
        "max_health": cls["health"],
        "mana": cls["mana"],
        "max_mana": cls["mana"],
        "stamina": cls["stamina"],
        "max_stamina": cls["stamina"],
        "gold": 200,
        "equipment": {"weapon": None, "armor": None, "relic": None, "scroll": None},
        "inventory": [],
        "skills": [],
        "completed_levels": [],
        "kills": 0,
        "deaths": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.characters.insert_one({**character, "_id": character["id"]})
    return character


@api_router.get("/characters")
async def list_characters():
    chars = await db.characters.find({}, {"_id": 0}).to_list(100)
    return chars


@api_router.get("/characters/{character_id}")
async def get_character(character_id: str):
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return char


@api_router.put("/characters/{character_id}")
async def update_character(character_id: str, data: CharacterUpdate):
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        return char

    await db.characters.update_one({"id": character_id}, {"$set": update_data})
    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return updated


@api_router.get("/items")
async def list_items():
    return SHOP_ITEMS


@api_router.get("/shop")
async def get_shop_items(level: int = 1):
    available = [item for item in SHOP_ITEMS if item["level_req"] <= level + 2]
    return available


@api_router.post("/shop/buy")
async def buy_item(data: ShopBuy):
    char = await db.characters.find_one({"id": data.character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    item = next((i for i in SHOP_ITEMS if i["id"] == data.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if char["gold"] < item["price"]:
        raise HTTPException(status_code=400, detail="Not enough gold")

    if char["level"] < item["level_req"]:
        raise HTTPException(status_code=400, detail="Level requirement not met")

    new_gold = char["gold"] - item["price"]
    new_inventory = char.get("inventory", []) + [item]

    await db.characters.update_one(
        {"id": data.character_id},
        {"$set": {"gold": new_gold, "inventory": new_inventory}}
    )

    updated = await db.characters.find_one({"id": data.character_id}, {"_id": 0})
    return updated


@api_router.post("/characters/{character_id}/equip")
async def equip_item(character_id: str, data: EquipItem):
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    inventory = char.get("inventory", [])
    if data.inventory_index < 0 or data.inventory_index >= len(inventory):
        raise HTTPException(status_code=400, detail="Invalid inventory index")

    if data.slot not in ["weapon", "armor", "relic", "scroll"]:
        raise HTTPException(status_code=400, detail="Invalid equipment slot")

    item = inventory[data.inventory_index]
    equipment = char.get("equipment", {"weapon": None, "armor": None, "relic": None, "scroll": None})

    old_item = equipment.get(data.slot)
    equipment[data.slot] = item
    new_inventory = [i for idx, i in enumerate(inventory) if idx != data.inventory_index]
    if old_item:
        new_inventory.append(old_item)

    await db.characters.update_one(
        {"id": character_id},
        {"$set": {"equipment": equipment, "inventory": new_inventory}}
    )

    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return updated


@api_router.post("/characters/{character_id}/unequip")
async def unequip_item(character_id: str, data: dict):
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    slot = data.get("slot")
    if slot not in ["weapon", "armor", "relic", "scroll"]:
        raise HTTPException(status_code=400, detail="Invalid slot")

    equipment = char.get("equipment", {})
    item = equipment.get(slot)
    if not item:
        raise HTTPException(status_code=400, detail="Slot is empty")

    equipment[slot] = None
    new_inventory = char.get("inventory", []) + [item]

    await db.characters.update_one(
        {"id": character_id},
        {"$set": {"equipment": equipment, "inventory": new_inventory}}
    )

    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return updated


@api_router.post("/characters/{character_id}/levelup")
async def level_up(character_id: str, data: LevelUpRequest):
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    if char.get("stat_points", 0) <= 0:
        raise HTTPException(status_code=400, detail="No stat points available")

    if data.stat not in ["str", "dex", "end", "int", "lck"]:
        raise HTTPException(status_code=400, detail="Invalid stat")

    stats = char["stats"]
    stats[data.stat] += 1

    updates = {
        "stats": stats,
        "stat_points": char["stat_points"] - 1
    }

    if data.stat == "end":
        updates["max_health"] = char["max_health"] + 5
        updates["health"] = min(char["health"] + 5, char["max_health"] + 5)
        updates["max_stamina"] = char["max_stamina"] + 3
    elif data.stat == "int":
        updates["max_mana"] = char["max_mana"] + 5

    await db.characters.update_one({"id": character_id}, {"$set": updates})
    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return updated


@api_router.post("/game/complete-level")
async def complete_level(data: dict):
    character_id = data.get("character_id")
    level_id = data.get("level_id")
    xp_gained = data.get("xp_gained", 0)
    gold_gained = data.get("gold_gained", 0)
    kills = data.get("kills", 0)

    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    new_xp = char["xp"] + xp_gained
    new_gold = char["gold"] + gold_gained
    new_kills = char["kills"] + kills
    completed = list(set(char.get("completed_levels", []) + [level_id]))

    new_level = char["level"]
    new_stat_points = char.get("stat_points", 0)
    xp_to_next = char["xp_to_next"]

    while new_xp >= xp_to_next:
        new_xp -= xp_to_next
        new_level += 1
        new_stat_points += 3
        xp_to_next = new_level * 100

    updates = {
        "xp": new_xp,
        "xp_to_next": xp_to_next,
        "gold": new_gold,
        "kills": new_kills,
        "completed_levels": completed,
        "level": new_level,
        "stat_points": new_stat_points,
        "health": char["max_health"],
        "mana": char["max_mana"],
        "stamina": char["max_stamina"],
    }

    await db.characters.update_one({"id": character_id}, {"$set": updates})
    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return {"character": updated, "leveled_up": new_level > char["level"]}


@api_router.post("/game/player-death")
async def player_death(data: dict):
    character_id = data.get("character_id")
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    gold_penalty = max(0, int(char["gold"] * 0.1))
    await db.characters.update_one(
        {"id": character_id},
        {"$set": {
            "deaths": char["deaths"] + 1,
            "gold": char["gold"] - gold_penalty,
            "health": char["max_health"],
            "mana": char["max_mana"],
            "stamina": char["max_stamina"],
        }}
    )
    updated = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return {"character": updated, "gold_lost": gold_penalty}


@api_router.get("/leaderboard")
async def get_leaderboard():
    chars = await db.characters.find(
        {}, {"_id": 0, "id": 1, "name": 1, "class_type": 1, "level": 1, "kills": 1, "completed_levels": 1}
    ).sort([("level", -1), ("kills", -1)]).to_list(20)
    return chars


@api_router.delete("/characters/{character_id}")
async def delete_character(character_id: str):
    result = await db.characters.delete_one({"id": character_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"deleted": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
