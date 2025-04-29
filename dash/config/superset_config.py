import os
from flask_appbuilder.security.manager import AUTH_DB

# Branding and UI customization
APP_NAME = 'SEEGAP Dashboards'
APP_ICON = '/static/assets/images/logo.svg'
LOGO_TARGET_PATH = '/'
FAVICON = '/static/assets/images/logo.svg'

# Custom CSS for branding
CUSTOM_CSS = '/static/css/custom.css'

# Theme overrides to match SEEGAP application style
THEME_OVERRIDES = {
    'borderRadius': 6,
    'colors': {
        'primary': {
            'base': '#cc0000',  # Primary color from SEEGAP logo (red)
            'dark1': '#a30000',
            'dark2': '#7a0000',
            'light1': '#d63333',
            'light2': '#e06666',
            'light3': '#ea9999',
            'light4': '#f4cccc',
            'light5': '#fae6e6',
        },
        'secondary': {
            'base': '#000000',  # Secondary color from SEEGAP logo (black)
            'dark1': '#000000',
            'dark2': '#000000',
            'light1': '#333333',
            'light2': '#666666',
        },
        'grayscale': {
            'base': '#666666',
            'dark1': '#323232',
            'dark2': '#000000',
            'light1': '#b2b2b2',
            'light2': '#f0f0f0',
            'light3': '#f7f7f7',
            'light4': '#ffffff',
            'light5': '#ffffff',
        },
        'error': {
            'base': '#dc3545',  # Bootstrap danger color
            'dark1': '#b02a37',
            'dark2': '#842029',
            'light1': '#e35d6a',
            'light2': '#ea868f',
        },
        'warning': {
            'base': '#ffc107',  # Bootstrap warning color
            'dark1': '#ffca2c',
            'dark2': '#ffcd39',
            'light1': '#ffda6a',
            'light2': '#ffe69c',
        },
        'success': {
            'base': '#198754',  # Bootstrap success color
            'dark1': '#146c43',
            'dark2': '#0f5132',
            'light1': '#479f76',
            'light2': '#75b798',
        },
        'info': {
            'base': '#0dcaf0',  # Bootstrap info color
            'dark1': '#31d2f2',
            'dark2': '#3dd5f3',
            'light1': '#6edff6',
            'light2': '#9eeaf9',
        }
    },
    'typography': {
        'families': {
            'sansSerif': 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif',
            'serif': 'Georgia, "Times New Roman", Times, serif',
            'monospace': 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
        },
        'weights': {
            'light': 300,
            'normal': 400,
            'bold': 600,
        }
    },
    'zIndex': {
        'max': 1030,
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modalBackdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
    }
}

# General configurations
SUPERSET_WEBSERVER_PORT = 8088
SUPERSET_WEBSERVER_TIMEOUT = 300
SECRET_KEY = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='

# JWT token for async queries - must be at least 32 bytes long
JWT_SECRET_KEY = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY=a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='
ASYNC_QUERIES_JWT_SECRET_KEY = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY=a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='
SUPERSET_JWT_SECRET_KEY = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY=a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='
JWT_TOKEN_SECRET_KEY = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY=a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='

# Database connection
SQLALCHEMY_DATABASE_URI = 'sqlite:////Users/HishamSait/Desktop/SeeGapApp/Clink-SaaS/dash/superset.db'

# PostgreSQL connection for data source
POSTGRES_DB = {
    'database': 'sg_mern_db',
    'username': 'sg_mern_user',
    'password': 'sg_mern_password',
    'host': 'localhost',
    'port': 5432,
}

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = False  # Disable CSRF for testing
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

# Async queries - disable to avoid JWT secret requirement
RESULTS_BACKEND = None
GLOBAL_ASYNC_QUERIES_JWT_SECRET = 'a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY=a0TlbFi8hS8+P+u2GX7u4WqIcFQ1RzYoQ+j7yF5AbTY='

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
    # Core features
    'ENABLE_TEMPLATE_PROCESSING': True,
    'DASHBOARD_NATIVE_FILTERS': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'ALERT_REPORTS': True,
    'DASHBOARD_RBAC': True,
    'ALLOW_CSV_UPLOAD': True,
    'ALLOW_DATA_UPLOADS': True,

    # SQL & Explore
    'ENABLE_EXPLORE_DRAG_AND_DROP': True,
    'ENABLE_ADVANCED_DATA_TYPE': True,
    'ENABLE_TEMPLATE_REMOVE_FILTERS': True,
    'ENABLE_TEMPLATE_PROCESSING_IN_DASHBOARD_FILTERS': True,

    # Reports & Scheduling
    'SCHEDULED_QUERIES': True,  # Disable scheduled queries to avoid JWT requirement

    # Import/Export
    'VERSIONED_EXPORT': True,
    'IMPORT_EXPORT_VIA_DB': True,

    # UI/UX Enhancements
    'ENABLE_REACT_CRUD_VIEWS': True,
    'ENABLE_FAVORITES': True,
    'DISABLE_LEGACY_DATASOURCE_EDITOR': True,
    'ENABLE_DND_WITH_CLICK_UX': True,

    # Security
    'ROW_LEVEL_SECURITY': True,
    'TAGGING_SYSTEM': True,

    # Miscellaneous
    'ENABLE_OMNIBAR': True,
    'DISPLAY_MARKDOWN_HTML': True,
    'GLOBAL_ASYNC_QUERIES': False,  # Disable global async queries
    'EMBEDDED_SUPERSET': True,
    'ENABLE_JAVASCRIPT_CONTROLS': False,  # Use with caution due to security risk
}

# Enable file upload for all databases by default
ALLOW_FILE_UPLOAD = True
