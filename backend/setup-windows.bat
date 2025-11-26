@echo off
echo ================================================
echo Smart Farm Backend - Windows Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MySQL is not installed or not in PATH!
    echo Please install MySQL from: https://dev.mysql.com/downloads/installer/
    echo.
)

echo [1/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [2/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo [SUCCESS] .env file created. Please edit it with your MySQL password!
) else (
    echo [INFO] .env file already exists.
)

echo.
echo [3/5] Creating database...
echo Please enter your MySQL root password when prompted.
echo.
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smartfarm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database!
    echo Make sure MySQL is running and you entered the correct password.
    pause
    exit /b 1
)

echo.
echo [4/5] Importing database schema...
mysql -u root -p smartfarm_db < database\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to import schema!
    pause
    exit /b 1
)

echo.
echo [5/5] Importing sample data (optional)...
set /p import_data="Import sample data? (Y/N): "
if /i "%import_data%"=="Y" (
    mysql -u root -p smartfarm_db < database\seed_data.sql
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to import sample data, but continuing...
    ) else (
        echo [SUCCESS] Sample data imported!
    )
)

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo IMPORTANT: Edit the .env file with your MySQL password:
echo   DB_PASSWORD=your_mysql_password
echo   JWT_SECRET=any_random_string_here
echo.
echo Then start the server with:
echo   npm run dev
echo.
echo Server will run on: http://localhost:3000
echo.
echo Test accounts (after importing sample data):
echo   Customer: somchai@farmer.com / password123
echo   Provider: greenthumb@provider.com / password123
echo.
pause
