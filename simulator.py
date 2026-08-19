import asyncio
import websockets
import json
import random
import time
import math

async def simulate_sensor():
    uri = "ws://localhost:8000/ws/sensor"
    async with websockets.connect(uri) as websocket:
        print("✅ Симулятор підключено до сервера. Передача даних...")
        t = 0
        while True:
            # Імітуємо вібрацію (синусоїда + невеликий шум)
            vibration = math.sin(t) * 15 + random.uniform(-2, 2)
            # Імітуємо рівень звуку в дБ (від 55 до 90)
            sound = 65 + random.uniform(-5, 25)
            
            data = {
                "time": time.strftime("%H:%M:%S"),
                "vibration": round(vibration, 2),
                "sound": round(sound, 2)
            }
            
            await websocket.send(json.dumps(data))
            print(f"Відправлено: {data}")
            
            t += 0.5
            await asyncio.sleep(0.5) # Затримка 0.5 секунди

if __name__ == "__main__":
    asyncio.run(simulate_sensor())