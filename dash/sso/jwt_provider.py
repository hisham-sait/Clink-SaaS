"""
JWT Authentication Provider for Apache Superset
This module provides JWT-based authentication for Superset, enabling SSO with the main application.
"""

import logging
from flask import request, g, redirect, url_for
from flask_appbuilder.security.views import AuthDBView
from flask_jwt_extended import decode_token
from flask_login import login_user
from superset.security import SupersetSecurityManager

# Define AUTH_JWT constant since it might not be available in this version
AUTH_JWT = 'jwt'

logger = logging.getLogger(__name__)

class SGMernJwtSecurityManager(SupersetSecurityManager):
    """
    Custom security manager that extends Superset's security manager
    to provide JWT-based authentication and role mapping.
    """
    
    def __init__(self, appbuilder):
        super().__init__(appbuilder)
        # Map of application roles to Superset roles
        self.role_mapping = {
            'super_admin': 'Admin',
            'platform_admin': 'Alpha',
            'company_owner': 'Alpha',
            'company_admin': 'Alpha',
            'company_manager': 'Gamma',
            'company_user': 'Gamma',
            'company_viewer': 'Public',
        }
        
        # Override the auth views
        self.authdbview = SGMernAuthDBView

    def auth_user_jwt(self, token):
        """
        Verify the JWT token and authenticate the user.
        
        Args:
            token: The JWT token
            
        Returns:
            The authenticated user or None if authentication fails
        """
        try:
            # Decode the token
            data = decode_token(token)
            user_id = data.get('id')
            
            if not user_id:
                logger.error("JWT token does not contain user ID")
                return None
            
            # Get user info from the token
            email = data.get('email', f"user_{user_id}@example.com")
            first_name = data.get('firstName', 'User')
            last_name = data.get('lastName', str(user_id))
            role = data.get('role', 'company_user')
            company_id = data.get('companyId')
            
            # Find or create the user
            user = self.find_user(email=email)
            
            if not user:
                # Create a new user
                logger.info(f"Creating new user: {email}")
                
                # Map the application role to a Superset role
                superset_role_name = self.role_mapping.get(role, 'Gamma')
                superset_role = self.find_role(superset_role_name)
                
                if not superset_role:
                    logger.error(f"Role not found: {superset_role_name}")
                    return None
                
                user = self.add_user(
                    username=email,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    role=superset_role,
                    password="NOPASSWORD"  # Password not used with JWT auth
                )
            else:
                # Update existing user
                logger.info(f"Updating existing user: {email}")
                
                # Map the application role to a Superset role
                superset_role_name = self.role_mapping.get(role, 'Gamma')
                superset_role = self.find_role(superset_role_name)
                
                if not superset_role:
                    logger.error(f"Role not found: {superset_role_name}")
                    return None
                
                # Update user properties
                user.first_name = first_name
                user.last_name = last_name
                user.roles = [superset_role]
                
                # Save the user
                self.update_user(user)
            
            # Store company ID in the user's extra attributes
            if company_id and hasattr(user, 'extra'):
                if not user.extra:
                    user.extra = {}
                user.extra['company_id'] = company_id
                self.update_user(user)
            
            return user
        except Exception as e:
            logger.error(f"Error authenticating user with JWT: {str(e)}")
            return None

class SGMernAuthDBView(AuthDBView):
    """
    Custom authentication view that handles JWT tokens from URL parameters
    or cookies, enabling seamless SSO from the main application.
    """
    
    @staticmethod
    def _get_jwt_token_from_request():
        """
        Extract JWT token from request (URL parameter or cookie)
        """
        # Check for token in URL parameter
        token = request.args.get('token')
        
        # If not in URL, check for token in cookies
        if not token and 'token' in request.cookies:
            token = request.cookies.get('token')
            
        return token
    
    def login(self):
        """
        Handle login requests, including JWT token authentication
        """
        # Check for JWT token
        token = self._get_jwt_token_from_request()
        
        if token:
            # Authenticate with JWT
            user = self.appbuilder.sm.auth_user_jwt(token)
            
            if user:
                login_user(user, remember=True)
                return redirect(self.appbuilder.get_url_for_index)
        
        # Fall back to standard login form
        return super().login()

# Function to setup the JWT authentication
def setup_jwt_auth(app, jwt_secret):
    """
    Configure the application to use JWT authentication
    
    Args:
        app: The Flask application
        jwt_secret: The secret key used to sign JWT tokens
    """
    app.config['AUTH_TYPE'] = AUTH_JWT
    app.config['JWT_SECRET_KEY'] = jwt_secret
    app.config['JWT_TOKEN_AUDIENCE'] = 'superset'
    app.config['JWT_ALGORITHM'] = 'HS256'
    app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 60 * 60 * 24 * 30  # 30 days
    
    # Set the custom security manager
    app.config['CUSTOM_SECURITY_MANAGER'] = SGMernJwtSecurityManager
