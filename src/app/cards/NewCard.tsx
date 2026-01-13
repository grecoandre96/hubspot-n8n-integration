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
  />
));

const Extension = ({ fetchProperties }) => {
  const [data, setData] = useState({ name: '', id: '', email: '', loading: true });

  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    // Timeout di sicurezza
    const timer = setTimeout(() => {
      if (isMounted && data.loading) {
        setData(prev => ({ ...prev, loading: false }));
        setError('Timeout: Impossibile caricare i dati del contatto.');
      }
    }, 5000);

    fetchProperties(['firstname', 'lastname', 'hs_object_id', 'email'])
      .then((res) => {
        if (!isMounted) return;
        const fullName = `${res.firstname || ''} ${res.lastname || ''}`.trim() || 'Contatto';
        setData({
          name: fullName,
          id: res.hs_object_id,
          email: res.email || 'Nessuna email',
          loading: false
        });
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Errore fetchProperties:', err);
        setError(`Errore caricamento: ${err.message || JSON.stringify(err)}`);
        setData(prev => ({ ...prev, loading: false }));
      })
      .finally(() => clearTimeout(timer));

    return () => { isMounted = false; clearTimeout(timer); };
  }, [fetchProperties]);

  if (data.loading) return <LoadingSpinner label="Inizializzazione..." />;

  if (error) {
    return (
      <Box>
        <Heading>Integrazione n8n 📡</Heading>
        <Text>⚠️ {error}</Text>
        <Text>Verifica i permessi dell'app.</Text>
      </Box>
    );
  }

  // Costruiamo il link esattamente come se fosse da incollare nel browser
  const baseUrl = 'https://nutellone.app.n8n.cloud/webhook/9bbc2de1-a849-4309-a635-1dd7c0d0cb51';
  const params = new URLSearchParams({
    contactId: data.id,
    contactName: data.name,
    contactEmail: data.email,
    source: 'hubspot_link_click'
  }).toString();

  const targetUrl = `${baseUrl}?${params}`;

  return (
    <Box>
      <Heading>Integrazione n8n 📡</Heading>
      <Text>Contatto: <Text format={{ fontWeight: 'bold' }}>{data.name}</Text></Text>

      <Divider />

      <Flex direction="column" gap="medium" align="start" marginTop="medium">
        <Text>Clicca per avviare il workflow su n8n:</Text>
        <Button
          variant="primary"
          href={targetUrl}
          external={true}
        >
          Invia Dati a n8n 🚀
        </Button>
      </Flex>
    </Box>
  );
};