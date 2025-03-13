#!/bin/bash

# filepath: /home/host/CS476-Project/force-shutdown.sh

# Find and kill all node processes running controller.ts
pids=$(ps aux | grep '[n]ode.*controller.ts' | awk '{print $2}')

if [ -z "$pids" ]; then
  echo "No node processes running controller.ts found."
else
  echo $pids | xargs kill -9
  echo "All node processes running controller.ts have been forcefully terminated."
fi