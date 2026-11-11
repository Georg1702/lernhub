# Lernhub

Öffentliche Startseite mit Links zum Mathe-Trainer und zum Englisch-Trainer. Statische Seite ohne Server und ohne Daten.

## Links eintragen

In `links.js` die Adressen der beiden Vercel-Projekte eintragen und committen. Leere Einträge zeigen „Link folgt“.

## Vercel

Projekt aus dem Repo importieren, Preset **Other**, keine Umgebungsvariablen. Build und Ausgabeordner stehen in `vercel.json` (`node build.mjs` → `dist/`). Suchmaschinen sind per `robots.txt` und `X-Robots-Tag` ausgesperrt.

## App-Symbol (PWA)

Manifest, Service Worker und Icons sind dabei. Android/Chrome: Knopf „Als App auf den Startbildschirm“ oder Menü → „App installieren“. iPhone/iPad: Safari → Teilen → „Zum Home-Bildschirm“. Funktioniert nur über HTTPS (Vercel). Die PNG-Icons zeichnet `build.mjs` beim Build (ohne Abhängigkeiten).
