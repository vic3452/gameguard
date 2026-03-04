#!/bin/bash

# Colors
BLUE='\033[0;32m'
RED='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🎮 Starting GameGuard...${NC}"

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Start backend in background
cd ~/gameguard-project/backend
echo -e "${GREEN}Starting backend on port 5000...${NC}"
npm start &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend in background
cd ~/gameguard-project/frontend
echo -e "${GREEN}Starting frontend on port 8000...${NC}"
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ GameGuard is running!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🔗 Frontend: ${CYAN}http://localhost:8000${NC}"
echo -e "🔗 Backend:  ${CYAN}http://localhost:5000${NC}"
echo ""
echo -e "Press ${GREEN}Ctrl+C${NC} to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '\n${CYAN}Stopped GameGuard${NC}'; exit" INT

# Keep script running
wait
