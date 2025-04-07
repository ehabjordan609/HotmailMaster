#!/usr/bin/env bash
set -o errexit

# Định nghĩa PUPPETEER_CACHE_DIR nếu chưa có
if [ -z "$PUPPETEER_CACHE_DIR" ]; then
  PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer
fi

# Tạo thư mục cache nếu chưa tồn tại
if [ ! -d "$PUPPETEER_CACHE_DIR" ]; then
  mkdir -p "$PUPPETEER_CACHE_DIR"
fi

npm install
npm run build  # Nếu dự án có lệnh build, bỏ comment dòng này

# Sao chép cache của Puppeteer
if [ ! -d "$PUPPETEER_CACHE_DIR/chrome" ]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ "$PUPPETEER_CACHE_DIR/"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R "$PUPPETEER_CACHE_DIR/chrome/" /opt/render/project/src/.cache/puppeteer/chrome/
fi