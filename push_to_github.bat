@echo off
title Push Tic-Tac-Toe to GitHub
echo ========================================================
echo   Pushing Tic-Tac-Toe Deluxe to GitHub:
echo   https://github.com/bharadwajyadavalli1999-wq/Game-_project
echo ========================================================
echo.
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\MinGit\cmd"
cd /d "%~dp0"

echo Running: git push -u origin main...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTE] If prompted for credentials, you can enter your 
    echo   GitHub Personal Access Token (PAT) as the password.
    echo ========================================================
)
echo.
pause
