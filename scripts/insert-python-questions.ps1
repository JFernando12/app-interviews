# PowerShell script to insert Python interview questions
# Run this script from the project root directory

Write-Host "🐍 Inserting Python Interview Questions" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Check if the server is running
Write-Host "Checking if the development server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/questions?global=true&limit=1" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Development server is running" -ForegroundColor Green
    } else {
        throw "Server returned status $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Development server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start the development server with 'npm run dev' and try again." -ForegroundColor Red
    exit 1
}

# Install node-fetch if not already installed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install node-fetch 2>$null

# Run the insertion script
Write-Host "Running Python questions insertion script..." -ForegroundColor Yellow
try {
    node scripts/insert-python-questions.js
    Write-Host "✅ Script completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Script failed to execute" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nScript execution finished. Check the output above for results." -ForegroundColor Cyan