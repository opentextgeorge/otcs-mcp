#!/bin/bash
# Load environment variables from .env file
set -a
source "$(dirname "$0")/.env"
set +a

# Run the MCP server
exec node "$(dirname "$0")/dist/index.js"
