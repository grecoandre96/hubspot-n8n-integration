# 🚀 Guida Setup - HubSpot to n8n Integration (Platform 2025.1)

## 📋 Panoramica Soluzione

Questa soluzione utilizza **HubSpot Platform 2025.1** con **Serverless Functions** per risolvere i problemi di CORS/CSP presenti in Platform 2025.2.

### Architettura

```
┌─────────────────┐
│  HubSpot Card   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ runServerless()
         ▼
┌─────────────────┐
│   Serverless    │
│    Function     │ ← Proxy sicuro
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│  n8n Webhook    │
│   (Automation)  │
└─────────────────┘
```

## 🛠️ Setup Passo-Passo

### 1. Prerequisiti

- [ ] Account HubSpot Developer (separato da produzione)
- [ ] HubSpot CLI installato: `npm install -g @hubspot/cli`
- [ ] Account n8n con webhook configurato
- [ ] Node.js v16+ installato

### 2. Configurazione HubSpot CLI

```bash
# Autenticazione con account developer
hs auth

# Verifica autenticazione
hs accounts list
```

### 3. Configurazione Secrets

Il webhook URL di n8n deve essere configurato come secret per sicurezza:

```bash
# Aggiungi il secret per n8n webhook
hs secrets add N8N_WEBHOOK_URL

# Quando richiesto, incolla l'URL del tuo webhook n8n
# Esempio: https://nutellone.app.n8n.cloud/webhook-test/YOUR-WEBHOOK-ID
```

### 4. Deploy del Progetto

```bash
# Dalla root del progetto
cd c:\Users\utente\Desktop\test-app

# Upload del progetto su HubSpot
hs project upload

# Segui le istruzioni per selezionare l'account developer
```

### 5. Installazione App nel CRM

1. Vai su **HubSpot Developer Portal** → [developers.hubspot.com](https://developers.hubspot.com)
2. Seleziona il tuo account developer
3. Trova il progetto `test-app`
4. Clicca su **"Install app"**
5. Autorizza i permessi richiesti:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`

### 6. Verifica Card nel CRM

1. Vai su **HubSpot CRM** → **Contacts**
2. Apri un contatto qualsiasi
3. Nella sidebar destra dovresti vedere la card **"HubSpot ➔ n8n"**
4. Clicca su **"Invia a n8n"** per testare

## 🧪 Testing

### Test Locale (Sviluppo)

```bash
# Avvia il dev server locale
hs project dev

# Questo permette di vedere i cambiamenti in tempo reale
```

### Verifica Logs

```bash
# Visualizza i log della serverless function
hs logs

# Filtra per la tua function
hs logs --function=sendToN8n
```

### Test n8n Webhook

Prima di testare da HubSpot, verifica che il webhook n8n funzioni:

```bash
# Test con curl
curl -X POST https://TUO_WEBHOOK_N8N_URL \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "test123",
    "contactName": "Test User",
    "contactEmail": "test@example.com",
    "timestamp": "2026-01-13T09:00:00Z",
    "source": "hubspot-card"
  }'
```

## 🔧 Troubleshooting

### Errore: "Function not found"

**Causa**: La serverless function non è stata deployata correttamente.

**Soluzione**:
```bash
hs project upload --force
```

### Errore: "Secret N8N_WEBHOOK_URL not found"

**Causa**: Il secret non è configurato.

**Soluzione**:
```bash
hs secrets add N8N_WEBHOOK_URL
```

### Errore: "n8n non ha risposto"

**Causa**: Il webhook n8n non è attivo o l'URL è errato.

**Soluzione**:
1. Verifica che il workflow n8n sia **attivo**
2. Verifica che il webhook node sia in modalità **"Production"**
3. Testa l'URL con curl (vedi sezione Testing)

### Card non appare nella sidebar

**Causa**: L'app non è installata o la configurazione è errata.

**Soluzione**:
1. Verifica in Developer Portal che l'app sia installata
2. Controlla `card-hsmeta.json` → `objectTypes` include `"contacts"`
3. Ricarica la pagina del contatto (Ctrl+F5)

## 📊 Monitoraggio

### Logs HubSpot

I log della serverless function sono visibili in:
- **Developer Portal** → **Logs**
- CLI: `hs logs --function=sendToN8n --tail`

### Logs n8n

Verifica le esecuzioni del workflow in n8n:
- **n8n UI** → **Executions**
- Filtra per il webhook node

## 🔄 Workflow di Sviluppo

### Branch Strategy

```
main                    → Codice stabile (Platform 2025.2 - backup)
develop-platform-2025.1 → Sviluppo attivo (Platform 2025.1)
```

### Ciclo di Sviluppo

1. **Sviluppo Locale**
   ```bash
   git checkout develop-platform-2025.1
   # Fai modifiche
   hs project dev  # Test locale
   ```

2. **Deploy su Developer Account**
   ```bash
   hs project upload
   # Test nel CRM developer
   ```

3. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: descrizione modifica"
   git push origin develop-platform-2025.1
   ```

4. **Deploy su Produzione** (quando pronto)
   ```bash
   # Cambia account HubSpot
   hs accounts use PRODUCTION_ACCOUNT
   
   # Deploy
   hs project upload
   ```

## 📚 Risorse Utili

- [HubSpot Serverless Functions Docs](https://developers.hubspot.com/docs/platform/serverless-functions)
- [HubSpot UI Extensions SDK](https://developers.hubspot.com/docs/platform/ui-extensions-sdk)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## 🎯 Prossimi Passi

- [ ] Configurare secrets per n8n webhook
- [ ] Deploy su account developer
- [ ] Testare integrazione end-to-end
- [ ] Documentare casi d'uso specifici
- [ ] Pianificare deploy su produzione

---

**Nota**: Questa è la versione con Platform 2025.1 + Serverless Functions che risolve i problemi di CSP/CORS della versione 2025.2.
