# 🎙️ VoiceNote AI

Trascrivi la voce in testo, segmenta per parlanti, aggiungi punteggiatura, genera riassunti e traduzioni: tutto in **un'unica web app minimale**.  

- 🗣️ **Trascrizione live** con Web Speech API  
- 👥 **Diarizzazione** (scelta del numero di speaker o auto)  
- ✍️ **Punteggiatura e correzioni** automatiche  
- 📑 **Riassunto** intelligente  
- 🌍 **Traduzione** multilingua  
- 💾 **Gestione sessioni** con salvataggio locale  
- 🔑 **Autenticazione opzionale** via Supabase  

Creato da **Antonio Cioffi**, studente di Ingegneria Informatica.  

---

## 🚀 Caratteristiche principali
- **Trascrizione live**: acquisizione audio via microfono (Web Speech API).  
- **Diarizzazione assistita**: segmentazione per parlanti (1, 2, 3, Auto).  
- **Rifinitura testo**: punteggiatura e correzioni automatiche in base alla lingua.  
- **Riassunto**: sintesi del testo generata dall’AI.  
- **Traduzione**: output nella lingua target desiderata.  
- **Gestione sessioni**: salvataggio in `LocalStorage`, caricamento rapido ed eliminazione.  
- **Autenticazione opzionale**: login/logout con **Supabase** (le sessioni rimangono comunque in locale).  

---

## 🛠️ Stack tecnologico
- **Frontend**: React + Vite + TypeScript + Tailwind CSS  
- **AI**: `@google/genai` (modello: `gemini-2.5-flash-lite-preview-06-17`)  
- **Auth / BaaS**: Supabase (`@supabase/supabase-js`)  

---

## 📦 Requisiti
- Node.js **18+** (consigliato LTS)  
- Browser con supporto a Web Speech API (Chrome/Edge)  
- HTTPS per accesso al microfono (su domini remoti)  

---

## ⚡ Avvio rapido
1. Clona il repository e installa le dipendenze:
   ```bash
   npm install
Configura la chiave API Gemini creando un file .env.local:


📜 Script disponibili
Sviluppo → npm run dev

Build produzione → npm run build

Anteprima build → npm run preview

🔑 Variabili d’ambiente
GEMINI_API_KEY → chiave API Gemini (necessaria per riassunto/diarizzazione/traduzione).

⚠️ Nota: nel build client-side la chiave può essere esposta. Per ambienti di produzione valuta un backend/proxy che firmi le richieste o applichi quote/regole.

🖥️ Utilizzo
Concedi il permesso al microfono.

Seleziona lingua e numero di parlanti.

Premi “Avvia registrazione” e poi “Ferma” quando hai finito.

Visualizza la trascrizione e scegli se:

Generare un riassunto

Effettuare una traduzione

Salva la sessione in locale o accedi per gestione personalizzata.


⚙️ Dettagli tecnici
La chiave Gemini è gestita via vite.config.ts con loadEnv.

Trascrizione live basata su Web Speech API (se non supportata → avviso).

Sessioni salvate in LocalStorage (voicenote_sessions).

Supabase gestisce solo l’autenticazione.

🌐 Compatibilità
✅ Chrome / Edge (desktop)

⚠️ Safari e alcuni browser mobile → limitazioni note

🔒 Richiede permesso microfono e HTTPS

🧩 Troubleshooting
API Key mancante → verifica .env.local e riavvia dev server.

Quota superata / errore modello → i messaggi di errore Gemini sono mostrati in UI.

Nessuna trascrizione → controlla supporto Web Speech API e permessi microfono.

🔒 Sicurezza e privacy
L’audio è processato localmente via Web Speech API.

Testo e richieste AI passano ai server Gemini. Non inserire dati sensibili.

Per la produzione: backend/proxy consigliato per nascondere la chiave API.

🗺️ Roadmap
🔄 Salvataggio sessioni su Supabase (database remoto)

📤 Export PDF/Markdown delle trascrizioni

📱 Miglior supporto mobile e fallback di riconoscimento vocale

📄 Licenza
Distribuito sotto licenza MIT – vedi LICENSE.

👨‍💻 Autore
Creato da Antonio Cioffi
Studente di Ingegneria Informatica – Università Telematica Uninettuno
