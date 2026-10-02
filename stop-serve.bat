@echo off
REM Matikan serve-hidden.bat (semua proses php.exe).
REM Hati-hati: mematikan SEMUA php yang jalan di PC ini.
taskkill /F /IM php.exe
echo beres.
