#!/bin/bash

dockerUserName=$1

if [ -z "$dockerUserName" ]; then
  echo "Error: No input name provided for Docker repository."
  exit 1
fi

docker build -t ice-queb:latest .

PORT=$(grep PORT .env | cut -d '=' -f2)

if [ -z "$PORT" ]; then
  echo "PORT not found in .env file"
  exit 1
fi

PORT=$(echo "$PORT" | xargs)

docker run -d -p 443:"${PORT}" ice-queb:latest

docker tag ice-queb:latest "${dockerUserName}/ice-queb:latest"

docker login

docker push "${dockerUserName}/ice-queb:latest"
