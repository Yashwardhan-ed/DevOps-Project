#!/usr/bin/env bash
# Load testing script to generate CPU load and demonstrate HPA scaling
set -euo pipefail

URL="${URL:-http://helpdesk.local/api/tickets}"
REQUESTS="${REQUESTS:-1000}"
CONCURRENCY="${CONCURRENCY:-10}"

echo "Starting load test on ${URL} (${REQUESTS} requests, concurrency: ${CONCURRENCY})..."

seq 1 "$REQUESTS" | xargs -n 1 -P "$CONCURRENCY" -I {} curl -s -o /dev/null "$URL" || true

echo "Load test completed against ${URL}"
