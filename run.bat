@echo off
chcp 65001 >nul
echo ========================================
echo Unit Converter Hub - Uruchamianie
echo ========================================
echo.

REM Sprawdź czy Node.js jest zainstalowany
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [BŁĄD] Node.js nie jest zainstalowany!
    echo.
    echo Zainstaluj Node.js z: https://nodejs.org/
    echo Następnie zrestartuj terminal i uruchom ponownie ten skrypt.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js jest zainstalowany
node --version
npm --version
echo.

REM Sprawdź czy node_modules istnieje
if not exist "node_modules" (
    echo [INFO] Instalowanie zależności...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [BŁĄD] Nie udało się zainstalować zależności!
        pause
        exit /b 1
    )
    echo [OK] Zależności zainstalowane
    echo.
)

echo [INFO] Uruchamianie serwera deweloperskiego...
echo [INFO] Strona będzie dostępna pod: http://localhost:5173
echo [INFO] Naciśnij Ctrl+C aby zatrzymać serwer
echo.
call npm run dev

