import os
from flask_appbuilder.security.manager import AUTH_DB

# Branding and UI customization
APP_NAME = 'BI Engine'
APP_ICON = '/static/assets/custom/images/logo.svg'
LOGO_TARGET_PATH = '/'
FAVICON = '/static/assets/custom/images/logo.svg'

# Custom CSS for branding
CUSTOM_CSS = '/static/assets/custom/css/custom.css'

# Theme overrides to match BI Engine application style
THEME_OVERRIDES = {
    'borderRadius': 6,
    'colors': {
        'primary': {
            'base': '#0066cc',  # Primary color for BI Engine (blue)
            'dark1': '#0052a3',
            'dark2': '#003d7a',
            'light1': '#3385d6',
            'light2': '#66a3e0',
            'light3': '#99c2eb',
            'light4': '#cce0f5',
            'light5': '#e6f0fa',
        },
        'secondary': {
            'base': '#333333',  # Secondary color for BI Engine (dark gray)
            'dark1': '#1a1a1a',
            'dark2': '#000000',
            'light1': '#666666',
            'light2': '#999999',
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
SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'biengine_secret_key')

# JWT token for async queries - must be at least 32 bytes long
JWT_SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2"
ASYNC_QUERIES_JWT_SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2"
SUPERSET_JWT_SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2"
JWT_TOKEN_SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2"

# Database connection
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'SUPERSET_SQLALCHEMY_DATABASE_URI', 
    'postgresql://postgres:postgres@db:5432/postgres'
)

# Wait for database to be ready
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "connect_args": {
        "connect_timeout": 60,
    },
}

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
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 60 * 60 * 24,  # 1 day default (in secs)
    'CACHE_KEY_PREFIX': 'biengine_',
    'CACHE_REDIS_URL': 'redis://redis:6379/0',
}

# Results backend for async queries
RESULTS_BACKEND = {
    'CACHE_TYPE': 'RedisCache',
    'CACHE_KEY_PREFIX': 'biengine_results_',
    'CACHE_REDIS_URL': 'redis://redis:6379/1',
}

# Celery configuration
class CeleryConfig:
    BROKER_URL = 'redis://redis:6379/0'
    CELERY_IMPORTS = ('superset.sql_lab', 'superset.tasks')
    CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
    CELERYD_LOG_LEVEL = 'DEBUG'
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 120,
            'soft_time_limit': 150,
            'ignore_result': True,
        },
    }
    CELERYBEAT_SCHEDULE = {
        'email_reports.schedule_hourly': {
            'task': 'email_reports.schedule_hourly',
            'schedule': 3600,
        },
    }

CELERY_CONFIG = CeleryConfig

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
    'SCHEDULED_QUERIES': True,

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
    'GLOBAL_ASYNC_QUERIES': True,
    'EMBEDDED_SUPERSET': True,
    'ENABLE_JAVASCRIPT_CONTROLS': False,  # Use with caution due to security risk
}

# Enable file upload for all databases by default
ALLOW_FILE_UPLOAD = True
