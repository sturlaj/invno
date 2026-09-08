# invno

Static site for **www.inv.no**, hosted on GitHub Pages from the `main` branch (root).

## Local preview

```sh
python -m http.server 8000
```

Then open http://localhost:8000

## Deploy

Push to `main`. GitHub Pages rebuilds automatically.

## GitHub account

This repo lives under the `sturlaj` account. The `gh` CLI in this folder uses a
folder-scoped config so it does not disturb the globally logged-in account:

```powershell
$env:GH_CONFIG_DIR = "$PWD\.ghconfig"
gh repo view
```
