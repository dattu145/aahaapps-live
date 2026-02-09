#!/bin/bash
# Kill any existing process on port 8000
fuser -k 8000/tcp 2>/dev/null

echo "Starting AahaApps Server with 1GB upload limit..."
# Using the same router script that 'artisan serve' uses
php8.2 -d upload_max_filesize=1024M -d post_max_size=1024M -d memory_limit=1024M -S 0.0.0.0:8000 vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
