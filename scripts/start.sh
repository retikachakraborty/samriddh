#!/usr/bin/env bash
set -e

# ==============================================================================
# SAMRIDDH UNIFIED SINGLE-COMMAND STARTUP SCRIPT
# Starts both FastAPI Backend (port 8000) and Vite Frontend (port 5173).
# Connects to the remote Supabase database.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# Print banner
echo ""
echo "================================================================"
echo "  ✦  SAMRIDDH — Executive Business Intelligence & Analytics"
echo "================================================================"
echo ""

# 1. Check Python Virtual Environment
if [ -d "$ROOT_DIR/.venv" ]; then
    PYTHON_EXEC="$ROOT_DIR/.venv/bin/python"
elif command -v python3 &>/dev/null; then
    PYTHON_EXEC="$(command -v python3)"
else
    echo "❌ Error: Python 3 was not found. Please ensure Python is installed."
    exit 1
fi

echo "✓ Python environment: $PYTHON_EXEC"

# 2. Check Node & npm
if ! command -v npm &>/dev/null; then
    echo "❌ Error: npm is not installed or not in PATH."
    exit 1
fi
echo "✓ Node/npm environment: $(npm -v)"

# 3. Check .env configuration
if [ ! -f "$ROOT_DIR/.env" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
        echo "⚠️  .env not found. Copying .env.example..."
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    else
        echo "❌ Error: .env file missing in project root."
        exit 1
    fi
fi
echo "✓ Remote Supabase configuration loaded"

# 4. Cleanup on Exit / Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down Samriddh services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "✓ All services stopped cleanly."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 5. Start FastAPI Backend in background
echo ""
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000..."
(
    cd "$ROOT_DIR/backend"
    "$PYTHON_EXEC" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) &
BACKEND_PID=$!

# Wait for backend health check
echo -n "   Waiting for backend to become ready"
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
        echo " [READY]"
        break
    fi
    echo -n "."
    sleep 0.5
done

# 6. Start Vite Frontend in background
echo ""
echo "🎨 Starting Vite Frontend on http://localhost:5173..."
(
    cd "$ROOT_DIR/frontend"
    npm run dev -- --host 127.0.0.1 --port 5173
) &
FRONTEND_PID=$!

# Wait briefly for frontend
sleep 1.5

echo ""
echo "================================================================"
echo "  ✦  SAMRIDDH IS READY"
echo "================================================================"
echo ""
echo "  🌐 Frontend Application : http://localhost:5173"
echo "  ⚡ FastAPI Backend API   : http://127.0.0.1:8000"
echo "  📚 API Documentation    : http://127.0.0.1:8000/docs"
echo "  📊 Database              : Remote Supabase (0.23 GB Connected)"
echo "  🔑 1-Click Demo Login   : executive@samriddh.com (Real Supabase Auth)"
echo ""
echo "  Press Ctrl+C at any time to shut down both services."
echo "================================================================"
echo ""

# Keep running until Ctrl+C
wait
