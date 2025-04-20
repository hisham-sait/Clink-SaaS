#!/usr/bin/env python
"""
Script to directly update the database records in Superset's metadata database
to enable the 'Allow file uploads to database' option for all databases.
"""

import sqlite3
import json
import os

# Path to the Superset database
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'superset.db')

def enable_file_uploads():
    """Enable file uploads for all databases in Superset."""
    print(f"Connecting to Superset database at: {DB_PATH}")
    
    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all databases
        cursor.execute("SELECT id, database_name, extra FROM dbs")
        databases = cursor.fetchall()
        
        if not databases:
            print("No databases found in Superset.")
            return
        
        print(f"Found {len(databases)} database(s) in Superset.")
        
        # Check if allow_file_upload column exists
        cursor.execute("PRAGMA table_info(dbs)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        has_allow_file_upload_column = 'allow_file_upload' in column_names
        
        if not has_allow_file_upload_column:
            print("Adding allow_file_upload column to dbs table...")
            cursor.execute("ALTER TABLE dbs ADD COLUMN allow_file_upload BOOLEAN")
        
        # Update each database to enable file uploads
        for db_id, db_name, extra in databases:
            # Update the extra JSON field
            if extra:
                try:
                    extra_json = json.loads(extra)
                except (json.JSONDecodeError, TypeError):
                    extra_json = {}
            else:
                extra_json = {}
            
            extra_json['allow_file_upload'] = True
            
            if 'schemas_allowed_for_file_upload' not in extra_json:
                extra_json['schemas_allowed_for_file_upload'] = []
            
            # Update the database record
            cursor.execute(
                "UPDATE dbs SET extra = ?, allow_file_upload = 1 WHERE id = ?",
                (json.dumps(extra_json), db_id)
            )
            
            print(f"Enabled file uploads for database: {db_name} (ID: {db_id})")
        
        # Commit the changes
        conn.commit()
        print("All databases have been updated to allow file uploads.")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    enable_file_uploads()
