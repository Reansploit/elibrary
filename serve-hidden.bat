@echo off
REM Jalanin elibrary tanpa jendela terminal.
REM Pakai: serve-hidden.bat [port]  (default 8000)
set PORT=%1
if "%PORT%"=="" set PORT=8000
powershell -Command "Start-Process php -ArgumentList 'artisan serve --host=0.0.0.0 --port=%PORT%' -WindowStyle Hidden -WorkingDirectory '%~dp0elibrary'"
echo elibrary jalan di http://localhost:%PORT% (tanpa terminal)
