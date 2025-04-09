#!/bin/bash

# Define backup directory and filename
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d%H%M")
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Run mongodump to create a backup
mongodump --gzip --archive=$BACKUP_FILE

echo "Backup created at $BACKUP_FILE"