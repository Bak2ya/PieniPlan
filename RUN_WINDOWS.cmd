@echo off
setlocal
cd /d "%~dp0"
set "PIENIPLAN_PY=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "PIENIPLAN_PY_ARG="
if exist "%PIENIPLAN_PY%" goto checkport
py -3 --version >nul 2>&1
if not errorlevel 1 (
  set "PIENIPLAN_PY=py"
  set "PIENIPLAN_PY_ARG=-3"
  goto checkport
)
python --version >nul 2>&1
if not errorlevel 1 (
  set "PIENIPLAN_PY=python"
  goto checkport
)
echo Python 3 is required to serve this static app over local HTTP.
echo No software has been installed. See README.md for manual startup.
pause
exit /b 1

:checkport
"%PIENIPLAN_PY%" %PIENIPLAN_PY_ARG% -c "import socket; s=socket.socket(); s.bind(('127.0.0.1',8000)); s.close()" >nul 2>&1
if errorlevel 1 (
  echo Port 8000 is unavailable. Stop the previous local server or use another port.
  echo Browser storage is specific to the hostname and port.
  pause
  exit /b 1
)
echo PieniPlan v0.56.0 - Build77
echo Local URL: http://127.0.0.1:8000/
echo Keep this window open. Press Ctrl+C to stop the server.
start "" "http://127.0.0.1:8000/"
"%PIENIPLAN_PY%" %PIENIPLAN_PY_ARG% -m http.server 8000 --bind 127.0.0.1
endlocal
