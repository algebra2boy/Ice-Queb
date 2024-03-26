#!/bin/sh

# You might need to "chmod +x ./ngrok.macOS.sh"
# Then run "./ngrok.macOS.sh" to execute the script
# "chmod +x is to add executable permission to the file"
# MAKE SURE to export your NGROK_AUTH_TOKEN and APP_URL in .env file
# export NGROK_AUTH_TOKEN=<token>
# export APP_URL=<url link>

# Install ngrok via homebrew if not installed
if ! command -v ngrok &> /dev/null
then
    echo "ngrok is not installed, downloading..."
    brew install ngrok
fi

if [ ! -f .env ]
then
  export $(cat .env | xargs)
fi

# Add your authtoken from .env file
ngrok config add-authtoken $NGROK_AUTH_TOKEN

# # Expose a local server to the internet
ngrok http $APP_URL