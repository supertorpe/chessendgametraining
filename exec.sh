#!/bin/bash

# validations

if [[ "$#" -ne 1 || ("$1" != "build-img" && "$1" != "start" && "$1" != "stop" && "$1" != "build-app" && "$1" != "serve-app") ]]; then
  echo "Usage: exec.sh <build-img|start|stop|build-app|serve-app>"
  exit 1
fi

# setup variables

COMMAND=$1
export MY_UID=$(id -u)
export MY_GID=$(id -g)

if [[ "$COMMAND" == "build-img" ]]; then
  COMMAND="build"
elif [[ "$COMMAND" == "start" ]]; then
  COMMAND="up"
  export SCRIPT="dev"
elif [[ "$COMMAND" == "stop" ]]; then
  COMMAND="down"
elif [[ "$COMMAND" == "build-app" ]]; then
  COMMAND="up"
  export SCRIPT="build"
elif [[ "$COMMAND" == "serve-app" ]]; then
  COMMAND="up"
  export SCRIPT="serve"
fi

# goto root project dir

SCRIPT_PATH="${BASH_SOURCE:-$0}"
ABS_SCRIPT_PATH="$(realpath "${SCRIPT_PATH}")"
ABS_DIRECTORY="$(dirname "${ABS_SCRIPT_PATH}")"

cd ${ABS_DIRECTORY}

# run command

docker compose -f ./docker/docker-compose.yml ${COMMAND}
