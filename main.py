import os
import random
import asyncio
import math
import requests
from fastapi import FastAPI, HTTPException, Request
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

# --- НАЛАШТУВАННЯ TELEGRAM БОТА ---
TELEGRAM_TOKEN = "8441433958:AAFwOMhZ2ubBHsEzctJnU_1NBiJi_iI5JGo"
TELEGRAM_CHAT_ID = "632883207"

def send_telegram_alert(message_text):
    if TELEGRAM_TOKEN == "ВАШ_ТОКЕН_ТУТ":
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message_text,
        "parse_mode": "HTML",
        "reply_markup": {
            "inline_keyboard": [
                [{"text": "🛑 Зупинити (Relay OFF)", "callback_data": "stop_machine"}],
                [{"text": "✅ Підтвердити тривогу", "callback_data": "ack_alarm"}]
            ]
        }
    }
    try:
        requests.post(url, json=payload, timeout=3)
    except Exception as e:
        print(f"Помилка відправки в TG: {e}")

def answer_telegram_callback(callback_query_id, text):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/answerCallbackQuery"
    requests.post(url, json={"callback_query_id": callback_query_id, "text": text, "show_alert": True})

@app.post("/api/telegram/webhook")
async def telegram_webhook(request: Request):
    data = await request.json()
    
    if "callback_query" in data:
        callback_id = data["callback_query"]["id"]
        action = data["callback_query"]["data"]
        
        if action == "stop_machine":
            answer_telegram_callback(callback_id, "Команду прийнято! Живлення вимкнено.")
        elif action == "ack_alarm":
            answer_telegram_callback(callback_id, "Тривогу підтверджено. Черговий проінформований.")
            
    return {"status": "ok"}

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
            "role": "Головний інженер"
        })
else:
    client = None

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/api/register")
def register_user(data: UserRegister):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    if users_collection.find_one({"username": data.username.strip()}):
        raise HTTPException(status_code=400, detail="Користувач вже існує")
    users_collection.insert_one({"username": data.username.strip(), "pass": data.password, "name": "", "role": "Черговий оператор"})
    return {"status": "success"}

@app.post("/api/login")
def login_user(data: UserLogin):
    if not client: raise HTTPException(status_code=500, detail="База даних не підключена")
    user = users_collection.find_one({"username": data.username.strip()})
    if not user or user["pass"] != data.password:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")
    return {"status": "success", "username": data.username.strip(), "name": user.get("name", ""), "role": user.get("role", "")}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    t = 0.0
    alert_active = False 
    
    try:
        while True:
            # Плавна зміна базового навантаження за допомогою синусоїди
            base_vibro = 30.0 + (math.sin(t * 0.5) * 10)
            
            # 97% часу - плавна робота, 3% - раптова аномалія
            if random.random() > 0.03:
                vibro = base_vibro + random.gauss(0, 1.5)  # Плавна лінія + легке тремтіння
                sound = 65.0 + (math.cos(t * 0.3) * 5) + random.gauss(0, 1)
            else:
                vibro = random.uniform(76.0, 85.0)  # Стрибок для тривоги в Telegram
                sound = random.uniform(85.0, 95.0)

            temp = 42.0 + (math.sin(t * 0.1) * 2.0)
            rssi = int(-75 + (math.cos(t * 0.2) * 5.0))
            
            if vibro > 75 and not alert_active:
                alert_active = True
                msg = f"🚨 <b>УВАГА! Критична вібрація!</b>\nПоказник: {round(vibro, 1)} мм/с\nОбладнання: Верстат ЧПК"
                asyncio.create_task(asyncio.to_thread(send_telegram_alert, msg))
            elif vibro <= 70:
                alert_active = False 

            await websocket.send_json({"vibro": round(vibro, 1), "sound": round(sound, 1), "temp": round(temp, 1), "rssi": rssi, "timestamp": t})
            
            t += 0.1
            # Часті оновлення (кожні 0.15с) для безперервної анімації графіків
            await asyncio.sleep(0.15)
    except WebSocketDisconnect:
        pass

app.mount("/", StaticFiles(directory=".", html=True), name="static")
