# PowerShell script to start the AI Agent Server
# Usage: .\start_ai_agent.ps1

Write-Host "Starting AI Agent Server..." -ForegroundColor Green

# Check if GEMINI_API_KEY is set
if (-not $env:GEMINI_API_KEY) {
    Write-Host "`n⚠️  GEMINI_API_KEY not set!" -ForegroundColor Yellow
    Write-Host "Please set it with:" -ForegroundColor Yellow
    Write-Host '  $env:GEMINI_API_KEY="your-api-key-here"' -ForegroundColor Cyan
    Write-Host "`nOr get one from: https://makersuite.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host "`nPress Enter to continue anyway (will fail if Gemini is needed)..." -ForegroundColor Yellow
    Read-Host
}

# Check if google-generativeai is installed
try {
    python -c "import google.generativeai" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n⚠️  google-generativeai not installed!" -ForegroundColor Yellow
        Write-Host "Installing..." -ForegroundColor Yellow
        pip install google-generativeai
    }
} catch {
    Write-Host "`n⚠️  Could not check for google-generativeai" -ForegroundColor Yellow
}

# Start the server
Write-Host "`n🚀 Starting server on http://localhost:8081" -ForegroundColor Green
python ai_agent_server.py

