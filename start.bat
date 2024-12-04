@echo off
setlocal enabledelayedexpansion

:: Colors for Windows console
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "NC=[0m"

:: Function to check if a command exists
where /q node || (
    echo %RED%Error: Node.js is not installed%NC%
    exit /b 1
)
where /q npm || (
    echo %RED%Error: npm is not installed%NC%
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_VERSION=%%a.%%b.%%c
)
echo %YELLOW%Node.js version %NODE_VERSION% detected%NC%

:: Install dependencies
echo %YELLOW%Installing API dependencies...%NC%
cd api
call npm install
if errorlevel 1 (
    echo %RED%Error: Failed to install API dependencies%NC%
    exit /b 1
)
cd ..

echo %YELLOW%Installing Angular dependencies...%NC%
cd app
call npm install
if errorlevel 1 (
    echo %RED%Error: Failed to install Angular dependencies%NC%
    exit /b 1
)
cd ..

:: Start servers
echo %YELLOW%Starting servers...%NC%

:: Start API server in new window
start "API Server" cmd /c "cd api && npm run dev"

:: Wait a moment for API to initialize
echo %YELLOW%Waiting for API to initialize...%NC%
timeout /t 3 /nobreak > nul

:: Start Angular server in new window
start "Angular Development Server" cmd /c "cd app && ng serve"

echo %GREEN%Startup complete!%NC%
echo %YELLOW%API server running on http://localhost:3000%NC%
echo %YELLOW%Angular app running on http://localhost:4200%NC%
echo.
echo Press any key to stop all servers

:: Keep the window open
pause > nul

:: Kill all node processes when exiting
taskkill /F /IM node.exe > nul 2>&1
