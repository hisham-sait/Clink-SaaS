"""
User Synchronization Module for Apache Superset
This module provides functions to synchronize users between the main application and Superset.
"""

import logging
import json
import requests
from flask import current_app

logger = logging.getLogger(__name__)

class UserSyncManager:
    """
    Manager class for synchronizing users between the main application and Superset.
    """
    
    def __init__(self, security_manager):
        """
        Initialize the user sync manager.
        
        Args:
            security_manager: The Superset security manager
        """
        self.security_manager = security_manager
        self.role_mapping = {
            'super_admin': 'Admin',
            'platform_admin': 'Alpha',
            'company_owner': 'Alpha',
            'company_admin': 'Alpha',
            'company_manager': 'Gamma',
            'company_user': 'Gamma',
            'company_viewer': 'Public',
        }
    
    def sync_user(self, user_data):
        """
        Synchronize a user from the main application to Superset.
        
        Args:
            user_data: Dictionary containing user data from the main application
            
        Returns:
            The synchronized user object or None if synchronization fails
        """
        try:
            user_id = user_data.get('id')
            email = user_data.get('email')
            
            if not email:
                logger.error(f"User data missing email: {user_data}")
                return None
            
            # Extract user information
            first_name = user_data.get('name', '').split(' ')[0] if user_data.get('name') else 'User'
            last_name = ' '.join(user_data.get('name', '').split(' ')[1:]) if user_data.get('name', '').split(' ')[1:] else str(user_id)
            role = user_data.get('role', 'company_user')
            
            # Get company information
            company_id = None
            if user_data.get('primaryCompany'):
                company_id = user_data['primaryCompany'].get('id')
            elif user_data.get('companies') and len(user_data['companies']) > 0:
                company_id = user_data['companies'][0].get('company', {}).get('id')
            
            # Find or create the user
            user = self.security_manager.find_user(email=email)
            
            if not user:
                # Create a new user
                logger.info(f"Creating new user in Superset: {email}")
                
                # Map the application role to a Superset role
                superset_role_name = self.role_mapping.get(role, 'Gamma')
                superset_role = self.security_manager.find_role(superset_role_name)
                
                if not superset_role:
                    logger.error(f"Role not found in Superset: {superset_role_name}")
                    return None
                
                user = self.security_manager.add_user(
                    username=email,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    role=superset_role,
                    password="NOPASSWORD"  # Password not used with SSO
                )
            else:
                # Update existing user
                logger.info(f"Updating existing user in Superset: {email}")
                
                # Map the application role to a Superset role
                superset_role_name = self.role_mapping.get(role, 'Gamma')
                superset_role = self.security_manager.find_role(superset_role_name)
                
                if not superset_role:
                    logger.error(f"Role not found in Superset: {superset_role_name}")
                    return None
                
                # Update user properties
                user.first_name = first_name
                user.last_name = last_name
                user.roles = [superset_role]
                
                # Save the user
                self.security_manager.update_user(user)
            
            # Store company ID in the user's extra attributes
            if company_id and hasattr(user, 'extra'):
                if not user.extra:
                    user.extra = {}
                user.extra['company_id'] = company_id
                self.security_manager.update_user(user)
            
            return user
        except Exception as e:
            logger.error(f"Error synchronizing user: {str(e)}")
            return None

    def sync_all_users(self, api_url, api_token):
        """
        Synchronize all users from the main application to Superset.
        
        Args:
            api_url: The URL of the main application's user API
            api_token: The API token for authentication
            
        Returns:
            The number of users synchronized
        """
        try:
            # Fetch users from the main application
            headers = {
                'Authorization': f'Bearer {api_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(api_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch users from API: {response.status_code}")
                return 0
            
            users_data = response.json()
            
            if not users_data.get('success'):
                logger.error(f"API returned error: {users_data}")
                return 0
            
            users = users_data.get('data', [])
            sync_count = 0
            
            # Synchronize each user
            for user_data in users:
                user = self.sync_user(user_data)
                if user:
                    sync_count += 1
            
            logger.info(f"Synchronized {sync_count} users")
            return sync_count
        except Exception as e:
            logger.error(f"Error synchronizing all users: {str(e)}")
            return 0

def create_superset_token(user_id, email, name, role, company_id=None):
    """
    Create a JWT token for Superset authentication.
    
    Args:
        user_id: The user ID
        email: The user's email
        name: The user's name
        role: The user's role
        company_id: The user's company ID (optional)
        
    Returns:
        A JWT token for Superset authentication
    """
    import jwt
    import time
    
    # Get the JWT secret from environment
    jwt_secret = current_app.config.get('JWT_SECRET_KEY')
    
    # Split name into first and last name
    name_parts = name.split(' ')
    first_name = name_parts[0]
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
    
    # Create token payload
    payload = {
        'id': user_id,
        'email': email,
        'firstName': first_name,
        'lastName': last_name,
        'role': role,
        'iat': int(time.time()),
        'exp': int(time.time()) + 60 * 60 * 24 * 30,  # 30 days
        'aud': 'superset'
    }
    
    if company_id:
        payload['companyId'] = company_id
    
    # Create and sign the token
    token = jwt.encode(payload, jwt_secret, algorithm='HS256')
    
    return token

def get_superset_login_url(token):
    """
    Get the Superset login URL with the JWT token.
    
    Args:
        token: The JWT token
        
    Returns:
        The Superset login URL with the token
    """
    superset_url = current_app.config.get('SUPERSET_URL', 'http://localhost:3200')
    return f"{superset_url}/login?token={token}"
