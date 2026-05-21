@echo off
setlocal

set PORT=5500
set URL=http://localhost:%PORT%

echo.
echo ==========================================
echo   Portfolio Pedro Leite Campos
echo   Servidor local em %URL%
echo   Pressione Ctrl+C para parar
echo ==========================================
echo.

REM Abre o navegador automaticamente apos 1 segundo
start "" /B cmd /c "timeout /t 1 /nobreak >nul & start %URL%"

REM Tenta Python 3 (comando python)
where python >nul 2>nul
if %errorlevel% == 0 (
  python -m http.server %PORT%
  goto :end
)

REM Tenta py launcher (comum no Windows)
where py >nul 2>nul
if %errorlevel% == 0 (
  py -3 -m http.server %PORT%
  goto :end
)

REM Fallback: Node.js via npx
where npx >nul 2>nul
if %errorlevel% == 0 (
  npx --yes serve -l %PORT% .
  goto :end
)

echo.
echo ERRO: Nenhum servidor disponivel.
echo Instale Python 3 (https://www.python.org/downloads/)
echo ou Node.js (https://nodejs.org/) para continuar.
echo.
pause

:end
endlocal
