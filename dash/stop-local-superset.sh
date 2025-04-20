#!/bin/bash

# Stop Apache Superset instances
echo "🛑 Stopping Superset instances..."

# Find and kill all gunicorn processes running Superset
PIDS=$(ps aux | grep "gunicorn.*superset" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ No Superset instances found running."
    exit 0
fi

echo "📋 Found Superset processes with PIDs: $PIDS"
echo "🔄 Stopping processes..."

for PID in $PIDS; do
    echo "  - Stopping process $PID..."
    kill -TERM $PID
    
    # Wait for process to terminate
    for i in {1..5}; do
        if ! ps -p $PID > /dev/null; then
            echo "    ✅ Process $PID stopped."
            break
        fi
        echo "    ⏳ Waiting for process to stop... ($i/5)"
        sleep 1
    done
    
    # Force kill if still running
    if ps -p $PID > /dev/null; then
        echo "    ⚠️ Process $PID still running. Forcing termination..."
        kill -9 $PID
        if ! ps -p $PID > /dev/null; then
            echo "    ✅ Process $PID forcefully stopped."
        else
            echo "    ❌ Failed to stop process $PID. Please stop it manually."
        fi
    fi
done

echo "✅ All Superset instances stopped."
