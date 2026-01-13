import React, { useState, useEffect } from 'react';
import {
  Text,
  Button,
  Heading,
  Flex,
  Box,
  Divider,
  LoadingSpinner,
  hubspot,
} from '@hubspot/ui-extensions';

hubspot.extend(({ actions }) => (
  <Extension
    fetchProperties={actions.fetchCrmObjectProperties}
    sendAlert={actions.addAlert}
  />
));

const Extension = ({ fetchProperties, sendAlert }) => {
  const [data, setData] = useState({ name: '', id: '', email: '', loading: true });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProperties(['firstname', 'lastname', 'hs_object_id', 'email'])
      .then((res) => {
        const fullName = `${res.firstname || ''} ${res.lastname || ''}`.trim() || 'Contatto';
        setData({
          name: fullName,
          id: res.hs_object_id,
          email: res.email || 'Nessuna email',
          loading: false
        });
      })
      .catch(() => setData((prev) => ({ ...prev, loading: false })));
  }, [fetchProperties]);

  const triggerN8n = async () => {
    setSending(true);
    const WEBHOOK_URL = 'https://nutellone.app.n8n.cloud/webhook-test/9bbc2de1-a849-4309-a635-1dd7c0d0cb51';

    try {
      // Usiamo JSON.stringify per essere sicuri che n8n accetti il formato (evita errore 400)
      const response = await hubspot.fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contactId: data.id,
          contactName: data.name,
          contactEmail: data.email,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        sendAlert({
          title: 'Grande!',
          message: 'Dati ricevuti da n8n correttamente.',
          type: 'success'
        });
      } else {
        // Se n8n dà ancora errore, leggiamo il motivo
        sendAlert({ title: 'Errore n8n', message: `Stato: ${response.status}`, type: 'danger' });
      }
    } catch (error) {
      sendAlert({
        title: 'Attenzione',
        message: 'Controlla che il nodo Webhook su n8n sia in modalità "Execute Workflow".',
        type: 'warning'
      });
    } finally {
      setSending(false);
    }
  };

  if (data.loading) return <LoadingSpinner label="Inizializzazione..." />;

  return (
    <Box>
      <Heading>HubSpot ➔ n8n</Heading>
      <Text>Invio dati di: <Text format={{ fontWeight: 'bold' }}>{data.name}</Text></Text>

      <Divider />

      <Flex direction="column" gap="medium" align="start" marginTop="medium">
        <Button
          variant="primary"
          onClick={triggerN8n}
          loading={sending}
        >
          {sending ? 'Comunicazione...' : 'Invia a n8n'}
        </Button>
      </Flex>
    </Box>
  );
};