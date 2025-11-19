# Clear Next.js Cache

Om du fortfarande ser build errors efter att filerna är fixade, kör dessa kommandon:

```powershell
# 1. Stoppa dev-servern (Ctrl+C)

# 2. Rensa Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Rensa node_modules cache (valfritt)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 4. Starta om dev-servern
npm run dev
```

Om problemet kvarstår, prova även:
```powershell
# Full reinstall (sista utvägen)
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
npm run dev
```

