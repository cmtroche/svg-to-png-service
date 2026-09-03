const express = require('express');
const sharp = require('sharp');

const app = express();

// Acepta el SVG como cuerpo crudo (raw), sin importar el content-type exacto
// que le mande n8n (image/svg+xml, text/plain, application/octet-stream, etc.)
app.use(express.raw({ type: '*/*', limit: '15mb' }));

app.get('/', (req, res) => {
  res.send('svg-to-png-service OK. POST un SVG a /convert y te devuelve el PNG.');
});

app.post('/convert', async (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: 'No se recibio ningun contenido en el body.' });
    }

    // sharp respeta el width/height declarados en el propio <svg ...> del archivo,
    // asi que el PNG resultante sale exactamente al tamano de canvas que arma n8n.
    const png = await sharp(req.body, { density: 96 }).png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    console.error('Error convirtiendo SVG a PNG:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`svg-to-png-service escuchando en el puerto ${PORT}`);
});
