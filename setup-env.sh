#!/bin/bash

VARIABLES=(
  FRESHRSS_URL
  API_PASSWORD
  API_USER
  CATEGORY_IDS
  FETCH_DAYS
  SMTP_SERVER
  SMTP_PORT
  SMTP_USERNAME
  SMTP_PASSWORD
  TO_EMAIL
  FROM_EMAIL
)

for var in "${VARIABLES[@]}"; do
  read -rp "$var: " value
  if [ -n "$value" ]; then
    git build env set "$var=$value"
  else
    echo "Skipping $var (empty)"
  fi
done
