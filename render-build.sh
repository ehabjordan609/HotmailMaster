#!/usr/bin/env bash
set -o errexit

# Define PUPPETEER_CACHE_DIR if not already set
if [ -z "$PUPPETEER_CACHE_DIR" ]; then
  PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer
fi

# Create the Puppeteer cache directory if it doesn’t exist
if [ ! -d "$PUPPETEER_CACHE_DIR" ]; then
  mkdir -p "$PUPPETEER_CACHE_DIR"
fi

# Define and create the build cache directory if it doesn’t exist
BUILD_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/chrome
if [ ! -d "$BUILD_CACHE_DIR" ]; then
  mkdir -p "$BUILD_CACHE_DIR"
fi

# Install dependencies and build the project
npm install
npm run build  # Uncomment this line if your project has a build step

# Copy Puppeteer cache between directories
if [ ! -d "$PUPPETEER_CACHE_DIR/chrome" ]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R "$BUILD_CACHE_DIR/" "$PUPPETEER_CACHE_DIR/chrome/"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R "$PUPPETEER_CACHE_DIR/chrome/" "$BUILD_CACHE_DIR/"
fi