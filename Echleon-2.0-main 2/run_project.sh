#!/bin/bash

echo "Starting EcoSense Project..."

# Activate virtual environment
source venv/bin/activate

# Start backend
echo "Starting backend..."
cd backend
python3 pi_controller.py &

# Wait for backend to boot
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev

wait


