# Support-Ticket-System der Swiftly

Ein internes Ticket-System für die Bearbeitung von internen Anfragen der Mitarbeiter.

## Überblick

Das Support-Ticket-System wurde ausschließlich für die interne Verwendung bei Swiftly entwickelt und ermöglicht die effiziente Erfassung, Verwaltung und Bearbeitung von Support-Anfragen der Mitarbeiter. Das System bietet eine übersichtliche Benutzeroberfläche für das IT-Support-Team, um die internen Anfragen schnell zu bearbeiten und den Status von Tickets zu verfolgen.

## Funktionen

- **Benutzerauthentifizierung**: Sichere Anmeldung für Support-Team und Mitarbeiter
- **Ticket-Erstellung**: Einfaches Erstellen von internen Support-Tickets durch Mitarbeiter
- **Ticket-Verwaltung**: Übersicht aller offenen und geschlossenen internen Tickets
- **Statusverfolgung**: Aktueller Bearbeitungsstatus jedes Tickets
- **Dashboard**: Visualisierung wichtiger Support-Kennzahlen für das IT-Team
- **Benutzerrechte**: Unterschiedliche Zugriffsebenen für reguläre Mitarbeiter und Support-Administratoren

## Technische Details

Das Projekt besteht aus zwei Hauptkomponenten:

### Frontend

- React mit Vite als Build-Tool
- Modernes UI-Design mit angepasstem CSS
- Reaktive Komponenten für Echtzeitaktualisierungen
- Netlify Deployment-Konfiguration befindet sich zentral in der Datei `../netlify.toml` (Root). Eigene `netlify.toml` im Frontend-Ordner wurde entfernt, um Parsing-Konflikte in CI zu vermeiden.

### Backend

- Node.js mit Express als Server-Framework
- MongoDB zur Datenspeicherung
- JWT-basierte Authentifizierung
- RESTful API für die Kommunikation mit dem Frontend

## Installation und Start

1. Frontend und Backend Abhängigkeiten installieren:

```bash
npm install
cd backend && npm install
```

2. Frontend starten:

```bash
npm run dev
```

3. Backend starten:

```bash
cd backend && npm run dev
```

## Entwickelt für

Swiftly - Internes IT-Support-Team zur Bearbeitung von Mitarbeiteranfragen
