# Service Discovery Tool
Write-Host "🔍 Discovering what's running on your microservice ports..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ports = @(3001, 8001, 8002, 8080)

foreach ($port in $ports) {
    Write-Host "`nPort $port:" -ForegroundColor Yellow
    
    # Check if port is listening
    $connection = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
    
    if ($connection.TcpTestSucceeded) {
        Write-Host "  Status: ✅ LISTENING" -ForegroundColor Green
        
        # Try to get service info
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-Host "  HTTP Response: $($response.StatusCode)" -ForegroundColor White
            
            # Check for common service indicators
            $content = $response.Content
            if ($content -match "express|node|api") {
                Write-Host "  Likely: Node.js/Express service" -ForegroundColor Cyan
            }
            elseif ($content -match "django|python") {
                Write-Host "  Likely: Django/Python service" -ForegroundColor Cyan
            }
            elseif ($content -match "spring|java") {
                Write-Host "  Likely: Spring/Java service" -ForegroundColor Cyan
            }
            else {
                Write-Host "  Type: Unknown web service" -ForegroundColor Gray
            }
        }
        catch {
            if ($port -eq 8080) {
                Write-Host "  Likely: WebSocket service (normal to not respond to HTTP)" -ForegroundColor Cyan
            } else {
                Write-Host "  HTTP Error: Service running but not responding to HTTP" -ForegroundColor Yellow
            }
        }
        
        # Show what process is using the port
        try {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop | Select-Object -First 1
            $processInfo = Get-Process -Id $process.OwningProcess -ErrorAction Stop
            Write-Host "  Process: $($processInfo.ProcessName) (PID: $($processInfo.Id))" -ForegroundColor White
        }
        catch {
            Write-Host "  Process: Unknown" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "  Status: ❌ NOT LISTENING" -ForegroundColor Red
        Write-Host "  Action: Start your service on this port" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 What each port should be:" -ForegroundColor Blue
Write-Host "  3001: User Service (Authentication)" -ForegroundColor White
Write-Host "  8001: Product Service (Products & Categories)" -ForegroundColor White
Write-Host "  8002: Order Service (Cart & Orders)" -ForegroundColor White
Write-Host "  8080: WebSocket Service (Real-time updates)" -ForegroundColor White

Write-Host "`n💡 Quick troubleshooting:" -ForegroundColor Blue
Write-Host "  • Check if your backend project folders exist" -ForegroundColor White
Write-Host "  • Look for package.json or requirements.txt files" -ForegroundColor White
Write-Host "  • Run 'npm start' or 'python manage.py runserver' in each service folder" -ForegroundColor White
Write-Host "  • Check for port conflicts with other applications" -ForegroundColor White
