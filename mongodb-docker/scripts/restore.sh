#!/bin/bash

# Check if the backup directory is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup-directory>"
  exit 1
fi

BACKUP_DIR=$1

# Restore the MongoDB database from the backup
mongorestore --uri="mongodb://localhost:27017" "$BACKUP_DIR"

echo "Database restored from $BACKUP_DIR"