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
    runServerless={actions.runServerlessFunction}
  />
));

const Extension = ({ fetchProperties, sendAlert, runServerless }) => {
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

    try {
      // Chiamata alla serverless function invece che direttamente a n8n
      const response = await runServerless({
        name: 'sendToN8n',
        parameters: {
          contactId: data.id,
          contactName: data.name,
          contactEmail: data.email
        }
      });

      if (response.success) {
        sendAlert({
          title: '✅ Successo!',
          message: 'Dati inviati correttamente a n8n.',
          type: 'success'
        });
      } else {
        sendAlert({
          title: '⚠️ Errore n8n',
          message: response.message || 'Errore durante l\'invio',
          type: 'danger'
        });
      }
    } catch (error) {
      console.error('Errore serverless function:', error);
      sendAlert({
        title: '❌ Errore',
        message: 'Impossibile comunicare con n8n. Verifica la configurazione.',
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