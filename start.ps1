# AUM Groceries - Production Ready Setup

# Start the development server
Write-Host "Starting AUM Groceries Customer Web App..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Display backend service requirements
Write-Host "`n=== Backend Services Required ===" -ForegroundColor Cyan
Write-Host "Make sure these services are running:" -ForegroundColor White
Write-Host "• User Service: http://localhost:3001" -ForegroundColor Gray
Write-Host "• Product Service: http://localhost:8001" -ForegroundColor Gray  
Write-Host "• Order Service: http://localhost:8002" -ForegroundColor Gray
Write-Host "• WebSocket Service: ws://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Display features
Write-Host "=== Production Features Active ===" -ForegroundColor Cyan
Write-Host "✅ Real-time cart synchronization" -ForegroundColor Green
Write-Host "✅ No mock data - all from backend APIs" -ForegroundColor Green
Write-Host "✅ Optimistic UI updates" -ForegroundColor Green
Write-Host "✅ Offline detection & graceful fallbacks" -ForegroundColor Green
Write-Host "✅ Error handling with retry mechanisms" -ForegroundColor Green
Write-Host "✅ WebSocket auto-reconnection" -ForegroundColor Green
Write-Host ""

# Start the application
Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host "App will open at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm start
