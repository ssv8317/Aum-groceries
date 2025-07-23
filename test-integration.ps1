Write-Host "Testing Frontend Integration with User Service" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Test user service health
Write-Host "`n1. Testing User Service Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "User Service Health: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "User service not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
Write-Host "`n2. Testing Frontend React App..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend is running on port 3002" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user registration
Write-Host "`n3. Testing User Registration API..." -ForegroundColor Yellow
$testUser = @{
    firstName = "Test"
    lastName = "User"
    email = "test$(Get-Random)@example.com"
    password = "test123"
    phone = "$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $testUser -ContentType "application/json"
    Write-Host "User Registration: Success" -ForegroundColor Green
    Write-Host "   User ID: $($response.user._id)" -ForegroundColor Cyan
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Cyan
} catch {
    Write-Host "User registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user service endpoints
Write-Host "`n4. Testing API Endpoints..." -ForegroundColor Yellow
$endpoints = @(
    @{url="http://localhost:3001/health"; name="Health Check"},
    @{url="http://localhost:3001/api-docs"; name="API Documentation"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method GET -TimeoutSec 5
        Write-Host "$($endpoint.name): Available" -ForegroundColor Green
    } catch {
        Write-Host "$($endpoint.name): Not available" -ForegroundColor Red
    }
}

Write-Host "`nIntegration Summary:" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue
Write-Host "User Service: http://localhost:3001" -ForegroundColor White
Write-Host "API Documentation: http://localhost:3001/api-docs" -ForegroundColor White  
Write-Host "Frontend App: http://localhost:3002" -ForegroundColor White
Write-Host "MongoDB: localhost:27018" -ForegroundColor White
Write-Host "`nIntegration test complete!" -ForegroundColor Green
