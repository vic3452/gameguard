# Multi-stage Dockerfile for GameGuard Production
# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/

# Copy frontend build to backend/public for serving or keep separate
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 5000
WORKDIR /app/backend
CMD ["node", "src/server.js"]
