const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/maps/autosuggest?query=...
router.get('/autosuggest', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
      params: {
        'api-version': '1.0',
        'typeahead': true,
        'subscription-key': process.env.AZURE_MAPS_KEY,
        'query': query
      }
    });
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: 'Azure Maps API error', details: err.message });
  }
});

module.exports = router;