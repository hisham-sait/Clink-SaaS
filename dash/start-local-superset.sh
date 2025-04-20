#!/bin/bash

# Start Apache Superset with Clink SaaS customizations
SUPERSET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${SUPERSET_HOME}/venv"
CONFIG_DIR="${SUPERSET_HOME}/config"
SCRIPTS_DIR="${SUPERSET_HOME}/scripts"

# Default port
PORT=8088

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [-p|--port PORT]"
      exit 1
      ;;
  esac
done

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Error: Port $PORT is already in use."
    echo "You can:"
    echo "  1. Stop the process using port $PORT"
    echo "  2. Use a different port: $0 --port <port_number>"
    echo "  3. Run ./stop-local-superset.sh to stop any running Superset instances"
    exit 1
fi

# Activate virtual environment
source "${VENV_DIR}/bin/activate"

# Set Superset config path
export FLASK_APP=superset
export SUPERSET_CONFIG_PATH="${CONFIG_DIR}/superset_config.py"

# Update port in config file
sed -i.bak "s/SUPERSET_WEBSERVER_PORT = [0-9]*/SUPERSET_WEBSERVER_PORT = $PORT/" "${CONFIG_DIR}/superset_config.py"
sed -i.bak "s/bind = \"0.0.0.0:[0-9]*\"/bind = \"0.0.0.0:$PORT\"/" "${CONFIG_DIR}/gunicorn_config.py"

# Load CSS template if it exists
if [ -f "${SCRIPTS_DIR}/load_css_template.py" ]; then
    echo "📝 Loading Clink Theme CSS template..."
    python "${SCRIPTS_DIR}/load_css_template.py"
fi

# Start Superset
echo "🚀 Starting Superset on port $PORT with Clink SaaS customizations..."
gunicorn -c "${CONFIG_DIR}/gunicorn_config.py" "superset.app:create_app()"
