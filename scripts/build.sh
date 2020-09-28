#!/bin/bash

set -ex

USERNAME=sensrnet
REGISTRY=sensrnetregistry.azurecr.io
# image name
IMAGE=central-viewer

docker build -t $REGISTRY/$USERNAME/$IMAGE:latest .
