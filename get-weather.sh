#!/bin/bash

source ./keys.sh

# Ensure data directory exists with proper permissions
mkdir -p dashboard/public/data
#sudo setfacl -R -m u:gusost:rwx dashboard/public/data

# Fetch weather data
curl -s "https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=${UNITS}&lang=se" | jq . > dashboard/public/data/nacka-current.json
curl -s "api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=${UNITS}&lang=se" | jq . > dashboard/public/data/nacka-hourly.json

# Set proper permissions on the files
#sudo setfacl -m u:gusost:rw dashboard/public/data/nacka-current.json
#sudo setfacl -m u:gusost:rw dashboard/public/data/nacka-hourly.json

date
