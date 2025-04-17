#!/bin/bash

# Drop and recreate PostgreSQL database for Clink SaaS
echo "Dropping PostgreSQL database 'clink_saas'..."

# Set PostgreSQL credentials
PG_HOST="localhost"
PG_PORT="5432"
DB_NAME="clink_saas"

# Drop database if it exists
if psql -h $PG_HOST -p $PG_PORT -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    # Terminate all connections to the database
    echo "Terminating all connections to database '$DB_NAME'..."
    psql -h $PG_HOST -p $PG_PORT -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();"
    
    # Drop the database
    echo "Dropping database '$DB_NAME'..."
    psql -h $PG_HOST -p $PG_PORT -c "DROP DATABASE $DB_NAME;"
    echo "Database '$DB_NAME' dropped successfully."
else
    echo "Database '$DB_NAME' does not exist."
fi

echo "Database dropped successfully!"
