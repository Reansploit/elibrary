@echo off
REM Build LunarAgent.exe sekali jalan (di PC Windows yang ada Python).
cd /d "%~dp0"
where py >nul 2>&1 || (echo Python tidak ketemu. Install dari python.org, centang Add to PATH. & pause & exit /b 1)
py -m pip install --upgrade pyinstaller
py -m PyInstaller --noconfirm --onefile --noconsole --name LunarAgent LunarAgent.py
echo.
echo Hasil: dist\LunarAgent.exe
pause
