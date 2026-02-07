# Skrypt pomocniczy do instalacji Node.js
# Uruchom jako Administrator: Right-click -> Run as Administrator

Write-Host "=== Instalator Node.js dla Unit Converter Hub ===" -ForegroundColor Cyan
Write-Host ""

# Sprawdź czy Node.js jest już zainstalowany
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if ($nodeInstalled) {
    Write-Host "✓ Node.js jest już zainstalowany!" -ForegroundColor Green
    Write-Host "  Wersja: $(node --version)" -ForegroundColor Green
    Write-Host "  npm: $(npm --version)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Możesz teraz uruchomić: npm install" -ForegroundColor Yellow
    exit 0
}

Write-Host "Node.js nie jest zainstalowany." -ForegroundColor Yellow
Write-Host ""

# Sprawdź dostępność winget
$wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue

if ($wingetAvailable) {
    Write-Host "Znaleziono winget. Próbuję zainstalować Node.js LTS..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        Write-Host ""
        Write-Host "✓ Instalacja zakończona!" -ForegroundColor Green
        Write-Host "Zrestartuj terminal i uruchom: npm install" -ForegroundColor Yellow
    } catch {
        Write-Host "✗ Błąd podczas instalacji przez winget" -ForegroundColor Red
        Write-Host "Spróbuj zainstalować ręcznie z: https://nodejs.org/" -ForegroundColor Yellow
    }
} else {
    Write-Host "winget nie jest dostępny." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Instrukcje ręcznej instalacji:" -ForegroundColor Cyan
    Write-Host "1. Otwórz przeglądarkę: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Pobierz wersję LTS" -ForegroundColor White
    Write-Host "3. Uruchom instalator" -ForegroundColor White
    Write-Host "4. Zaznacz 'Add to PATH' podczas instalacji" -ForegroundColor White
    Write-Host "5. Zrestartuj terminal" -ForegroundColor White
    Write-Host "6. Uruchom: npm install" -ForegroundColor White
    Write-Host ""
    
    # Otwórz stronę Node.js w przeglądarce
    $openBrowser = Read-Host "Czy chcesz otworzyć stronę Node.js w przeglądarce? (T/N)"
    if ($openBrowser -eq 'T' -or $openBrowser -eq 't') {
        Start-Process "https://nodejs.org/"
    }
}

Write-Host ""
Write-Host "Naciśnij Enter aby zakończyć..."
Read-Host

