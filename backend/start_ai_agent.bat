@echo off
REM Batch script to start the AI Agent Server
REM Usage: start_ai_agent.bat

echo Starting AI Agent Server...

REM Check if GEMINI_API_KEY is set
if "%GEMINI_API_KEY%"=="" (
    echo.
    echo WARNING: GEMINI_API_KEY not set!
    echo Please set it with:
    echo   set GEMINI_API_KEY=your-api-key-here
    echo.
    echo Or get one from: https://makersuite.google.com/app/apikey
    echo.
    pause
)

REM Start the server
echo.
echo Starting server on http://localhost:8081
python ai_agent_server.py

pause

