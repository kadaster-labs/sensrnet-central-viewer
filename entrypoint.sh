#!/bin/sh
set -e

if [[ ! -z "$GEOSERVER_URL" ]]; then
  sed -i "s@url\": \"sensrnet-geoserver\"@url\": \"${GEOSERVER_URL}\"@" /usr/share/nginx/html/assets/layers.json
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
