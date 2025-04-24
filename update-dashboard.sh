#!/bin/bash

# Save curent date and time to be show runtime at the end of the script
START_TIME=$(date +%s)

# Exit on error
set -e

echo "🔄 Starting dashboard update..."

# Ensure data directory exists with proper permissions
echo "📁 Setting up data directory..."
mkdir -p dashboard/public/data

# Get weather and calendar events in parallel
echo "📅 Fetching calendar events..."
node calendar.js &
CALENDAR_PID=$!
echo "🌤️  Fetching weather..."
./get-weather.sh &
WEATHER_PID=$!

# Check if Chromium is running and start it if needed
echo "🌐 Checking Chromium browser..."
if ! pgrep -f "chromium.*--remote-debugging-port=9222" > /dev/null; then
  echo "Starting Chromium browser..."
  
  # Try different possible paths for Chromium
  CHROMIUM_PATHS=(
    "/usr/bin/chromium-browser"
    "/usr/bin/chromium"
    "/usr/bin/google-chrome"
    "/usr/bin/chrome"
  )
  
  CHROMIUM_FOUND=false
  for path in "${CHROMIUM_PATHS[@]}"; do
    if [ -f "$path" ]; then
      echo "Found Chromium at: $path"
      $path \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --remote-debugging-port=9222 \
        --user-data-dir=/tmp/manual-chrome \
        about:blank &
      CHROMIUM_FOUND=true
      break
    fi
  done
  
  if [ "$CHROMIUM_FOUND" = false ]; then
    echo "Error: Chromium browser not found. Please install it with:"
    echo "sudo apt-get update && sudo apt-get install chromium-browser"
    exit 1
  fi
  
  # Wait for Chromium to start
  echo "Waiting for Chromium to start..."
  sleep 5
else
  echo "Chromium browser is already running"
fi

# Wait only for calendar and weather processes
wait $CALENDAR_PID
wait $WEATHER_PID

# Make new build that includes new data
# echo "🔄 Making new build..."
# cd dashboard
# npm run build
# cd ..

# Start the web server if not running
echo "🌐 Starting web server..."
if ! curl -s http://localhost:4000 > /dev/null; then
  cd dashboard/build
  npx serve -l 4000 &
  WEB_SERVER_PID=$!
  
  # Wait for server to be ready
  MAX_RETRIES=10
  RETRY_COUNT=0
  while ! curl -s http://localhost:4000 > /dev/null; do
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "Error: Web server failed to start after $MAX_RETRIES attempts"
      exit 1
    fi
    sleep 1
    RETRY_COUNT=$((RETRY_COUNT + 1))
  done
  cd ../..
fi

# Render the dashboard
echo "🖼️  Rendering dashboard..."
node render-pi.js

# Convert to grayscale
echo "🎨 Converting to grayscale..."
convert ~/schedule-gray.png -depth 8 -colorspace gray ~/Dropbox/Web/schedule-gray.png

# Show runtime
END_TIME=$(date +%s)
RUNTIME=$((END_TIME - START_TIME))
echo "✅ Dashboard update complete! Runtime: $RUNTIME seconds"
