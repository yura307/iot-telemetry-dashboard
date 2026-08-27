import os
import random
import asyncio
import pyotp
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.websockets import WebSocket, WebSocketDisconnect
from pymongo import MongoClient

app = FastAPI(title="Enterprise IoT SCADA Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL")

if MONGO_URL:
    client = MongoClient(MONGO_URL)
    db = client["scada_database"]
    users_collection = db["users"]
    
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

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    tfa_code: Optional[str] = None

class UserProfileUpdate(BaseModel):
    username: str
    name: str
    role: str

class TFAVerify(BaseModel):
    username: str
    code: str

class TFADisable(BaseModel):
    username: str

@app.post("/api/register")
def register_user(data: UserRegister):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    username = data.username.strip()
    if users_collection.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Користувач вже існує")
    
    users_collection.insert_one({
        "username": username,
        "pass": data.password,
        "name": "",
        "role": "Черговий оператор",
        "tfa": False
    })
    return {"status": "success"}

@app.post("/api/login")
def login_user(data: UserLogin):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    username = data.username.strip()
    user = users_collection.find_one({"username": username})
    
    if not user or user["pass"] != data.password:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")
    
    if user.get("tfa"):
        if not data.tfa_code:
            return {"status": "tfa_required"}
        
        totp = pyotp.TOTP(user["tfa_secret"])
        # ТУТ ДОДАНО valid_window=2 (сервер прощає розсинхрон часу ±1 хв)
        if not totp.verify(data.tfa_code, valid_window=2):
            raise HTTPException(status_code=401, detail="Невірний код 2FA")
    
    return {
        "status": "success",
        "username": username,
        "name": user.get("name", username) or username,
        "role": user.get("role", "Черговий оператор"),
        "tfa": user.get("tfa", False)
    }

@app.post("/api/profile")
def update_profile(data: UserProfileUpdate):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    result = users_collection.update_one(
        {"username": data.username},
        {"$set": {"name": data.name, "role": data.role}}
    )
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="Користувача не знайдено")
    return {"status": "success"}

@app.get("/api/2fa/setup")
def setup_2fa(username: str):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    secret = pyotp.random_base32()
    users_collection.update_one({"username": username}, {"$set": {"tfa_secret": secret}})
    
    # ТУТ ЗМІНЕНО: Прибрали номер телефону. Тепер назва стандартизована.
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name="Operator", issuer_name="SCADA System")
    return {"secret": secret, "uri": uri}

@app.post("/api/2fa/verify")
def verify_2fa(data: TFAVerify):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    user = users_collection.find_one({"username": data.username})
    
    if not user or "tfa_secret" not in user:
        raise HTTPException(status_code=400, detail="Немає секретного ключа")
        
    totp = pyotp.TOTP(user["tfa_secret"])
    # ТУТ ДОДАНО valid_window=2 (сервер прощає розсинхрон часу ±1 хв)
    if totp.verify(data.code, valid_window=2):
        users_collection.update_one({"username": data.username}, {"$set": {"tfa": True}})
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Невірний код")

@app.post("/api/2fa/disable")
def disable_2fa(data: TFADisable):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    users_collection.update_one({"username": data.username}, {"$set": {"tfa": False}})
    return {"status": "success"}

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
            await websocket.send_json({"vibro": round(vibro, 1), "sound": round(sound, 1), "temp": round(temp, 1), "rssi": rssi, "timestamp": t})
            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        pass

app.mount("/", StaticFiles(directory=".", html=True), name="static")
