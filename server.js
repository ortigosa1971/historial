const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Base de datos
const db = new sqlite3.Database('./clima.db');

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API: clima histórico
app.get('/api/clima-historico', (req, res) => {
  db.all('SELECT * FROM registro_diario ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error al leer la base de datos:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'clima.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
