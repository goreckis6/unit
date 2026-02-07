# Jak Uruchomić Projekt

## ⚠️ Wymagania

**Node.js musi być zainstalowany!**

Jeśli widzisz błąd `npm is not recognized`, musisz najpierw zainstalować Node.js:

1. Pobierz z: **https://nodejs.org/** (wersja LTS)
2. Uruchom instalator
3. **Zrestartuj terminal** po instalacji
4. Sprawdź: `node --version` i `npm --version`

## 🚀 Sposoby Uruchomienia

### Sposób 1: Użyj pliku run.bat (Najłatwiejszy)

Po zainstalowaniu Node.js, po prostu kliknij dwukrotnie na plik:
```
run.bat
```

Lub w terminalu:
```cmd
run.bat
```

### Sposób 2: Ręczne uruchomienie

1. **Zainstaluj zależności** (tylko pierwszy raz):
   ```cmd
   npm install
   ```

2. **Uruchom serwer deweloperski**:
   ```cmd
   npm run dev
   ```

3. **Otwórz przeglądarkę** i przejdź do:
   ```
   http://localhost:5173
   ```

## 📝 Co dalej?

- Strona główna: `http://localhost:5173/`
- Kalkulator ułamków: `http://localhost:5173/calculators/subtracting-fractions`
- Aby zatrzymać serwer: naciśnij `Ctrl+C` w terminalu

## 🔧 Rozwiązywanie problemów

### "npm is not recognized"
→ Zainstaluj Node.js i zrestartuj terminal

### "Port 5173 is already in use"
→ Zamknij inne aplikacje używające tego portu lub zmień port w `vite.config.js`

### Błędy podczas `npm install`
→ Sprawdź połączenie z internetem i spróbuj ponownie

