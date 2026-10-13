@echo off
echo ================================================
echo  IRMALIA - Barangay Incident Report System
echo  Starting development servers...
echo ================================================
echo.

:: Start PHP built-in server in background
echo [1/2] Starting PHP API server on localhost:8000...
start "IRMalia PHP API" cmd /c "php -S localhost:8000 router.php && pause"

:: Small delay
timeout /t 2 /nobreak >nul

:: Start Vite dev server
echo [2/2] Starting Vite frontend on localhost:5173...
echo.
echo ================================================
echo  App will open at: http://localhost:5173
echo  API running at:   http://localhost:8000
echo  Login:  admin / Admin@1234
echo ================================================
echo.
npm run dev
