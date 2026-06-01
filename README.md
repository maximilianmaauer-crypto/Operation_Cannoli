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


## Firebase-Status

Die Datei `js/firebase-config.js` wurde mit der Firebase-Web-App-Konfiguration gefüllt. Falls die Einkaufsliste dennoch nicht lädt, müssen in Firebase Firestore die Regeln für `shopping_wishes` veröffentlicht und die Website über GitHub Pages neu deployed werden.

## Update A&H-Banner
Der Buttontext wurde zu „Ja, ich will eine scheißteure Lebensversicherung“ geändert. Beim Klick dreht sich das A&H-Fenster überdreht aus dem Bild und wird danach im Browser gespeichert ausgeblendet. Zum erneuten Testen: `?resetBanner=1` an die URL anhängen.
