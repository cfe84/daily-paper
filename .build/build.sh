#!/bin/bash

docker rm daily-paper
docker build . -t daily-paper
docker create --name daily-paper \
  -e FRESHRSS_URL="$FRESHRSS_URL" \
  -e API_PASSWORD="$API_PASSWORD" \
  -e API_USER="$API_USER" \
  -e CATEGORY_IDS="$CATEGORY_IDS" \
  -e FETCH_DAYS="$FETCH_DAYS" \
  -e SMTP_SERVER="$SMTP_SERVER" \
  -e SMTP_PORT="$SMTP_PORT" \
  -e SMTP_USERNAME="$SMTP_USERNAME" \
  -e SMTP_PASSWORD="$SMTP_PASSWORD" \
  -e TO_EMAIL="$TO_EMAIL" \
  -e FROM_EMAIL="$FROM_EMAIL" \
  daily-paper

