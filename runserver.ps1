# Run Django server using the project's virtual environment.
# Use this from any directory, or run: .\venv\Scripts\python.exe manage.py runserver from backend.
$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$VenvPython = Join-Path $ProjectRoot "venv\Scripts\python.exe"
$ManagePy = Join-Path $ProjectRoot "manage.py"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Virtual environment not found. Create it with:" -ForegroundColor Red
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  .\venv\Scripts\pip.exe install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

& $VenvPython $ManagePy runserver @args
