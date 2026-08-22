import os
import random
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.websockets import WebSocket, WebSocketDisconnect
from pymongo import MongoClient

app = FastAPI(title="Enterprise IoT SCADA Backend")

# Дозволяємо доступ з будь-яких пристроїв
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ПІДКЛЮЧЕННЯ ДО MONGODB ---
MONGO_URL = os.getenv("MONGO_URL")

if MONGO_URL:
    client = MongoClient(MONGO_URL)
    db = client["scada_database"] # Назва нашої бази даних
    users_collection = db["users"] # Назва "таблиці" (колекції)
    
    # Якщо база порожня, створюємо системного адміна
    if not users_collection.find_one({"username": "admin"}):
        users_collection.insert_one({
            "username": "admin",
            "pass": "admin",
            "name": "Системний Admin",
            "role": "Головний інженер",
            "tfa": False
        })
else:
    client = None
    print("УВАГА: MONGO_URL не знайдено в налаштуваннях!")

# --- МОДЕЛІ ДАНИХ ---
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfileUpdate(BaseModel):
    username: str
    name: str
    role: str

# --- API РЕЄСТРАЦІЇ ---
@app.post("/api/register")
def register_user(data: UserRegister):
    if not client:
        raise HTTPException(status_code=500, detail="База даних не підключена")

    username = data.username.strip()
    
    # Перевіряємо, чи є вже такий користувач у MongoDB
    if users_collection.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Користувач вже існує")
    
    # Записуємо нового користувача в хмару
    users_collection.insert_one({
        "username": username,
        "pass": data.password,
        "name": "",
        "role": "Черговий оператор",
        "tfa": False
    })
    return {"status": "success", "message": "Акаунт створено"}

# --- API ВХОДУ ---
@app.post("/api/login")
def login_user(data: UserLogin):
    if not client:
        raise HTTPException(status_code=500, detail="База даних не підключена")

    username = data.username.strip()
    
    # Шукаємо користувача в MongoDB
    user = users_collection.find_one({"username": username})
    
    if not user or user["pass"] != data.password:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")
    
    return {
        "status": "success",
        "username": username,
        "name": user.get("name", username) or username,
        "role": user.get("role", "Черговий оператор"),
        "tfa": user.get("tfa", False)
    }

# --- API ОНОВЛЕННЯ ПРОФІЛЮ ---
@app.post("/api/profile")
def update_profile(data: UserProfileUpdate):
    if not client:
        raise HTTPException(status_code=500, detail="База даних не підключена")

    # Оновлюємо дані конкретного користувача
    result = users_collection.update_one(
        {"username": data.username},
        {"$set": {"name": data.name, "role": data.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    return {"status": "success"}

# --- WEBSOCKET ДЛЯ ДАТЧІКІВ ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    t = 0.0
    try:
        while True:
            vibro = abs(random.gauss(30, 5) if random.random() > 0.1 else random.uniform(50, 85))
            sound = 65 + (random.random() * 15)
            temp = 42.0 + (random.random() * 1.5)
            rssi = int(-75 + (random.random() * 15))
            
            payload = {
                "vibro": round(vibro, 1),
                "sound": round(sound, 1),
                "temp": round(temp, 1),
                "rssi": rssi,
                "timestamp": t
            }
            await websocket.send_json(payload)
            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        pass

# Роздача статичних файлів HTML/CSS/JS
app.mount("/", StaticFiles(directory=".", html=True), name="static")
