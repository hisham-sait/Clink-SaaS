#!/bin/bash

# Start PostgreSQL server
echo "Starting PostgreSQL server..."

# Check if PostgreSQL is already running
if pg_isready > /dev/null 2>&1; then
    echo "PostgreSQL is already running."
else
    # Try to start PostgreSQL using different methods based on the OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS, starting PostgreSQL using brew services..."
        brew services start postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux, starting PostgreSQL using systemctl..."
        sudo systemctl start postgresql
    else
        # Other OS
        echo "Unsupported OS. Please start PostgreSQL manually."
        exit 1
    fi
fi

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
for i in {1..10}; do
    if pg_isready > /dev/null 2>&1; then
        echo "PostgreSQL is now running."
        break
    fi
    echo "Waiting... ($i/10)"
    sleep 1
done

# Create user and database if they don't exist
echo "Setting up PostgreSQL user and database..."

# Set PostgreSQL credentials
PG_USER="postgres"
PG_PASSWORD="postgres123"
DB_NAME="clink_saas"

# Create user if it doesn't exist
echo "Creating user '$PG_USER' if it doesn't exist..."
createuser -s $PG_USER 2>/dev/null || echo "User already exists or could not be created."

# Set password for user
echo "Setting password for user '$PG_USER'..."
psql -c "ALTER USER $PG_USER WITH PASSWORD '$PG_PASSWORD';" 2>/dev/null || echo "Could not set password."

# Create database if it doesn't exist
echo "Creating database '$DB_NAME' if it doesn't exist..."
createdb -O $PG_USER $DB_NAME 2>/dev/null || echo "Database already exists or could not be created."

echo "PostgreSQL setup completed."
