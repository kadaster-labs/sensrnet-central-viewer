#!/bin/sh
set -e

replace_envs () {
  # sets the backend url for each language the site is in
  # each language has its own subfolder, having its own env.js
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.apiUrl = 'api'@window.__env.apiUrl = '${API_URL}'@" ${dir}env.js
    sed -i "s@window.__env.geoserverUrl = 'api'@window.__env.geoserverUrl = '${GEOSERVER_URL}'@" ${dir}env.js
  done
}

if [ "$1" = "run" ]; then
  replace_envs

  exec nginx -g "daemon off;"
else
  exec "$@"
fi
