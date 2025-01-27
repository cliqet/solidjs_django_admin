#!/bin/bash

# NOTE: pull branch manually to work with
# automate below in server environment

# Check if /usr/bin/bash exists and is executable
# because /usr/bin/bash is used in the container
if [ -x /usr/bin/bash ]; then
    BASH_EXEC="/usr/bin/bash"
else
    BASH_EXEC="/bin/bash"
fi

set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Deploy script current directory: $SCRIPT_DIR"

ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
echo "Deploy script root directory: $ROOT_DIR"

cd $ROOT_DIR

echo "Moved to directory: $ROOT_DIR"

echo "Pulling branch"
# git pull origin <branch>

echo "Stopping and removing existing containers"
docker-compose -f ./docker-compose-prod.yml down

echo "Building the SolidJS Django frontend image"
docker-compose -f ./docker-compose-prod.yml build solid_django_admin

echo "Running containers"
docker-compose -f ./docker-compose-prod.yml up -d

# Show logs in case containers fail to start
echo
echo "SolidJS Django Frontend Logs ***************************************"
docker-compose -f ./docker-compose-prod.yml logs --tail=10 solid_django_admin
echo "End of SolidJS Django Frontend Logs ********************************"
echo

# Clean up every now and then especially when changes are made to Dockerfiles
# Free up space from image accumulation
echo "Do you want to remove unused images? [y/N]:"
read is_remove
if [[ $is_remove == [yY] ]]; then
    docker image prune -a
    echo "Removed unused images"
else
    echo "Unused images removal skipped."
fi


