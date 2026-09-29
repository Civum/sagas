#!/bin/bash

#a failed install, acceptance check, or Docker command stops the script instead of letting setup continue in a broken state.
#set -euo pipefail

cd ..
cd ..

echo "This script assumes you have the follwoing dependencies installed"
echo ""
echo "Node 22.10 or later"
echo "pnpm 9"
echo "Docker and Docker Desktop"
echo "ffmpeg"
echo ""
echo "In Linux if current user isnt apart of the docker group docker setup may not work."
echo ""
echo "If Docker isnt working run sudo usermod -aG docker $USER and either sign out and sign in or run newgrp docker"

sleep 3

pnpm install

# Ensures enviorment file doesnt already exists.
if [ -f ".env" ]; then
  echo ".env file already exists, skipping creation"
else
  echo "Creating .env file from .env.example"
  cp .env.example .env
fi


pnpm fixtures:build # regenerates the derived graph states, prints a dump

pnpm acceptance



# Docker setup
cd apps/capture-api

pnpm db:up        # start Postgres 16 with PostGIS
pnpm db:verify    # confirm it's actually worki


echo "db:verify prints your Postgres and PostGIS versions and the connection string to paste into .env. If something is wrong it tells you what to do rather than printing a stack trace."
#####Todo Fix!#####
#Storage setup
# pnpm storage:up        # start it
# pnpm storage:verify    # confirm it works, make the bucket, print your env vars

exit 0