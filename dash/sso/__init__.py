"""
Single Sign-On (SSO) Package for Apache Superset
This package provides JWT-based authentication and user synchronization
between the main application and Superset.
"""

from .jwt_provider import SGMernJwtSecurityManager, setup_jwt_auth
from .user_sync import UserSyncManager, create_superset_token, get_superset_login_url

__all__ = [
    'SGMernJwtSecurityManager',
    'setup_jwt_auth',
    'UserSyncManager',
    'create_superset_token',
    'get_superset_login_url'
]
