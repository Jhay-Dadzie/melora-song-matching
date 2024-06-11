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

    // Generate fingerprint
    const fingerprint = await chromaprint.songBuffer(songBuffer);

    // Save song to Supabase
    const { data: songData, error: songError } = await supabase
    .from('songs')
    .insert([{ title, artist, album, genre, release_year, track_number, duration, album_art_url }])
    .single();

    if (songError) return res.status(400).send(songError.message);

    // Save fingerprint to Supabase
    const { data: fingerprintData, error: fingerprintError } = await supabase
    .from('fingerprints')
    .insert([{ song_id: songData.id, fingerprint }]);

    if (fingerprintError) return res.status(400).send(fingerprintError.message);

    res.send('Song uploaded and processed');
});

// Endpoint to match a song
app.post('/match', upload.single('song'), async (req, res) => {
    const songBuffer = req.file.buffer;
  
    // Generate fingerprint
    const fingerprint = await chromaprint.songBuffer(songBuffer);
  
    // Match fingerprint with database
    const { data: fingerprintData, error: fingerprintError } = await supabase
      .from('fingerprints')
      .select()
      .eq('fingerprint', fingerprint)
      .single();
  
    if (fingerprintError || !fingerprintData) return res.status(400).send('No match found.');
  
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select()
      .eq('id', fingerprintData.song_id)
      .single();
  
    if (songError) return res.status(400).send(songError.message);
  
    res.send(`Song matched: ${songData.title} by ${songData.artist}`);
  });
