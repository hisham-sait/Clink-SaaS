#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p api/logs

# Create log files if they don't exist
touch api/logs/import-debug.log
touch api/logs/imports.log
touch api/logs/error.log

# Function to display a header
print_header() {
    echo -e "\n\033[1;34m=== $1 ===\033[0m\n"
}

# Monitor all log files
{
    # Use tail -f to continuously monitor each log file
    tail -f api/logs/import-debug.log | while read line; do
        print_header "DEBUG LOG"
        echo "$line"
    done
} &

{
    tail -f api/logs/imports.log | while read line; do
        print_header "IMPORTS LOG"
        echo "$line"
    done
} &

{
    tail -f api/logs/error.log | while read line; do
        print_header "ERROR LOG"
        echo -e "\033[0;31m$line\033[0m"  # Show errors in red
    done
} &

# Wait for any key to exit
echo "Monitoring import logs... (Press any key to exit)"
read -n 1
kill $(jobs -p)
