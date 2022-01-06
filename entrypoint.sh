#!/bin/sh
set -e

replace_api_env() {
  # sets the backend url for each language the site is in
  # each language has its own subfolder, having its own env.js
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.apiUrl = 'api'@window.__env.apiUrl = '${API_URL}'@" ${dir}env.js
  done
}

replace_geoserver_env() {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.geoserverUrl = '/geoserver/wfs'@window.__env.geoserverUrl = '${GEOSERVER_URL}'@" ${dir}env.js
  done
}

replace_base_href() {
  # Strip leading and trailing '/'s, if present
  BASE=$(echo $BASE_HREF | sed 's/^\///;s/\/$//')

  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@<base href=\"/@<base href=\"/${BASE}/@" ${dir}index.html
  done

  sed -i "s@# rewrite ^/BASE_HREF(/.*)$ \$1 last;@rewrite ^/${BASE}(/.*)$ \$1 last;@" /etc/nginx/conf.d/default.conf
}

if [[ ! -z "$API_URL" ]]; then
  replace_api_env
fi

if [[ ! -z "$GEOSERVER_URL" ]]; then
  replace_geoserver_env
fi

if [ ! -z "$BASE_HREF" ] && [ ! $BASE_HREF = '/' ]; then
  replace_base_href
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
