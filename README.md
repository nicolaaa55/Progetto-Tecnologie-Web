# WikiBlank

WikiBlank e' un'applicazione web per la ricostruzione di testi oscurati tratti
da articoli di Wikipedia dedicati ad artisti.

## Tecnologie

- **Frontend:** Angular e Bootstrap;
- **Backend:** Node.js ed Express;
- **Persistenza:** SQLite con Sequelize;
- **Test:** Vitest e Cypress.

## Requisiti

- Node.js 20 o versione successiva;
- npm 10 o versione successiva;
- connessione a Internet per il recupero degli articoli Wikipedia.

## Configurazione

Il backend richiede un file `.env` nella cartella `backend`. Crearlo copiando `backend/.env.example` e impostando una chiave
segreta per i token JWT:

```powershell
cd backend
copy .env.example .env
```

Il file `.env` deve contenere almeno:

```env
JWT_SECRET=inserire_chiave_segreta
FRONTEND_ORIGIN=http://localhost:4200
PORT=3000
```

`JWT_SECRET` e' obbligatoria e non deve essere condivisa o pubblicata.
`FRONTEND_ORIGIN` e' opzionale; se omessa, viene utilizzato
`http://localhost:4200`.
`PORT` e' opzionale e indica la porta del backend; se omessa, viene utilizzata
la porta `3000`.

Se si modifica `PORT`, aggiornare allo stesso modo l'URL API in
`frontend/src/environments/environment.ts`.

Il file `.env` e' escluso dal controllo versione. Il database SQLite
`backend/wikiblank.sqlite` viene creato automaticamente all'avvio del backend.

L'indirizzo dell'API utilizzato dal frontend e' configurato in
`frontend/src/environments/environment.ts` e, in ambiente locale,
deve corrispondere a `http://localhost:3000/api`.

## Installazione

Dalla cartella principale del progetto:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

## Avvio

Avviare il backend dalla cartella `backend`:

```powershell
cd backend
npm start
```

Il backend sara' disponibile su `http://localhost:3000`.

In un secondo terminale, avviare il frontend dalla cartella `frontend`:

```powershell
cd frontend
npm start
```

Il frontend sara' disponibile su `http://localhost:4200`.

## Build e test

I comandi seguenti vanno eseguiti dalla cartella `frontend`:

```powershell
npm run build
npm test -- --watch=false
npx cypress run
```

I test Cypress richiedono che backend e frontend siano gia' in esecuzione e
una connessione attiva a Wikipedia.
