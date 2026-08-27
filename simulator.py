import asyncio
import websockets
import json
import random
import time

async def simulate_sensor():
    uri = "ws://localhost:8000/ws/sensor"
    
    # Для плавної зміни базового навантаження
    t = 0.0 
    
    async with websockets.connect(uri) as websocket:
        print("✅ Симулятор підключено до сервера. Передача даних...")
        
        while True:
            # Імітуємо зміну режимів роботи верстата (наприклад, фреза заходить у метал)
            base_load = math.sin(t) * 3 + 15
            
            # 95% часу - нормальна робота верстата
            if random.random() > 0.05:
                # Вібрація: базова лінія + природний механічний шум (розподіл Гауса)
                vibration = abs(random.gauss(base_load, 1.5))
                # Шум верстата: зазвичай тримається в районі 68-73 дБ
                sound = random.gauss(70, 2.0)
            
            # 5% часу - аномалія (вібрація підскакує)
            else:
                print("⚠️ Імітація пікового навантаження (АНОМАЛІЯ)!")
                # Стрибок вібрації вище 75 мм/с (щоб спрацював ваш Telegram-бот)
                vibration = random.uniform(76.0, 85.0)
                # Зростання вібрації супроводжується гучним звуком
                sound = random.uniform(85.0, 95.0)
            
            data = {
                "time": time.strftime("%H:%M:%S"),
                "vibration": round(vibration, 1),
                "sound": round(sound, 1)
            }
            
            await websocket.send(json.dumps(data))
            print(f"Відправлено: {data}")
            
            t += 0.1
            await asyncio.sleep(0.5)  # Затримка 0.5 секунди (2 Гц)

if __name__ == "__main__":
    asyncio.run(simulate_sensor())
