const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const chromaprint = require('chromaprint');

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.REACT_NATIVE_APP_URL;
const supabaseKey = process.env.REACT_NATIVE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Endpoint to upload a song
app.post('/upload', upload.single('song'), async (req, res) => {
    const songBuffer = req.file.buffer;
    const { title, artist, album, genre, release_year, track_number, duration, album_art_url } = req.body;
  });