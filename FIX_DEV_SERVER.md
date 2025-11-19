# Fix Next.js Dev Server Lock Issue

## Problem
```
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

## Lösningar

### Snabb fix (rekommenderad)
```powershell
# 1. Stoppa alla Node processer
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. Ta bort .next mappen
Remove-Item .next -Recurse -Force

# 3. Starta servern igen
npm run dev
```

### Alternativ: Bara ta bort lock-filen
```powershell
Remove-Item .next\dev\lock -Force
npm run dev
```

### Om port 3000 är upptagen
```powershell
# Hitta processen som använder port 3000
netstat -ano | findstr :3000

# Döda processen (ersätt PID med det du hittade)
Stop-Process -Id <PID> -Force
```

### Använd annan port
```powershell
# Starta på port 3001
npm run dev -- -p 3001
```

## Automatisk fix script
Spara som `fix-dev.ps1`:
```powershell
Write-Host "Stopping Node processes..."
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Removing .next folder..."
if (Test-Path .next) {
    Remove-Item .next -Recurse -Force
}

Write-Host "Starting dev server..."
npm run dev
```

Kör med: `.\fix-dev.ps1`

