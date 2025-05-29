const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const { format, subDays } = require('date-fns');

// API y estación configuradas
const API_KEY = 'e19cf0d935fc49329cf0d935fc5932cc';
const STATION_ID = 'IALFAR30';

const db = new sqlite3.Database('./clima.db');

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS registro_diario (
    fecha TEXT PRIMARY KEY,
    temp_max REAL,
    temp_min REAL,
    lluvia REAL
  )
`);

async function obtenerDatos(dia) {
  const url = `https://api.weather.com/v2/pws/history/daily?stationId=${STATION_ID}&format=json&units=m&date=${dia}&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const resumen = data.summaries?.[0];
    if (!resumen) {
      console.warn(`⚠️ No hay datos para ${dia}`);
      return;
    }

    const tempMax = resumen.metric.tempHigh;
    const tempMin = resumen.metric.tempLow;
    const lluvia = resumen.metric.precipTotal;

    console.log(`✅ ${dia} | Max: ${tempMax} °C | Min: ${tempMin} °C | Lluvia: ${lluvia} mm`);

    db.run(
      "INSERT OR REPLACE INTO registro_diario (fecha, temp_max, temp_min, lluvia) VALUES (?, ?, ?, ?)",
      [dia, tempMax, tempMin, lluvia]
    );
  } catch (error) {
    console.error(`❌ Error en ${dia}:`, error.message);
  }
}

async function principal() {
  const dias = 7;
  for (let i = dias; i >= 0; i--) {
    const fecha = format(subDays(new Date(), i), 'yyyyMMdd');
    await obtenerDatos(fecha);
  }
  db.close();
}

principal();
