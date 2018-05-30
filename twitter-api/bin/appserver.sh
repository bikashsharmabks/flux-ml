#!/bin/bash

# Check if there are any arguens given or not
if [[ $# -eq 0 ]] ; then
    echo "Please provide arguments to the script"
	echo "Usage:"
	echo "Start all Services : bash appserver.sh start"
	echo "Stop all Services : bash appserver.sh stop"
    exit 1
fi

function start_all()
{
	echo "Starting all services"
	cd /app
	npm install
	node server.js
	exit
}

function stop_all()
{	
	echo "Stopping all services"
	pm2 delete all
	exit
}

#Now that we have the arguments we will be executing the given commands
if [ $1 == "start" ]
then
   start_all
elif [ $1 == "stop" ]
then
   stop_all
fi

