
#!/usr/bin/env bash
# Quick local sanity checks (run manually in PowerShell or git bash)
node -v
npm -v
npx tsc --noEmit
npx --no-install next build
