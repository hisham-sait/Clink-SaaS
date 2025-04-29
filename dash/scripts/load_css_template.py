#!/usr/bin/env python3
"""
Script to load the SEEGAP Theme CSS template into Superset.
This script should be run after Superset is installed and initialized.

Usage:
    python load_css_template.py

This will create a CSS template in Superset that can be applied to dashboards.
"""

import os
import sys
from pathlib import Path

# Add the Superset app directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from superset import app, db
    from superset.models.core import CssTemplate
except ImportError:
    print("Error: Could not import Superset modules.")
    print("Make sure Superset is installed and this script is run from the correct directory.")
    sys.exit(1)

def load_css_template():
    """Load the SEEGAP Theme CSS template into Superset."""
    print("Loading SEEGAP Theme CSS template...")
    
    # Path to the CSS template file
    css_file_path = Path(__file__).parent.parent / "css_templates" / "clink_theme.css"
    
    if not css_file_path.exists():
        print(f"Error: CSS template file not found at {css_file_path}")
        return False
    
    # Read the CSS content
    with open(css_file_path, "r") as f:
        css_content = f.read()
    
    # Check if the template already exists
    template_name = "SEEGAP Theme"
    existing_template = db.session.query(CssTemplate).filter_by(template_name=template_name).first()
    
    if existing_template:
        print(f"CSS template '{template_name}' already exists. Updating...")
        existing_template.css = css_content
    else:
        print(f"Creating new CSS template '{template_name}'...")
        template = CssTemplate(template_name=template_name, css=css_content)
        db.session.add(template)
    
    # Commit the changes
    db.session.commit()
    print("CSS template loaded successfully!")
    return True

if __name__ == "__main__":
    try:
        with app.app_context():
            success = load_css_template()
            sys.exit(0 if success else 1)
    except RuntimeError as e:
        print(f"Error: {e}")
        print("This error is related to the application context.")
        print("The CSS template will need to be loaded manually through the Superset UI.")
        print("Please follow these steps:")
        print("1. Log in to Superset as an admin")
        print("2. Go to 'Settings' > 'CSS Templates'")
        print("3. Click '+' to add a new template")
        print("4. Name it 'SEEGAP Theme'")
        print("5. Copy and paste the CSS from css_templates/clink_theme.css")
        print("6. Save the template")
        sys.exit(1)
