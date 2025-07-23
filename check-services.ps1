# Quick Backend Services Checker
Write-Host "🔍 Checking Backend Services..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$Port
    )
    
    Write-Host "Checking $ServiceName..." -NoNewline
    
    try {
        # Try health endpoint first
        $healthUrl = "$Url/health"
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host " ✅ RUNNING (Health Check OK)" -ForegroundColor Green
        return $true
    }
    catch {
        # If health endpoint fails, try basic connection
        try {
            $basicResponse = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            Write-Host " ⚠️  RUNNING (No Health Endpoint)" -ForegroundColor Yellow
            return $true
        }
        catch {
            # Try port connection
            try {
                $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
                if ($connection.TcpTestSucceeded) {
                    Write-Host " ⚠️  PORT OPEN (Service may be starting)" -ForegroundColor Yellow
                    return $false
                }
                else {
                    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
                    return $false
                }
            }
            catch {
                Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
                return $false
            }
        }
    }
}

# Check each service
$services = @(
    @{ Name = "User Service"; Url = "http://localhost:3001"; Port = 3001 },
    @{ Name = "Product Service"; Url = "http://localhost:8001"; Port = 8001 },
    @{ Name = "Order Service"; Url = "http://localhost:8002"; Port = 8002 },
    @{ Name = "WebSocket Service"; Url = "http://localhost:8080"; Port = 8080 }
)

$runningServices = 0
foreach ($service in $services) {
    if (Test-ServiceHealth -ServiceName $service.Name -Url $service.Url -Port $service.Port) {
        $runningServices++
    }
}

Write-Host "`n📊 Service Status Summary:" -ForegroundColor Blue
Write-Host "Running: $runningServices / $($services.Count)" -ForegroundColor $(if ($runningServices -eq $services.Count) { "Green" } else { "Yellow" })

if ($runningServices -eq $services.Count) {
    Write-Host "`n🎉 All services are running! Ready to start React app." -ForegroundColor Green
    Write-Host "Run: npm start" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some services are missing. Please start them before running the React app." -ForegroundColor Yellow
    
    Write-Host "`n🚀 Quick Start Commands:" -ForegroundColor Blue
    Write-Host "# For typical Node.js/Express services:" -ForegroundColor Gray
    Write-Host "cd user-service && npm start       # Port 3001" -ForegroundColor White
    Write-Host "cd product-service && npm start    # Port 8001" -ForegroundColor White  
    Write-Host "cd order-service && npm start      # Port 8002" -ForegroundColor White
    Write-Host "cd websocket-service && npm start  # Port 8080" -ForegroundColor White
    
    Write-Host "`n# For Python/Django services:" -ForegroundColor Gray
    Write-Host "python manage.py runserver 3001" -ForegroundColor White
    Write-Host "python manage.py runserver 8001" -ForegroundColor White
    Write-Host "python manage.py runserver 8002" -ForegroundColor White
}

Write-Host "`n🔗 Service URLs:" -ForegroundColor Blue
Write-Host "User Service:      http://localhost:3001" -ForegroundColor White
Write-Host "Product Service:   http://localhost:8001" -ForegroundColor White
Write-Host "Order Service:     http://localhost:8002" -ForegroundColor White
Write-Host "WebSocket Service: ws://localhost:8080" -ForegroundColor White
