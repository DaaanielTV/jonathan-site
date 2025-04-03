const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Stelle die Datei "photography-portfolio.html" bereit
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'photography-portfolio.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
