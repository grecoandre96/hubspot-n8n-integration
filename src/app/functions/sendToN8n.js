const axios = require('axios');

/**
 * Serverless Function: Proxy per n8n
 * 
 * Questa function fa da intermediario sicuro tra la UI Extension Card
 * e il webhook n8n, risolvendo problemi di CORS e CSP.
 * 
 * @param {object} context - Contesto HubSpot con secrets e parametri
 * @returns {object} Response con status e messaggio
 */
exports.main = async (context = {}) => {
    const { contactId, contactName, contactEmail } = context.parameters;

    // URL del webhook n8n (configurabile tramite secrets)
    const N8N_WEBHOOK_URL = context.secrets.N8N_WEBHOOK_URL ||
        'https://nutellone.app.n8n.cloud/webhook-test/9bbc2de1-a849-4309-a635-1dd7c0d0cb51';

    try {
        // Validazione input
        if (!contactId) {
            return {
                statusCode: 400,
                body: {
                    success: false,
                    message: 'Contact ID è richiesto'
                }
            };
        }

        // Prepara i dati da inviare a n8n
        const payload = {
            contactId,
            contactName: contactName || 'N/A',
            contactEmail: contactEmail || 'N/A',
            timestamp: new Date().toISOString(),
            source: 'hubspot-card'
        };

        // Log per debugging (visibile nei log HubSpot)
        console.log('Invio dati a n8n:', payload);

        // Chiamata al webhook n8n
        const response = await axios.post(N8N_WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 secondi timeout
        });

        console.log('Risposta n8n:', response.status);

        // Risposta di successo
        return {
            statusCode: 200,
            body: {
                success: true,
                message: 'Dati inviati con successo a n8n',
                n8nResponse: response.data
            }
        };

    } catch (error) {
        // Gestione errori dettagliata
        console.error('Errore invio a n8n:', error.message);

        let errorMessage = 'Errore durante l\'invio a n8n';
        let statusCode = 500;

        if (error.response) {
            // Errore dalla risposta n8n
            statusCode = error.response.status;
            errorMessage = `n8n ha risposto con errore ${statusCode}`;
            console.error('Dettagli errore n8n:', error.response.data);
        } else if (error.request) {
            // Nessuna risposta ricevuta
            errorMessage = 'n8n non ha risposto. Verifica che il webhook sia attivo.';
            console.error('Nessuna risposta da n8n');
        } else {
            // Errore nella configurazione della richiesta
            errorMessage = error.message;
        }

        return {
            statusCode: statusCode,
            body: {
                success: false,
                message: errorMessage,
                error: error.message
            }
        };
    }
};
