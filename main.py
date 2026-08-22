import random
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.websockets import WebSocket, WebSocketDisconnect

app = FastAPI(title="Enterprise IoT SCADA Backend")

# Дозволяємо доступ з будь-яких пристроїв
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Проста база даних у пам'яті
users_db = {
    "admin": {
        "pass": "admin",
        "name": "Системний Admin",
        "role": "Головний інженер",
        "tfa": False
    }
}

# --- ВИПРАВЛЕНІ МОДЕЛІ ДАНИХ ---
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

@app.post("/api/register")
def register_user(data: UserRegister):
    username = data.username.strip()
    if username in users_db:
        raise HTTPException(status_code=400, detail="Користувач вже існує")
    
    users_db[username] = {
        "pass": data.password,
        "name": "",
        "role": "Черговий оператор",
        "tfa": False
    }
    return {"status": "success", "message": "Акаунт створено"}

@app.post("/api/login")
def login_user(data: UserLogin):
    username = data.username.strip()
    user = users_db.get(username)
    
    if not user or user["pass"] != data.password:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")
    
    return {
        "status": "success",
        "username": username,
        "name": user["name"] or username,
        "role": user["role"],
        "tfa": user["tfa"]
    }

@app.post("/api/profile")
def update_profile(data: UserProfileUpdate):
    user = users_db.get(data.username)
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    user["name"] = data.name
    user["role"] = data.role
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

# Цей рядок роздає ваші HTML та CSS файли
app.mount("/", StaticFiles(directory=".", html=True), name="static")
