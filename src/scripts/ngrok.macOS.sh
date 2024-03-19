# You might need to "chmod +x ./ngrok.macOS.sh"
# Then run "./ngrok.macOS.sh" to execute the script
# "chmod +x is to add executable permission to the file"

# Install ngrok via homebrew if not installed
if ! command -v ngrok &> /dev/null
then
    echo "ngrok is not installed, downloading..."
    brew install ngrok
fi

# Add your authtoken from .env file
ngrok config add-authtoken $NGROK_AUTH_TOKEN

# Expose a local server to the internet
ngrok http $APP_URL