const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Sajikan file frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint default untuk root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Parse JSON request bodies
app.use(express.json());
app.use(express.static('public'));  // Serve static HTML files

// API endpoint to resolve TikTok short URL
app.post('/resolve-url', async (req, res) => {
    const { videoUrl } = req.body;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Short URL is required' });
    }

    try {
        // Send a GET request to the short URL and follow redirects
        const response = await axios.get(videoUrl, { maxRedirects: 5 });

        // Get the final redirected URL
        const fullUrl = response.request.res.responseUrl;
        res.json({ fullUrl });
    } catch (error) {
        console.error("Error resolving TikTok URL:", error);
        res.status(500).json({ error: 'Failed to resolve URL' });
    }
});
// Endpoint untuk memproses permintaan ke API TikTok
app.get('/api/tiktok', async (req, res) => {
    const videoUrl = req.query.videoUrl;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
        const response = await axios.get(
            'https://tiktok-video-downloader-api.p.rapidapi.com/media',
            {
                params: { videoUrl },
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
                },
            }
        );

        const videoData = response.data; 
        console.log(response.data)
        console.log(videoData)
          console.log(videoData.downloadUrl)
        res.json({
            downloadUrl: videoData.downloadUrl, // Kirim downloadUrl ke frontend
            ...videoData, // Menambahkan data lainnya jika diperlukan
        });
    } catch (error) {
        console.error('Error fetching TikTok video:', error.message);
       
        res.status(500).json({ error: 'Failed to fetch video data' });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
