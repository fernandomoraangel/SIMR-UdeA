#!/bin/sh

# Start nginx
nginx &

# Start backend
cd /app
npm start