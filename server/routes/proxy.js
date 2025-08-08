const express = require('express');
const https = require('https');
const router = express.Router();

// Proxy route for Google profile images
router.get('/google-image/:encodedUrl', async (req, res) => {
  try {
    const { encodedUrl } = req.params;
    const imageUrl = decodeURIComponent(encodedUrl);
    
    // Validate that it's a Google profile image URL
    if (!imageUrl.startsWith('https://lh3.googleusercontent.com/')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    https.get(imageUrl, (imageRes) => {
      // Set appropriate headers
      res.setHeader('Content-Type', imageRes.headers['content-type']);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Pipe the image data to the response
      imageRes.pipe(res);
    }).on('error', (err) => {
      console.error('Error fetching image:', err);
      res.status(500).json({ error: 'Failed to fetch image' });
    });
  } catch (error) {
    console.error('Error in image proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
