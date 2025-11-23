#!/bin/bash

# 1. Install Node.js if missing (RunPod resets system packages on restart)
if ! command -v npm &> /dev/null
then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# 2. Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# 3. Install Frontend Dependencies
echo "Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo "---------------------------------------------------"
echo "Setup Complete!"
echo "---------------------------------------------------"
echo "To start the App, open two terminals:"
echo "1. Backend: cd backend && uvicorn main:app --host 0.0.0.0 --port 8000"
echo "2. Frontend: cd frontend && npm run dev -- --host"
