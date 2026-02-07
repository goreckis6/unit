# Instrukcja Instalacji - Node.js i Zależności

## Krok 1: Zainstaluj Node.js

### Opcja A: Pobierz z oficjalnej strony (Zalecane)

1. Otwórz przeglądarkę i przejdź do: **https://nodejs.org/**
2. Pobierz wersję **LTS** (Long Term Support) - zalecana
3. Uruchom pobrany instalator (np. `node-v20.x.x-x64.msi`)
4. Postępuj zgodnie z instrukcjami instalatora
5. **WAŻNE**: Zaznacz opcję "Add to PATH" podczas instalacji
6. Po zakończeniu instalacji, **zrestartuj terminal/PowerShell**

### Opcja B: Użyj winget (jeśli dostępne)

Otwórz PowerShell jako Administrator i uruchom:
```powershell
winget install OpenJS.NodeJS.LTS
```

### Opcja C: Użyj Chocolatey (jeśli zainstalowany)

Otwórz PowerShell jako Administrator i uruchom:
```powershell
choco install nodejs-lts
```

## Krok 2: Sprawdź instalację

Otwórz **NOWY** terminal/PowerShell i uruchom:

```powershell
node --version
npm --version
```

Powinny pojawić się numery wersji (np. `v20.11.0` i `10.2.4`)

## Krok 3: Zainstaluj zależności projektu

W katalogu projektu (`C:\Users\Użytkownik\unit`) uruchom:

```powershell
npm install
```

## Krok 4: Uruchom serwer deweloperski

```powershell
npm run dev
```

Strona będzie dostępna pod adresem: **http://localhost:5173**

## Rozwiązywanie problemów

### Problem: "node is not recognized"
- **Rozwiązanie**: Zrestartuj terminal po instalacji Node.js
- Sprawdź czy Node.js jest w PATH: `$env:PATH -split ';' | Select-String node`

### Problem: Błędy podczas `npm install`
- Upewnij się, że masz połączenie z internetem
- Spróbuj: `npm install --legacy-peer-deps`

### Problem: Port 5173 zajęty
- Zmień port w `vite.config.js` lub zamknij proces używający portu 5173

## Wymagania systemowe

- Windows 10 lub nowszy
- Połączenie z internetem
- ~200 MB wolnego miejsca na dysku

