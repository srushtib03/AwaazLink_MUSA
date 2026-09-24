import cv2
import numpy as np
from gpiozero import PWMOutputDevice, DigitalOutputDevice
import tkinter as tk
from PIL import Image, ImageTk
import time
import threading

# ================= FASTAPI & CORS =================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# 🔥 FIX: Allow React Frontend to access this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEMONSTRATION CONFIGURATION ---
VOLTAGE = 230.0
CURRENT = 5.0
WATTAGE = VOLTAGE * CURRENT
UNIT_PRICE = 1.0

# --- GPIO Setup ---
speed_ctrl = PWMOutputDevice(12)
in1 = DigitalOutputDevice(17)
in2 = DigitalOutputDevice(27)

# --- GLOBAL STATE ---
system_armed = False
background_frame = None
last_motion_time = 0
timeout_seconds = 10

session_start_time = 0
net_spin_start = 0
total_spin_seconds = 0
is_spinning = False

# --- CAMERA ---
cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
cap.set(cv2.CAP_PROP_FPS, 30)

# ================= HARDWARE CONTROL =================
def turn_on_hardware():
    global is_spinning, net_spin_start
    in1.on()
    in2.off()
    speed_ctrl.value = 1.0
    if not is_spinning:
        net_spin_start = time.time()
        is_spinning = True

def turn_off_hardware():
    global is_spinning, total_spin_seconds
    in1.off()
    in2.off()
    speed_ctrl.value = 0
    if is_spinning:
        total_spin_seconds += (time.time() - net_spin_start)
        is_spinning = False

def toggle_system():
    global system_armed, last_motion_time, session_start_time, total_spin_seconds
    if not system_armed:
        system_armed = True
        session_start_time = time.time()
        total_spin_seconds = 0
        last_motion_time = 0
        status_label.config(text="SYSTEM ARMED", fg="blue")
    else:
        system_armed = False
        turn_off_hardware()
        hours = total_spin_seconds / 3600
        units = (WATTAGE * hours) / 1000
        cost = units * UNIT_PRICE
        status_label.config(text=f"TOTAL BILL: Rs. {cost:.4f}", fg="black")
        timer_label.config(text=f"Total Units: {units:.6f} kWh")

# ================= FASTAPI ENDPOINT =================
@app.post("/space")
def space_from_frontend():
    toggle_system()
    return {"armed": system_armed}

def run_api():
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/metrics")
def get_metrics():
    # Calculate live stats for the frontend
    spin_time = total_spin_seconds
    if is_spinning:
        spin_time += (time.time() - net_spin_start)

    hours = spin_time / 3600
    units = (WATTAGE * hours) / 1000
    cost = units * UNIT_PRICE

    power = WATTAGE if is_spinning else 0
    voltage = VOLTAGE # Keep voltage constant for display
    current = power / voltage if voltage else 0

    return {
        "voltage": round(voltage, 1),
        "current": round(current, 4),
        "power": round(power, 2),
        "units": round(units, 6),
        "cost": round(cost, 4),
        "isSpinning": is_spinning,
        "isArmed": system_armed,
        "timestamp": time.strftime("%H:%M:%S")
    }

# ================= TKINTER UI =================
root = tk.Tk()
root.title("MSCB Industrial Demo - High Speed")

video_label = tk.Label(root)
video_label.pack()

motion_label = tk.Label(root, text="NO MOTION", font=("Arial", 20, "bold"), fg="gray")
motion_label.pack(pady=5)

billing_frame = tk.Frame(root, bg="black", padx=10, pady=10)
billing_frame.pack(fill="x")

live_units_label = tk.Label(
    billing_frame, text="Units: 0.000000",
    font=("Courier", 14), fg="lime", bg="black"
)
live_units_label.pack()

live_cost_label = tk.Label(
    billing_frame, text="Cost: Rs. 0.00",
    font=("Courier", 18, "bold"), fg="lime", bg="black"
)
live_cost_label.pack()

status_label = tk.Label(root, text="Waiting for Frontend", font=("Arial", 14), fg="blue")
status_label.pack(pady=10)

timer_label = tk.Label(root, text="", font=("Arial", 12))
timer_label.pack()

# ================= MAIN LOOP =================
def update_frame():
    global background_frame, last_motion_time, total_spin_seconds

    ret, frame = cap.read()
    if ret:
        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (15, 15), 0)

        if background_frame is None:
            background_frame = gray.copy().astype("float")
        else:
            cv2.accumulateWeighted(gray, background_frame, 0.2)
            diff = cv2.absdiff(gray, cv2.convertScaleAbs(background_frame))
            thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1]
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            is_moving = any(cv2.contourArea(c) > 1000 for c in contours)

            if system_armed:
                now = time.time()
                if is_moving:
                    last_motion_time = now
                    motion_label.config(text="MOTION ACTIVE", fg="red")
                    turn_on_hardware()
                else:
                    motion_label.config(text="STILLNESS", fg="gray")
                    if last_motion_time and now - last_motion_time >= timeout_seconds:
                        turn_off_hardware()

                # Update Tkinter labels live
                spin_time = total_spin_seconds
                if is_spinning:
                    spin_time += (time.time() - net_spin_start)

                hours = spin_time / 3600
                units = (WATTAGE * hours) / 1000
                live_units_label.config(text=f"Units: {units:.6f} kWh")
                live_cost_label.config(text=f"Cost: Rs. {units * UNIT_PRICE:.4f}")

        img = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)))
        video_label.imgtk = img
        video_label.config(image=img)

    root.after(15, update_frame)

# ================= START EVERYTHING =================
threading.Thread(target=run_api, daemon=True).start()

root.bind('<Escape>', lambda e: root.destroy())
update_frame()
root.mainloop()

cap.release()
turn_off_hardware()