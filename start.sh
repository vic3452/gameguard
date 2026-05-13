#!/bin/bash

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🎮 Starting GameGuard...${NC}"

# Get the script's directory for relative paths
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend in background
cd "$DIR/backend"
echo -e "${GREEN}Installing backend dependencies...${NC}"
npm install --silent
echo -e "${GREEN}Starting backend (MongoDB version) on port 5000...${NC}"
npm start &
BACKEND_PID=$!

# Wait a bit for backend to start (give extra time for DB connection)
sleep 5

# Start frontend in background (Vite)
cd "$DIR/frontend"
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install --silent
echo -e "${GREEN}Starting frontend on port 3000...${NC}"
npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ GameGuard is running!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🔗 Frontend: ${CYAN}http://localhost:3000${NC}"
echo -e "🔗 Backend:  ${CYAN}http://localhost:5000/api${NC}"
echo ""
echo -e "Press ${GREEN}Ctrl+C${NC} to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '\n${CYAN}Stopped GameGuard${NC}'; exit" INT

# Keep script running
wait
