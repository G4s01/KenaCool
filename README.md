# KenaCool

Automatizza e normalizza la lista degli operatori (donor) sulle pagine prodotto Kena Mobile e sincronizza i rispettivi input hidden richiesti dal form.

KenaCool è disponibile in due forme:
- Userscript per Tampermonkey: file `KenaCool.js`
- Bookmarklet (favlet): file `KenaCool.favlet` e versione minimizzata `KenaCool.min.favlet`

Entrambe le soluzioni:
- Mantengono la lista degli operatori in ordine alfabetico (locale “it”) in base al campo `name`
- Inseriscono solo gli operatori mancanti, senza duplicare quelli già presenti
- Aggiornano/creano gli input hidden `valid_operators` coerenti con il menu
- Mostrano un toast di conferma con il numero di operatori effettivamente aggiunti:
  - Messaggio: `✅ X OPERATORI AGGIUNTI`


## Perché usarlo

Le pagine prodotto possono contenere liste parziali, alias o voci disallineate degli operatori. KenaCool ricostruisce il blocco degli operatori in modo deterministico e coerente, garantendo:
- ordine alfabetico stabile
- completezza (tutti gli operatori previsti, se mancanti)
- persistenza degli input hidden necessari al submit


## File inclusi

- `KenaCool.js`
  - Userscript per Tampermonkey/Greasemonkey
  - Esegue automaticamente sulle pagine `https://www.kenamobile.it/prodotto/*`
  - Ordina e completa la `<select id="operator">`, sincronizza gli input hidden, mostra il toast
  - Preserva la selezione correntemente impostata nel menu

- `KenaCool.favlet`
  - Bookmarklet leggibile (non minificato), invocabile a richiesta con un clic sul preferito
  - Ordina/sposta le option già presenti e crea solo le mancanti, come lo userscript
  - Non tocca eventuali option fuori lista (es. alias del sito): il blocco ordinato degli operatori compare subito dopo “Seleziona”

- `KenaCool.min.favlet`
  - Bookmarklet minimizzato, identico per funzionalità al favlet “non min”
  - Consigliato per l’uso quotidiano perché più corto e in genere più compatibile nelle barre dei preferiti


## Come funziona (in breve)

1. Mantiene un elenco “canonico” di operatori con `code` (valore usato dal server) e `name` (etichetta visuale).
2. Crea una copia ordinata alfabeticamente (locale `it`) di tale elenco.
3. Nel menu `<select id="operator">`:
   - sposta le voci già presenti che corrispondono alla lista canonica
   - crea soltanto le option mancanti, nell’ordine alfabetico
4. Negli input hidden:
   - aggiunge, accanto a `#numberToCheck`, gli input `name="valid_operators"` mancanti per ogni `code`
5. Mostra un toast con il numero di operatori effettivamente creati (non conteggia gli spostamenti).

Nota su alias/duplicati esterni:
- Se la pagina contiene voci “alias” o voci non presenti nell’elenco canonico (es. una option con `value="ovunque"`), queste non vengono rimosse dal favlet né dallo script; il blocco degli operatori canonici rimane comunque ordinato subito dopo “Seleziona”.


## Installazione

### Userscript (KenaCool.js)

1. Installa [Tampermonkey](https://www.tampermonkey.net/) (o Greasemonkey/Violentmonkey) sul tuo browser.
2. Crea un nuovo script e incolla il contenuto di `KenaCool.js`.
3. Salva. Lo script si attiverà automaticamente sulle pagine `https://www.kenamobile.it/prodotto/*`.

Verifica rapida:
- Apri una pagina prodotto Kena.
- Dovresti vedere la lista operatori completata e ordinata, e un toast “✅ X OPERATORI AGGIUNTI” alla prima esecuzione.


### Bookmarklet (KenaCool.favlet o KenaCool.min.favlet)

1. Crea un nuovo preferito nel browser.
2. Incolla nel campo URL l’intero contenuto di:
   - `KenaCool.favlet` (leggibile), oppure
   - `KenaCool.min.favlet` (minimizzato)
3. Vai su una pagina prodotto Kena e clicca il preferito per applicare le modifiche.

Suggerimenti:
- Assicurati che l’URL inizi con `javascript:` (alcune UI lo rimuovono durante l’incolla).
- Se il browser non consente di incollare direttamente, crea un preferito qualsiasi e poi modifica il campo URL incollando il codice.


## Risoluzione problemi

- Non vedo il toast ma la lista è ordinata:
  - Probabilmente non c’erano operatori mancanti da creare (solo spostamenti). È normale: il toast si mostra solo se viene creato almeno un elemento.
- Ho ancora voci duplicate:
  - Se sono alias presenti nella pagina e non inclusi nella lista canonica, verranno lasciati intatti. Il blocco degli operatori “canonici” sarà comunque ordinato e completo.
- Il bookmarklet non parte:
  - Verifica che l’URL del preferito inizi con `javascript:`.
  - Prova la versione minimizzata (`KenaCool.min.favlet`) che è più breve e spesso meglio supportata dalle barre dei preferiti.


## Sicurezza e responsabilità

Questo progetto modifica esclusivamente il DOM nel tuo browser per uniformare il menu e i dati del form. Il flusso di portabilità è soggetto a regole e validazioni server-side di Kena Mobile. L’uso è a tuo rischio:
- scopo principale: test, automazione e analisi personale
- nessuna garanzia di accettazione server-side dei valori inseriti
- l’autore non si assume responsabilità per conseguenze di utilizzo improprio

Usa responsabilmente o, meglio ancora, non usare.
