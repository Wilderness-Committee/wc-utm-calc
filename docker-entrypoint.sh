#!/bin/sh
set -e

# Railway mounts the persistent volume as root. Grant the unprivileged
# runtime user ownership of the data dir before dropping privileges.
DATA_DIR="$(dirname "${DATABASE_PATH:-/data/utm.db}")"
mkdir -p "$DATA_DIR"
chown -R nextjs:nodejs "$DATA_DIR"

exec gosu nextjs:nodejs node server.js
