#!/bin/bash

source ./keys.sh

curl -s "https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=${UNITS}&lang=se" | jq . > dashboard/src/data/nacka-current.json
curl -s "api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=${UNITS}&lang=se" | jq . > dashboard/src/data/nacka-hourly.json
date
