#!/bin/bash

# Apache Superset Installation Script for sg-mern application (Fixed version)
# This script installs Superset in a Python virtual environment

# Exit on error
set -e

# Configuration
SUPERSET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${SUPERSET_HOME}/venv"
CONFIG_DIR="${SUPERSET_HOME}/config"
SUPERSET_PORT=3200
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
ADMIN_EMAIL="admin@example.com"

echo "🚀 Installing Apache Superset..."
echo "📂 Superset home: ${SUPERSET_HOME}"

# Check if Python is installed (preferably 3.9 for best compatibility with Superset)
if ! command -v python3.9 &> /dev/null; then
    echo "⚠️ Python 3.9 not found, checking for Python 3.8..."
    if ! command -v python3.8 &> /dev/null; then
        echo "⚠️ Python 3.8 not found, checking for any Python 3..."
        if ! command -v python3 &> /dev/null; then
            echo "❌ Python 3 is not installed. Please install Python 3.8 or 3.9 for best compatibility."
            echo "💡 On macOS, you can use: brew install python@3.9"
            exit 1
        fi
        PYTHON_CMD="python3"
    else
        PYTHON_CMD="python3.8"
    fi
else
    PYTHON_CMD="python3.9"
fi

PYTHON_VERSION=$(${PYTHON_CMD} --version | cut -d " " -f 2)
PYTHON_MAJOR=$(echo "${PYTHON_VERSION}" | cut -d. -f1)
PYTHON_MINOR=$(echo "${PYTHON_VERSION}" | cut -d. -f2)

if [ "${PYTHON_MAJOR}" -lt 3 ] || ([ "${PYTHON_MAJOR}" -eq 3 ] && [ "${PYTHON_MINOR}" -lt 8 ]); then
    echo "❌ Python 3.8+ is required. Found: Python ${PYTHON_VERSION}"
    exit 1
fi

echo "✅ Python ${PYTHON_VERSION} detected (using ${PYTHON_CMD})"

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi
echo "✅ PostgreSQL is running"

# Get Python command from environment or use default
PYTHON_CMD=${PYTHON_CMD:-python3}
echo "🐍 Using Python command: ${PYTHON_CMD}"

# Create Python virtual environment if it doesn't exist
if [ ! -d "${VENV_DIR}/bin" ]; then
    echo "🔧 Creating Python virtual environment..."
    ${PYTHON_CMD} -m venv "${VENV_DIR}"
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source "${VENV_DIR}/bin/activate"

# Upgrade pip
echo "🔄 Upgrading pip..."
pip install --upgrade pip

# Install Superset dependencies
echo "📦 Installing Superset dependencies..."
pip install wheel setuptools marshmallow-enum

# Install Superset
echo "📦 Installing Apache Superset..."
pip install apache-superset

# Install PostgreSQL driver
echo "📦 Installing PostgreSQL driver..."
pip install psycopg2-binary

# Install JWT dependencies for SSO
echo "📦 Installing JWT dependencies..."
pip install flask-jwt-extended

# Create Superset config file
echo "⚙️ Creating Superset configuration..."
mkdir -p "${CONFIG_DIR}"
cat > "${CONFIG_DIR}/superset_config.py" << EOF
import os
from flask_appbuilder.security.manager import AUTH_DB

# General configurations
SUPERSET_WEBSERVER_PORT = ${SUPERSET_PORT}
SUPERSET_WEBSERVER_TIMEOUT = 300
SECRET_KEY = '${RANDOM}${RANDOM}${RANDOM}'

# Database connection
SQLALCHEMY_DATABASE_URI = 'sqlite:///${SUPERSET_HOME}/superset.db'

# PostgreSQL connection for data source
POSTGRES_DB = {
    'database': 'sg_mern_db',
    'username': 'sg_mern_user',
    'password': 'sg_mern_password',
    'host': 'localhost',
    'port': 5432,
}

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True
# Add endpoints that need to be exempt from CSRF protection
WTF_CSRF_EXEMPT_LIST = []
# A CSRF token that expires in 1 year
WTF_CSRF_TIME_LIMIT = 60 * 60 * 24 * 365

# Set this API key to enable Mapbox visualizations
MAPBOX_API_KEY = ''

# Cache configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 60 * 60 * 24,  # 1 day default (in secs)
}

# Async queries
RESULTS_BACKEND = None

# Authentication configuration - using database authentication for now
AUTH_TYPE = AUTH_DB

# Additional database connections
ADDITIONAL_DATABASES = {
    'sg_mern_db': {
        'sqlalchemy_uri': 'postgresql://sg_mern_user:sg_mern_password@localhost:5432/sg_mern_db',
        'description': 'SG MERN Application Database',
        'allow_file_upload': True
    }
}

# Feature flags
FEATURE_FLAGS = {
    'ENABLE_TEMPLATE_PROCESSING': True,
    'DASHBOARD_NATIVE_FILTERS': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'ALERT_REPORTS': True,
    'DASHBOARD_RBAC': True,
    'ALLOW_CSV_UPLOAD': True,
    'ALLOW_DATA_UPLOADS': True,
}

# Enable file upload for all databases by default
ALLOW_FILE_UPLOAD = True
EOF

echo "✅ Superset configuration created"

# Create gunicorn config
echo "⚙️ Creating gunicorn configuration..."
cat > "${CONFIG_DIR}/gunicorn_config.py" << EOF
import multiprocessing

bind = "0.0.0.0:${SUPERSET_PORT}"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 1000
timeout = 120
keepalive = 5
EOF

echo "✅ Gunicorn configuration created"

# Set Flask environment variables
export FLASK_APP=superset
export SUPERSET_CONFIG_PATH="${CONFIG_DIR}/superset_config.py"

# Initialize Superset
echo "🔧 Initializing Superset..."
superset db upgrade

# Create admin user
echo "👤 Creating admin user..."
superset fab create-admin \
    --username "${ADMIN_USER}" \
    --firstname Admin \
    --lastname User \
    --email "${ADMIN_EMAIL}" \
    --password "${ADMIN_PASSWORD}"

# Initialize roles
echo "🔑 Initializing roles..."
superset init

# Create start script
echo "📝 Creating start script..."
cat > "${SUPERSET_HOME}/start-local-superset.sh" << EOF
#!/bin/bash

# Start Apache Superset
SUPERSET_HOME="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="\${SUPERSET_HOME}/venv"
CONFIG_DIR="\${SUPERSET_HOME}/config"

# Activate virtual environment
source "\${VENV_DIR}/bin/activate"

# Set Superset config path
export FLASK_APP=superset
export SUPERSET_CONFIG_PATH="\${CONFIG_DIR}/superset_config.py"

# Start Superset
echo "🚀 Starting Superset on port ${SUPERSET_PORT}..."
gunicorn -c "\${CONFIG_DIR}/gunicorn_config.py" "superset.app:create_app()"
EOF

chmod +x "${SUPERSET_HOME}/start-local-superset.sh"
echo "✅ Start script created"

# Create stop script
echo "📝 Creating stop script..."
cat > "${SUPERSET_HOME}/stop-local-superset.sh" << EOF
#!/bin/bash

# Stop Apache Superset
echo "🛑 Stopping Superset..."
pkill -f "gunicorn.*superset" || echo "No Superset processes found"
EOF

chmod +x "${SUPERSET_HOME}/stop-local-superset.sh"
echo "✅ Stop script created"

echo "🎉 Apache Superset installation completed!"
echo "📊 To start Superset, run: ${SUPERSET_HOME}/start-local-superset.sh"
echo "🔐 Admin credentials: ${ADMIN_USER} / ${ADMIN_PASSWORD}"
echo "🌐 Once started, access Superset at: http://localhost:${SUPERSET_PORT}"
