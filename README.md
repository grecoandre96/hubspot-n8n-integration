# HubSpot to n8n Integration Card

Integrazione personalizzata tra HubSpot e n8n tramite UI Extension Card.

## 📋 Descrizione

Questa card personalizzata di HubSpot permette di inviare dati dei contatti a n8n per automazioni avanzate. La card viene visualizzata nella sidebar dei record contatti in HubSpot CRM.

## 🏗️ Architettura

- **Platform Version**: HubSpot Platform 2025.2
- **Type**: UI Extension Card
- **Location**: CRM Record Sidebar (Contacts)
- **Integration**: n8n Webhook

## 📁 Struttura Progetto

```
test-app/
├── src/
│   └── app/
│       ├── app-hsmeta.json          # Configurazione app principale
│       └── cards/
│           ├── card-hsmeta.json     # Configurazione card
│           └── NewCard.tsx          # Componente React della card
├── hsproject.json                    # Configurazione progetto HubSpot
└── README.md
```

## 🚀 Setup

### Prerequisiti

- Node.js (v16 o superiore)
- Account HubSpot Developer
- Account n8n con webhook configurato
- HubSpot CLI installato

### Installazione

```bash
# Installa HubSpot CLI (se non già installato)
npm install -g @hubspot/cli

# Autenticazione con HubSpot
hs auth

# Deploy del progetto
hs project upload
```

## 🔧 Configurazione

### 1. Webhook n8n

Aggiorna l'URL del webhook in `src/app/cards/NewCard.tsx`:

```typescript
const WEBHOOK_URL = 'TUO_WEBHOOK_N8N_URL';
```

### 2. Permessi App

L'app richiede i seguenti scope OAuth:
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

### 3. URL Permessi

Gli URL esterni permessi sono configurati in `app-hsmeta.json`:
- `https://api.hubapi.com`
- `https://nutellone.app.n8n.cloud`

## 📝 Funzionalità

- ✅ Recupero automatico dati contatto (nome, email, ID)
- ✅ Invio dati a n8n tramite webhook
- ✅ Feedback visivo con alert di successo/errore
- ✅ Loading states per UX ottimale

## 🐛 Problemi Noti

### Errore n8n Banner Rosso

**Problema**: Platform 2025.2 ha un bug noto con `hubspot.fetch()` e `permittedUrls` che causa errori CSP.

**Soluzioni**:
1. Downgrade a Platform 2025.1 + Serverless Function (raccomandato)
2. Esternalizzare logica su Vercel/AWS Lambda
3. Attendere Platform 2026.03 (marzo 2026)

## 📚 Risorse

- [HubSpot UI Extensions Documentation](https://developers.hubspot.com/docs/platform/ui-extensions-sdk)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [HubSpot Developer Community](https://community.hubspot.com/t5/APIs-Integrations/ct-p/apis)

## 📄 Licenza

Progetto privato - Uso interno

## 👤 Autore

Sviluppato per integrare HubSpot CRM con automazioni n8n

---

**Nota**: Questo è lo stato del progetto prima della migrazione a Platform 2025.1 con serverless functions.
