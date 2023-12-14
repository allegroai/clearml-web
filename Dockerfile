FROM allegroai/clearml:1.11.0

COPY build /usr/share/nginx/html
RUN chmod 777 /etc/nginx/sites-enabled/default
COPY default /etc/nginx/sites-enabled

ENV NGINX_APISERVER_ADDR=http://shuyu-clearml-api.shuyu-clearml-ops:8008
ENV NGINX_FILESERVER_ADDR=http://shuyu-clearml-fileserver.shuyu-clearml-ops:8081
ENV NGINX_APISERVER_ADDRESS=http://shuyu-clearml-api.shuyu-clearml-ops:8008
ENV NGINX_FILESERVER_ADDRESS=http://shuyu-clearml-fileserver.shuyu-clearml-ops:8081

ENV CLEARML_SERVER_BUILD=373
ENV CLEARML_SERVER_VERSION=1.11.0

EXPOSE 80
