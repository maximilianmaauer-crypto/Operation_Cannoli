# Operation Cannoli – GitHub Pages Website

## Upload

1. ZIP entpacken.
2. Den Inhalt des Ordners hochladen, nicht den Ordner selbst.
3. `index.html`, `css/`, `js/`, `images/` und alle Unterseiten müssen direkt im Repository-Hauptverzeichnis liegen.
4. GitHub Pages aktivieren: `Settings → Pages → Deploy from branch → main → /(root)`.

## Gemeinsame Einkaufsliste aktivieren

GitHub Pages ist statisch. Kommentare können deshalb nicht für alle sichtbar gespeichert werden, solange keine Datenbank angebunden ist. Diese Version ist bereits für **Firebase Firestore** vorbereitet.

### Firebase-Schritte

1. Firebase öffnen: https://console.firebase.google.com/
2. Neues Projekt erstellen, z. B. `operation-cannoli`.
3. Firestore Database aktivieren.
4. Web-App hinzufügen.
5. Die angezeigte Firebase-Konfiguration in `js/firebase-config.js` einfügen.
6. In Firestore unter `Rules` diese Regeln setzen:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shopping_wishes/{docId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}
```

Danach sind Einträge auf der Seite `einkaufsliste.html` für alle Besucher:innen sichtbar.

Hinweis: Diese Regeln erlauben allen Personen mit dem Link, neue Wünsche einzutragen. Für eine private Lösung wären Login oder ein geschütztes Formular nötig.
