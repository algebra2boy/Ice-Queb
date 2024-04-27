#!/bin/bash

sudo killall -9 node # Dangerous

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 17
nvm use 17

# npm operation
npm run build
npm run start & # run in the background


PORT=$(grep PORT .env | cut -d '=' -f2)

# check if port is there
if [ -z "$PORT" ]; then
  echo "PORT not found in .env file"
  exit 1
fi

PORT=$(echo "$PORT" | xargs)  # remove space in port
ngrok http https://localhost:"${PORT}"
